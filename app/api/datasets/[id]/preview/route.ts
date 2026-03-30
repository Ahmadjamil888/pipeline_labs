import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, STORAGE_BUCKETS, downloadFromStorage } from '@/lib/clerk-supabase';
import { parseFile, dataframeToCsv, dataframeToJson } from '@/lib/preprocessing';
import * as XLSX from 'xlsx';

// Get dataset preview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rows = parseInt(searchParams.get('rows') || '10', 10);

    // Get dataset
    const { data: dataset, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (datasetError || !dataset) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Dataset not found' } },
        { status: 404 }
      );
    }

    // Download and parse file
    const fileBlob = await downloadFromStorage(
      STORAGE_BUCKETS.DATASETS,
      dataset.storage_path
    );
    const arrayBuffer = await fileBlob.arrayBuffer();
    const df = await parseFile(arrayBuffer, dataset.file_type);

    // Get preview rows - use head() for first N rows
    const previewRows = Math.min(rows, df.shape[0]);
    const previewDf = df.head(previewRows);

    // Build column info — columns is stored as [{ name, type }]
    const columnDefs: { name: string; type: string }[] = dataset.columns ?? [];
    const columns = columnDefs.map(({ name, type }) => ({
      name,
      type,
      sample: Array.from(previewDf.column(name).values()).slice(0, 5).map(String),
    }));

    return NextResponse.json({
      columns,
      rows: dataframeToJson(previewDf),
      totalRows: df.shape[0],
      totalColumns: df.shape[1],
    });

  } catch (error) {
    console.error('Dataset preview error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate preview' } },
      { status: 500 }
    );
  }
}
