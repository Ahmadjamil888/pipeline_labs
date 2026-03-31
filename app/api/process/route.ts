import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { supabaseAdmin } from '@/lib/clerk-supabase';
import { getDatasetStats, parseFile } from '@/lib/preprocessing';
import { authenticateRequest } from '@/lib/request-auth';
import { STORAGE_BUCKETS, downloadFromStorage, getStorageBackendName, storeFileBuffer } from '@/lib/server-storage';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

type Row = Record<string, unknown>;
type Plan = {
  summary: string;
  chunkInstructions: string;
  chunkSize: number;
  fillMissing: 'none' | 'median' | 'mode';
  trimWhitespace: boolean;
  standardizeCategories: boolean;
  normalizeNumericStrings: boolean;
  removeDuplicates: boolean;
};

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function keyify(value: string) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function isMissing(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  return ['', 'na', 'n/a', 'null', 'none', 'undefined', '?', '-'].includes(value.trim().toLowerCase());
}

function extractJson(content: string) {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  return start >= 0 && end > start ? content.slice(start, end + 1) : content;
}

async function callOpenRouter(system: string, payload: unknown, maxTokens = 2200) {
  if (!process.env.OPENROUTER_API_KEY) return null;
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Pipeline Labs',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!response.ok) {
    console.error('OpenRouter error:', await response.text());
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function buildPlan(prompt: string, columns: string[], columnTypes: Record<string, string>, missingValues: Record<string, number>): Promise<Plan> {
  const fallback: Plan = {
    summary: 'Chunked dataset cleaning plan.',
    chunkInstructions: 'Keep the same rows and columns. Clean values only. Preserve row relationships.',
    chunkSize: Math.max(30, Math.min(140, Math.floor(900 / Math.max(columns.length, 1)))),
    fillMissing: /missing|null|ready to train/i.test(prompt) ? 'median' : 'none',
    trimWhitespace: true,
    standardizeCategories: true,
    normalizeNumericStrings: true,
    removeDuplicates: /duplicate/i.test(prompt),
  };

  const content = await callOpenRouter(
    'You create strict JSON cleaning plans for chunked dataset processing. Return only JSON with keys summary, chunkInstructions, chunkSize, fillMissing, trimWhitespace, standardizeCategories, normalizeNumericStrings, removeDuplicates.',
    { prompt, columns, columnTypes, missingValues },
    700,
  );

  if (!content) return fallback;

  try {
    const parsed = JSON.parse(extractJson(content)) as Partial<Plan>;
    return {
      ...fallback,
      ...parsed,
      chunkSize: Math.max(25, Math.min(150, Number(parsed.chunkSize || fallback.chunkSize))),
    };
  } catch {
    return fallback;
  }
}

function buildSharedMemory(rows: Row[], columns: string[], columnTypes: Record<string, string>) {
  const categoryMap: Record<string, Record<string, string>> = {};
  for (const column of columns) {
    if (columnTypes[column] !== 'string') continue;
    const values = [...new Set(rows.map((row) => row[column]).filter((value): value is string => typeof value === 'string').map(normalizeText))];
    if (values.length === 0 || values.length > 200) continue;
    categoryMap[column] = Object.fromEntries(values.map((value) => [keyify(value), value]));
  }
  return { categoryMap };
}

function applyFallbackCleaning(rows: Row[], columns: string[], columnTypes: Record<string, string>, plan: Plan, sharedMemory: ReturnType<typeof buildSharedMemory>) {
  const numericFill: Record<string, number | null> = {};
  const modeFill: Record<string, unknown> = {};

  for (const column of columns) {
    const values = rows.map((row) => row[column]).filter((value) => !isMissing(value));
    modeFill[column] = values[0] ?? null;
    const numeric = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    if (numeric.length > 0) {
      const sorted = [...numeric].sort((a, b) => a - b);
      numericFill[column] = sorted[Math.floor(sorted.length / 2)];
    } else {
      numericFill[column] = null;
    }
  }

  return rows.map((row) => {
    const cleaned: Row = { ...row };
    for (const column of columns) {
      let value = cleaned[column];

      if (isMissing(value)) {
        if (plan.fillMissing === 'median' && columnTypes[column] === 'float64') value = numericFill[column];
        if (plan.fillMissing === 'mode') value = modeFill[column];
        cleaned[column] = value ?? null;
        continue;
      }

      if (typeof value === 'string') {
        const stringValue = plan.trimWhitespace ? normalizeText(value) : value;
        value = stringValue;
        if (plan.normalizeNumericStrings && columnTypes[column] === 'float64') {
          const numberValue = Number(stringValue.replace(/,/g, ''));
          if (Number.isFinite(numberValue)) value = numberValue;
        }
        if (plan.standardizeCategories && sharedMemory.categoryMap[column]) {
          const mapped = sharedMemory.categoryMap[column][keyify(String(value))];
          if (mapped) value = mapped;
        }
      }

      cleaned[column] = value;
    }
    return cleaned;
  });
}

function toCsv(rows: Row[], columns: string[]) {
  const esc = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const text = String(value);
    return /[,"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [columns.join(','), ...rows.map((row) => columns.map((column) => esc(row[column])).join(','))].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const requestAuth = await authenticateRequest(request);
    if (!requestAuth) return jsonError('UNAUTHORIZED', 'Authentication required', 401);
    const profileId = requestAuth.profileId;

    const { datasetId, prompt, options = {} } = await request.json();
    if (!datasetId || !prompt) return jsonError('BAD_REQUEST', 'Missing required fields: datasetId and prompt', 400);

    const { data: dataset } = await supabaseAdmin.from('datasets').select('*').eq('id', datasetId).eq('user_id', profileId).eq('is_deleted', false).single();
    if (!dataset) return jsonError('NOT_FOUND', 'Dataset not found', 404);

    const jobId = uuidv4();
    const startedAt = new Date().toISOString();
    await supabaseAdmin.from('processing_jobs').insert({
      id: jobId,
      user_id: profileId,
      dataset_id: datasetId,
      prompt,
      status: 'processing',
      current_step: 1,
      total_steps: 3,
      started_at: startedAt,
      progress_messages: [{ step: 1, message: 'Loading dataset and preparing chunk plan.', timestamp: startedAt }],
    });

    await supabaseAdmin.from('datasets').update({ status: 'processing' }).eq('id', datasetId).eq('user_id', profileId);

    const blob = await downloadFromStorage(STORAGE_BUCKETS.DATASETS, dataset.storage_path);
    const arrayBuffer = await blob.arrayBuffer();
    const df = await parseFile(arrayBuffer, dataset.file_type);
    const rows = df.rows.map((row) => ({ ...row }));
    const columns = [...df.cols];
    const stats = getDatasetStats(df);
    const plan = await buildPlan(prompt, columns, stats.columnTypes, stats.missingValues);
    const sharedMemory = buildSharedMemory(rows, columns, stats.columnTypes);

    const totalChunks = Math.max(1, Math.ceil(rows.length / plan.chunkSize));
    const output: Row[] = [];
    const seen = new Set<string>();

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      const chunkRows = rows.slice(chunkIndex * plan.chunkSize, (chunkIndex + 1) * plan.chunkSize);
      const content = await callOpenRouter(
        'You clean one dataset chunk. Return only JSON with {"rows":[...]}. Keep identical row count and same columns. Do not drop rows. Do not invent values outside the schema.',
        {
          prompt,
          columns,
          columnTypes: stats.columnTypes,
          sharedMemory,
          chunkIndex: chunkIndex + 1,
          totalChunks,
          instructions: plan.chunkInstructions,
          rows: chunkRows,
        },
      );

      let cleanedChunk = chunkRows;
      if (content) {
        try {
          const parsed = JSON.parse(extractJson(content)) as { rows?: unknown };
          if (Array.isArray(parsed.rows) && parsed.rows.length === chunkRows.length) {
            cleanedChunk = parsed.rows.map((row, rowIndex) => {
              const next: Row = {};
              for (const column of columns) next[column] = typeof row === 'object' && row && !Array.isArray(row) && (row as Row)[column] !== undefined ? (row as Row)[column] : chunkRows[rowIndex][column];
              return next;
            });
          }
        } catch {
          cleanedChunk = chunkRows;
        }
      }

      cleanedChunk = applyFallbackCleaning(cleanedChunk, columns, stats.columnTypes, plan, sharedMemory);

      for (const row of cleanedChunk) {
        if (plan.removeDuplicates) {
          const key = JSON.stringify(columns.map((column) => row[column]));
          if (seen.has(key)) continue;
          seen.add(key);
        }
        output.push(row);
      }
    }

    const outputFormat = options.outputFormat === 'json' ? 'json' : 'csv';
    const outputDatasetId = uuidv4();
    const fileNameBase = dataset.original_filename.replace(/\.[^/.]+$/, '');
    const outputFileName = `${fileNameBase}_cleaned.${outputFormat}`;
    const content = outputFormat === 'json' ? JSON.stringify(output, null, 2) : toCsv(output, columns);
    const outputPath = `${profileId}/${outputDatasetId}/processed/${Date.now()}_${outputFileName}`;

    const stored = await storeFileBuffer(
      STORAGE_BUCKETS.PROCESSED,
      outputPath,
      Buffer.from(content),
      outputFormat === 'json' ? 'application/json' : 'text/csv',
    );
    const completedAt = new Date().toISOString();
    const durationMs = Date.parse(completedAt) - Date.parse(startedAt);
    const operationsApplied = [
      'Chunked dataset cleaning',
      'Row-wise LLM editing',
      'Schema-preserving validation',
      ...(plan.removeDuplicates ? ['Duplicate removal'] : []),
      ...(plan.fillMissing !== 'none' ? [`Missing value handling (${plan.fillMissing})`] : []),
    ];

    await supabaseAdmin.from('datasets').insert({
      id: outputDatasetId,
      user_id: profileId,
      name: `${dataset.name} Cleaned`,
      original_filename: outputFileName,
      file_size_bytes: Buffer.byteLength(content),
      file_type: outputFormat,
      storage_path: stored.storagePath,
      storage_url: stored.storageUrl,
      row_count: output.length,
      column_count: columns.length,
      columns: columns.map((name) => ({ name, type: stats.columnTypes[name] ?? 'unknown' })),
      status: 'processed',
      description: `Generated from ${dataset.name} using chunked AI cleaning.`,
    });

    await supabaseAdmin.from('datasets').update({ status: 'processed' }).eq('id', datasetId).eq('user_id', profileId);
    await supabaseAdmin.from('processing_jobs').update({
      status: 'complete',
      output_dataset_id: outputDatasetId,
      generated_plan: plan,
      transformations_applied: { operationsApplied, model: process.env.OPENROUTER_API_KEY ? MODEL : null, storageBackend: getStorageBackendName() },
      rows_affected: output.length,
      columns_affected: columns.length,
      preview_data: { columns, rows: output.slice(0, 10), totalRows: output.length, totalColumns: columns.length },
      download_url: `/api/datasets/${outputDatasetId}/download`,
      completed_at: completedAt,
      duration_ms: durationMs,
      current_step: 3,
      total_steps: 3,
      progress_messages: [
        { step: 1, message: 'Loading dataset and preparing chunk plan.', timestamp: startedAt },
        { step: 2, message: `Processed ${totalChunks} chunk${totalChunks === 1 ? '' : 's'} with shared category memory.`, timestamp: new Date().toISOString() },
        { step: 3, message: 'Saved cleaned dataset.', timestamp: completedAt },
      ],
    }).eq('id', jobId);

    return NextResponse.json({
      jobId,
      datasetId,
      processedDatasetId: outputDatasetId,
      status: 'completed',
      downloadUrl: `/api/datasets/${outputDatasetId}/download`,
      previewUrl: `/api/datasets/${outputDatasetId}/preview`,
      summary: {
        originalRows: rows.length,
        originalColumns: columns.length,
        processedRows: output.length,
        processedColumns: columns.length,
        operationsApplied,
        llmInstructions: plan.chunkInstructions,
        processingDurationMs: durationMs,
        chunkCount: totalChunks,
        chunkSize: plan.chunkSize,
        storageBackend: getStorageBackendName(),
      },
    });
  } catch (error) {
    console.error('Process API error:', error);
    return jsonError('INTERNAL_ERROR', error instanceof Error ? error.message : 'Processing failed', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const requestAuth = await authenticateRequest(request);
    if (!requestAuth) return jsonError('UNAUTHORIZED', 'Authentication required', 401);
    const profileId = requestAuth.profileId;

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    if (!jobId) return jsonError('BAD_REQUEST', 'Missing jobId parameter', 400);

    const { data: job } = await supabaseAdmin.from('processing_jobs').select('*').eq('id', jobId).eq('user_id', profileId).single();
    if (!job) return jsonError('NOT_FOUND', 'Job not found', 404);

    return NextResponse.json({
      jobId: job.id,
      datasetId: job.dataset_id,
      processedDatasetId: job.output_dataset_id,
      status: job.status,
      currentStep: job.current_step,
      totalSteps: job.total_steps,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      downloadUrl: job.download_url,
      previewData: job.preview_data,
      plan: job.generated_plan,
      progressMessages: job.progress_messages || [],
      error: job.error_message,
    });
  } catch (error) {
    console.error('Get job status error:', error);
    return jsonError('INTERNAL_ERROR', 'Failed to fetch job status', 500);
  }
}
