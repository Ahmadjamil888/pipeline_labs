import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/clerk-supabase';
import { parseFile, getDatasetStats } from '@/lib/preprocessing';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest } from '@/lib/request-auth';
import { STORAGE_BUCKETS, deleteFromStorage, downloadFromStorage, storeFileBuffer } from '@/lib/server-storage';

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_CHUNKED_SIZE = 500 * 1024 * 1024;
const SIMPLE_UPLOAD_LIMIT = 50 * 1024 * 1024;

type UploadSession = {
  chunks: number[];
  totalChunks: number;
  fileInfo: {
    filename: string;
    fileSize: number;
    fileType: string;
    profileId: string;
  };
};

type ChunkInitBody = {
  action: 'init';
  filename: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
};

const chunkSessions = new Map<string, UploadSession>();

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function getFileType(filename: string): 'csv' | 'xlsx' | 'xls' | 'json' {
  const ext = getFileExtension(filename);
  if (ext === 'csv') return 'csv';
  if (ext === 'xlsx') return 'xlsx';
  if (ext === 'xls') return 'xls';
  if (ext === 'json') return 'json';
  throw new Error(`Unsupported file type: ${ext}`);
}

// Named export for POST - required by Next.js App Router
export async function POST(request: NextRequest) {
  try {
    const requestAuth = await authenticateRequest(request);

    if (!requestAuth) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    const profileId = requestAuth.profileId;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json() as {
        action?: string;
        filename?: string;
        fileSize?: number;
        fileType?: string;
        totalChunks?: number;
        sessionId?: string;
      };
      
      if (body.action === 'init' && body.filename && body.fileSize && body.totalChunks) {
        return initChunkedUpload(body as ChunkInitBody, profileId);
      }
      
      if (body.action === 'finalize' && body.sessionId) {
        return finalizeChunkedUpload(body.sessionId, profileId);
      }
      
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid JSON action' } },
        { status: 400 }
      );
    }
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const sessionId = formData.get('sessionId') as string;
      const chunkIndex = parseInt(formData.get('chunkIndex') as string);
      const totalChunks = parseInt(formData.get('totalChunks') as string);
      const chunk = formData.get('chunk') as File;
      const filename = formData.get('filename') as string;
      const fileType = formData.get('fileType') as string;
      
      if (sessionId && !isNaN(chunkIndex) && chunk) {
        return uploadChunk(sessionId, chunkIndex, totalChunks, chunk, filename, fileType, profileId);
      }
      
      return handleRegularUpload(formData, profileId);
    }
    
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid request format' } },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

async function initChunkedUpload(body: ChunkInitBody, profileId: string) {
  const { filename, fileSize, fileType, totalChunks } = body;
  
  if (fileSize > MAX_CHUNKED_SIZE) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'File exceeds 500MB maximum size' } },
      { status: 400 }
    );
  }
  
  const sessionId = uuidv4();
  
  chunkSessions.set(sessionId, {
    chunks: [],
    totalChunks,
    fileInfo: { filename, fileSize, fileType, profileId }
  });
  
  return NextResponse.json({
    sessionId,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    message: 'Upload session initialized'
  });
}

async function uploadChunk(
  sessionId: string,
  chunkIndex: number,
  totalChunks: number,
  chunk: File,
  filename: string,
  fileType: string,
  profileId: string
) {
  try {
    const session = chunkSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Upload session not found' } },
        { status: 404 }
      );
    }

    // Look up profile UUID for storage path
    const chunkPath = `${profileId}/chunks/${sessionId}/${chunkIndex}`;
    const bytes = await chunk.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await storeFileBuffer(STORAGE_BUCKETS.DATASETS, chunkPath, buffer, 'application/octet-stream');
    
    session.chunks.push(chunkIndex);
    const isComplete = session.chunks.length === totalChunks;
    
    return NextResponse.json({
      success: true,
      chunkIndex,
      uploadedChunks: session.chunks.length,
      totalChunks,
      isComplete,
      sessionId
    });
    
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload chunk' } },
      { status: 500 }
    );
  }
}

async function finalizeChunkedUpload(sessionId: string, profileId: string) {
  const session = chunkSessions.get(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Upload session not found' } },
      { status: 404 }
    );
  }
  
  try {
    const { fileInfo, totalChunks } = session;

    const chunks: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `${profileId}/chunks/${sessionId}/${i}`;
      const data = await downloadFromStorage(STORAGE_BUCKETS.DATASETS, chunkPath);
      chunks.push(Buffer.from(await data.arrayBuffer()));
    }
    
    const finalBuffer = Buffer.concat(chunks);
    
    const validatedType = getFileType(fileInfo.filename);
    let rowCount = 0;
    let columnCount = 0;
    let columnNames: string[] = [];
    let columnTypes: Record<string, string> = {};

    try {
      const df = await parseFile(finalBuffer, validatedType);
      const stats = getDatasetStats(df);
      
      if (stats.rowCount > 250000) {
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Dataset exceeds maximum 250,000 rows' } },
          { status: 400 }
        );
      }
      rowCount = stats.rowCount;
      columnCount = stats.columnCount;
      columnNames = stats.columnNames;
      columnTypes = stats.columnTypes;
    } catch {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid or corrupted file. Please check your file format.' } },
        { status: 400 }
      );
    }
    
    const datasetId = uuidv4();
    const timestamp = Date.now();
    const safeFileName = fileInfo.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalPath = `${profileId}/${datasetId}/${timestamp}_${safeFileName}`;
    
    const stored = await storeFileBuffer(STORAGE_BUCKETS.DATASETS, finalPath, finalBuffer, getContentType(validatedType));
    
    const { data: dataset, error: dbError } = await supabaseAdmin
      .from('datasets')
      .insert({
        id: datasetId,
        user_id: profileId,
        name: fileInfo.filename.replace(/\.[^/.]+$/, ''),
        original_filename: fileInfo.filename,
        storage_path: stored.storagePath,
        storage_url: stored.storageUrl,
        file_size_bytes: fileInfo.fileSize,
        file_type: validatedType,
        row_count: rowCount,
        column_count: columnCount,
        columns: columnNames.map((name) => ({ name, type: columnTypes[name] ?? 'unknown' })),
        status: 'uploaded'
      })
      .select()
      .single();
    
    if (dbError) {
      await deleteFromStorage(STORAGE_BUCKETS.DATASETS, [stored.storagePath]);
      throw new Error('Failed to create dataset record');
    }
    
    // Clean up chunks
    const chunkPaths = [];
    for (let i = 0; i < totalChunks; i++) {
      chunkPaths.push(`${profileId}/chunks/${sessionId}/${i}`);
    }
    await deleteFromStorage(STORAGE_BUCKETS.DATASETS, chunkPaths);
    chunkSessions.delete(sessionId);
    
    return NextResponse.json({
      id: datasetId,
      path: stored.storagePath,
      publicUrl: stored.storageUrl,
      name: fileInfo.filename.replace(/\.[^/.]+$/, ''),
      size: fileInfo.fileSize,
      type: validatedType,
      rowCount,
      columnCount,
      createdAt: dataset.created_at
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to finalize upload' } },
      { status: 500 }
    );
  }
}

async function handleRegularUpload(formData: FormData, profileId: string) {
  const file = formData.get('file') as File;
  const customName = formData.get('name') as string | undefined;
  
  if (!file) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'No file provided' } },
      { status: 400 }
    );
  }

  if (file.size > MAX_CHUNKED_SIZE) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'File exceeds 500MB maximum size' } },
      { status: 400 }
    );
  }
  
  const fileType = getFileType(file.name);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Parse file to get stats
  let rowCount = 0;
  let columnCount = 0;
  let columnNames: string[] = [];
  let columnTypes: Record<string, string> = {};

  try {
    const df = await parseFile(buffer, fileType);
    const stats = getDatasetStats(df);
    
    if (stats.rowCount > 250000) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Dataset exceeds maximum 250,000 rows' } },
        { status: 400 }
      );
    }
    rowCount = stats.rowCount;
    columnCount = stats.columnCount;
    columnNames = stats.columnNames;
    columnTypes = stats.columnTypes;
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid or corrupted file. Please check your file format.' } },
      { status: 400 }
    );
  }
  
  const datasetId = uuidv4();
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${profileId}/${datasetId}/${timestamp}_${safeFileName}`;
  
  const stored = await storeFileBuffer(
    STORAGE_BUCKETS.DATASETS,
    storagePath,
    buffer,
    file.type || getContentType(fileType),
  );
  
  const { data: dataset, error: dbError } = await supabaseAdmin
    .from('datasets')
    .insert({
      id: datasetId,
      user_id: profileId,
      name: customName || file.name.replace(/\.[^/.]+$/, ''),
      original_filename: file.name,
      storage_path: stored.storagePath,
      storage_url: stored.storageUrl,
      file_size_bytes: file.size,
      file_type: fileType,
      row_count: rowCount,
      column_count: columnCount,
      columns: columnNames.map((name) => ({ name, type: columnTypes[name] ?? 'unknown' })),
      status: 'uploaded'
    })
    .select()
    .single();
  
  if (dbError) {
    console.error('Database insert error:', dbError);
    await deleteFromStorage(STORAGE_BUCKETS.DATASETS, [stored.storagePath]);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: `Failed to create dataset record: ${dbError.message}` } },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    id: datasetId,
    path: stored.storagePath,
    publicUrl: stored.storageUrl,
    name: customName || file.name.replace(/\.[^/.]+$/, ''),
    size: file.size,
    type: fileType,
    rowCount,
    columnCount,
    createdAt: dataset.created_at
  });
}

function getContentType(fileType: string): string {
  const types: Record<string, string> = {
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    json: 'application/json'
  };
  return types[fileType] || 'application/octet-stream';
}
