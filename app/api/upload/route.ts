import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, STORAGE_BUCKETS, getPublicUrl } from '@/lib/clerk-supabase';
import { parseFile, getDatasetStats } from '@/lib/preprocessing';
import { v4 as uuidv4 } from 'uuid';

const CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_CHUNKED_SIZE = 500 * 1024 * 1024;
const SIMPLE_UPLOAD_LIMIT = 50 * 1024 * 1024;

const chunkSessions = new Map<string, { chunks: number[]; totalChunks: number; fileInfo: any }>();

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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      
      if (body.action === 'init' && body.filename && body.fileSize && body.totalChunks) {
        return initChunkedUpload(body, userId);
      }
      
      if (body.action === 'finalize' && body.sessionId) {
        return finalizeChunkedUpload(body.sessionId, userId);
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
        return uploadChunk(sessionId, chunkIndex, totalChunks, chunk, filename, fileType, userId);
      }
      
      return handleRegularUpload(formData, userId);
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

async function initChunkedUpload(body: any, userId: string) {
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
    fileInfo: { filename, fileSize, fileType, userId }
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
  userId: string
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
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const profileId = profile?.id || userId;
    const chunkPath = `${profileId}/chunks/${sessionId}/${chunkIndex}`;
    const bytes = await chunk.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.DATASETS)
      .upload(chunkPath, buffer, {
        contentType: 'application/octet-stream',
        upsert: true
      });
    
    if (uploadError) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload chunk' } },
        { status: 500 }
      );
    }
    
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
    
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload chunk' } },
      { status: 500 }
    );
  }
}

async function finalizeChunkedUpload(sessionId: string, userId: string) {
  const session = chunkSessions.get(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Upload session not found' } },
      { status: 404 }
    );
  }
  
  try {
    const { fileInfo, totalChunks } = session;

    // Look up profile UUID
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
    
    const chunks: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `${profileId}/chunks/${sessionId}/${i}`;
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.DATASETS)
        .download(chunkPath);
      
      if (error || !data) {
        throw new Error(`Failed to download chunk ${i}`);
      }
      
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
    } catch (parseError) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Invalid or corrupted file. Please check your file format.' } },
        { status: 400 }
      );
    }
    
    const datasetId = uuidv4();
    const timestamp = Date.now();
    const safeFileName = fileInfo.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalPath = `${profileId}/${datasetId}/${timestamp}_${safeFileName}`;
    
    const { error: finalUploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.DATASETS)
      .upload(finalPath, finalBuffer, {
        contentType: getContentType(validatedType),
        upsert: false
      });
    
    if (finalUploadError) {
      throw new Error('Failed to upload assembled file');
    }
    
    const publicUrl = getPublicUrl(STORAGE_BUCKETS.DATASETS, finalPath);
    
    const { data: dataset, error: dbError } = await supabaseAdmin
      .from('datasets')
      .insert({
        id: datasetId,
        user_id: profileId,
        name: fileInfo.filename.replace(/\.[^/.]+$/, ''),
        original_filename: fileInfo.filename,
        storage_path: finalPath,
        storage_url: publicUrl,
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
      await supabaseAdmin.storage.from(STORAGE_BUCKETS.DATASETS).remove([finalPath]);
      throw new Error('Failed to create dataset record');
    }
    
    // Clean up chunks
    const chunkPaths = [];
    for (let i = 0; i < totalChunks; i++) {
      chunkPaths.push(`${profileId}/chunks/${sessionId}/${i}`);
    }
    await supabaseAdmin.storage.from(STORAGE_BUCKETS.DATASETS).remove(chunkPaths);
    chunkSessions.delete(sessionId);
    
    return NextResponse.json({
      id: datasetId,
      path: finalPath,
      publicUrl,
      name: fileInfo.filename.replace(/\.[^/.]+$/, ''),
      size: fileInfo.fileSize,
      type: validatedType,
      rowCount,
      columnCount,
      createdAt: dataset.created_at
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to finalize upload' } },
      { status: 500 }
    );
  }
}

async function handleRegularUpload(formData: FormData, clerkUserId: string) {
  const file = formData.get('file') as File;
  const customName = formData.get('name') as string | undefined;
  
  if (!file) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'No file provided' } },
      { status: 400 }
    );
  }

  // Look up the user's profile UUID from their Clerk ID
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError);
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'User profile not found. Please sign in again.' } },
      { status: 401 }
    );
  }

  const userId = profile.id; // This is the UUID
  
  if (file.size > SIMPLE_UPLOAD_LIMIT) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Use chunked upload for files >50MB' } },
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
  } catch (parseError) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Invalid or corrupted file. Please check your file format.' } },
      { status: 400 }
    );
  }
  
  const datasetId = uuidv4();
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${userId}/${datasetId}/${timestamp}_${safeFileName}`;
  
  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.DATASETS)
    .upload(storagePath, buffer, {
      contentType: file.type || getContentType(fileType),
      upsert: false
    });
  
  if (uploadError) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to upload file' } },
      { status: 500 }
    );
  }
  
  const publicUrl = getPublicUrl(STORAGE_BUCKETS.DATASETS, storagePath);
  
  const { data: dataset, error: dbError } = await supabaseAdmin
    .from('datasets')
    .insert({
      id: datasetId,
      user_id: userId,
      name: customName || file.name.replace(/\.[^/.]+$/, ''),
      original_filename: file.name,
      storage_path: storagePath,
      storage_url: publicUrl,
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
    await supabaseAdmin.storage.from(STORAGE_BUCKETS.DATASETS).remove([storagePath]);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: `Failed to create dataset record: ${dbError.message}` } },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    id: datasetId,
    path: storagePath,
    publicUrl,
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
