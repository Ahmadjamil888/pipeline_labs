import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, STORAGE_BUCKETS, downloadFromStorage } from '@/lib/clerk-supabase';
import { parseFile, dataframeToCsv, dataframeToJson } from '@/lib/preprocessing';
import * as XLSX from 'xlsx';
import { authenticateRequest } from '@/lib/request-auth';

// Download dataset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestAuth = await authenticateRequest(request);

    if (!requestAuth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    const profileId = requestAuth.profileId;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const processed = searchParams.get('processed') === 'true';

    // Get dataset
    const { data: dataset, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('id', id)
      .eq('user_id', profileId)
      .single();

    if (datasetError || !dataset) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Dataset not found' } },
        { status: 404 }
      );
    }

    // Determine which file to download
    const storagePath = processed && dataset.processed_path 
      ? dataset.processed_path 
      : dataset.storage_path;
    const bucket = processed && dataset.processed_path 
      ? STORAGE_BUCKETS.PROCESSED 
      : STORAGE_BUCKETS.DATASETS;

    // Download file
    const fileBlob = await downloadFromStorage(bucket, storagePath);
    const arrayBuffer = await fileBlob.arrayBuffer();

    // Convert format if needed
    let outputBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;

    if (format === 'json') {
      const df = await parseFile(arrayBuffer, dataset.file_type);
      const jsonData = dataframeToJson(df);
      outputBuffer = Buffer.from(JSON.stringify(jsonData, null, 2));
      contentType = 'application/json';
      fileExtension = 'json';
    } else if (format === 'xlsx') {
      const df = await parseFile(arrayBuffer, dataset.file_type);
      const jsonData = dataframeToJson(df);
      const ws = XLSX.utils.json_to_sheet(jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      outputBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExtension = 'xlsx';
    } else {
      // CSV format - use raw file if original, otherwise convert
      if (!processed && dataset.file_type === 'csv') {
        outputBuffer = Buffer.from(arrayBuffer);
      } else {
        const df = await parseFile(arrayBuffer, dataset.file_type);
        const csvData = dataframeToCsv(df);
        outputBuffer = Buffer.from(csvData);
      }
      contentType = 'text/csv';
      fileExtension = 'csv';
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      user_id: profileId,
      action: 'dataset.download',
      entity_type: 'dataset',
      entity_id: id,
      metadata: { format, processed },
    });

    // Return file
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${dataset.name}.${fileExtension}"`,
      },
    });

  } catch (error) {
    console.error('Download dataset error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to download dataset' } },
      { status: 500 }
    );
  }
}
