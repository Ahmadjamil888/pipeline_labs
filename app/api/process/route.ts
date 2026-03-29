import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, STORAGE_BUCKETS, getPublicUrl, downloadFromStorage } from '@/lib/clerk-supabase';
import { 
  preprocessDataset, 
  parseInstructions, 
  parseFile, 
  dataframeToCsv,
  dataframeToJson,
  getDatasetStats 
} from '@/lib/preprocessing';
import { getCache, setCache, queueJob, updateJobStatus } from '@/lib/redis';

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use OpenRouter with available model
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

// Call OpenRouter LLM for preprocessing instructions
async function getLLMInstructions(
  userPrompt: string,
  datasetInfo: {
    columns: string[];
    types: Record<string, string>;
    rowCount: number;
  }
): Promise<{
  instructions: string;
  suggestedOperations: string[];
  options: Record<string, unknown>;
}> {
  const systemPrompt = `You are an expert data scientist and ML engineer. 
Analyze the user's preprocessing request and provide clear, specific instructions.

Dataset Info:
- Columns: ${datasetInfo.columns.join(', ')}
- Types: ${JSON.stringify(datasetInfo.types)}
- Rows: ${datasetInfo.rowCount}

Respond in JSON format with:
{
  "instructions": "Detailed step-by-step preprocessing instructions",
  "suggestedOperations": ["operation1", "operation2", ...],
  "options": { "normalize": true/false, "encoding": "onehot/label/none", ... }
}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', errorText);
    // Return fallback instead of throwing
    return {
      instructions: `Preprocess the data according to: ${userPrompt}`,
      suggestedOperations: ['normalize', 'encoding'],
      options: { normalize: true, encoding: 'onehot' },
    };
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    return {
      instructions: `Preprocess the data according to: ${userPrompt}`,
      suggestedOperations: ['normalize', 'encoding'],
      options: { normalize: true, encoding: 'onehot' },
    };
  }
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback if JSON parsing fails
    const parsedOptions = parseInstructions(userPrompt);
    return {
      instructions: content,
      suggestedOperations: parsedOptions ? ['normalize', 'encoding'] : [],
      options: (parsedOptions || {}) as Record<string, unknown>,
    };
  }
}

// Main processing function
export async function POST(request: NextRequest) {
  try {
    // Get auth from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { datasetId, prompt, options = {} } = body;

    if (!datasetId || !prompt) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing required fields: datasetId, prompt' } },
        { status: 400 }
      );
    }

    // Resolve profile UUID from Clerk userId
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User profile not found' } },
        { status: 401 }
      );
    }

    const profileId = profile.id;

    // Get dataset info
    const { data: dataset, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .eq('user_id', profileId)
      .single();

    if (datasetError || !dataset) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Dataset not found' } },
        { status: 404 }
      );
    }

    // Check if async processing requested
    if (options.async) {
      const jobId = await queueJob('dataset-processing', {
        datasetId,
        userId: profileId,
        prompt,
        options,
      });

      // Create processing job record
      await supabaseAdmin.from('processing_jobs').insert({
        id: jobId,
        dataset_id: datasetId,
        user_id: profileId,
        prompt,
        options,
        status: 'queued',
      });

      // Update dataset status
      await supabaseAdmin
        .from('datasets')
        .update({ status: 'processing', processing_instructions: prompt })
        .eq('id', datasetId);

      return NextResponse.json({
        jobId,
        datasetId,
        status: 'queued',
        message: 'Processing queued. Check status at /api/process/{jobId}/status',
      }, { status: 202 });
    }

    // Synchronous processing
    try {
      // Download file from storage
      const fileBlob = await downloadFromStorage(STORAGE_BUCKETS.DATASETS, dataset.storage_path);
      const arrayBuffer = await fileBlob.arrayBuffer();

      // Parse file
      const df = await parseFile(arrayBuffer, dataset.file_type);
      const stats = getDatasetStats(df);

      // Get LLM instructions
      const llmResponse = await getLLMInstructions(prompt, {
        columns: stats.columnNames,
        types: stats.columnTypes,
        rowCount: stats.rowCount,
      });

      // Parse options from LLM response and user prompt
      const processOptions = {
        ...parseInstructions(prompt),
        ...llmResponse.options,
      };

      // Process the data
      const startTime = Date.now();
      const result = await preprocessDataset(df, processOptions);
      const processingDuration = Date.now() - startTime;

      // Generate output
      let outputData: string | Buffer;
      let outputFormat = options.outputFormat || 'csv';

      if (outputFormat === 'json') {
        outputData = JSON.stringify(dataframeToJson(result.data));
      } else {
        outputData = dataframeToCsv(result.data);
      }

      // Upload processed file
      const processedFileName = `processed_${dataset.id}.${outputFormat}`;
      const processedPath = `${userId}/${dataset.id}/processed/${Date.now()}_${processedFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.PROCESSED)
        .upload(processedPath, outputData, {
          contentType: outputFormat === 'csv' ? 'text/csv' : 'application/json',
        });

      if (uploadError) {
        throw new Error(`Failed to upload processed file: ${uploadError.message}`);
      }

      // Update dataset record
      const processedStats = getDatasetStats(result.data);
      const { error: updateError } = await supabaseAdmin
        .from('datasets')
        .update({
          status: 'completed',
          processed_path: processedPath,
          processing_results: {
            operations_applied: result.operationsApplied,
            original_shape: result.originalShape,
            processed_shape: result.processedShape,
            column_changes: result.columnChanges,
            llm_instructions: llmResponse.instructions,
          },
          row_count: processedStats.rowCount,
          column_count: processedStats.columnCount,
          processed_at: new Date().toISOString(),
          llm_model_used: 'anthropic/claude-3.5-sonnet',
        })
        .eq('id', datasetId);

      if (updateError) {
        console.error('Failed to update dataset:', updateError);
      }

      // Log activity
      await supabaseAdmin.from('activity_logs').insert({
        user_id: profileId,
        action: 'dataset.process',
        entity_type: 'dataset',
        entity_id: datasetId,
        metadata: {
          prompt,
          operations: result.operationsApplied,
          duration_ms: processingDuration,
          original_rows: result.originalShape[0],
          processed_rows: result.processedShape[0],
        },
      });

      // Generate download URL
      const downloadUrl = getPublicUrl(STORAGE_BUCKETS.PROCESSED, processedPath);

      return NextResponse.json({
        datasetId,
        processedDatasetId: datasetId,
        status: 'completed',
        downloadUrl,
        previewUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/datasets/${datasetId}/preview`,
        summary: {
          originalRows: result.originalShape[0],
          originalColumns: result.originalShape[1],
          processedRows: result.processedShape[0],
          processedColumns: result.processedShape[1],
          operationsApplied: result.operationsApplied,
          llmInstructions: llmResponse.instructions,
          processingDurationMs: processingDuration,
        },
      }, { status: 200 });

    } catch (processError) {
      console.error('Processing error:', processError);

      // Update dataset status to failed
      await supabaseAdmin
        .from('datasets')
        .update({
          status: 'failed',
          processing_error: processError instanceof Error ? processError.message : 'Unknown error',
        })
        .eq('id', datasetId);

      return NextResponse.json({
        error: {
          code: 'PROCESSING_ERROR',
          message: processError instanceof Error ? processError.message : 'Processing failed',
        },
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Process API error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

// Get processing job status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing jobId parameter' } },
        { status: 400 }
      );
    }

    // Resolve profile UUID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const profileId = profile?.id;

    // Get job from database
    const { data: job, error: jobError } = await supabaseAdmin
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', profileId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Job not found' } },
        { status: 404 }
      );
    }

    // Check Redis for more recent updates
    const cachedJob = await getCache<Record<string, unknown>>(jobId);

    return NextResponse.json({
      jobId,
      datasetId: job.dataset_id,
      status: cachedJob?.status || job.status,
      progress: cachedJob?.progress || job.progress_percent || 0,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      error: job.error_message,
      result: cachedJob?.result || null,
    });

  } catch (error) {
    console.error('Get job status error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
