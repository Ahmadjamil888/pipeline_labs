import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, STORAGE_BUCKETS } from '@/lib/clerk-supabase';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for chunk sessions
const chunkSessions = new Map<string, {
  chunks: Buffer[];
  filename: string;
  fileType: string;
  fileSize: number;
  totalChunks: number;
  receivedChunks: number;
  userId: string;
  createdAt: number;
}>();

const MAX_CHUNK_SIZE = 5 * 1024 * 1024;
const CHUNK_TIMEOUT = 30 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of chunkSessions.entries()) {
    if (now - session.createdAt > CHUNK_TIMEOUT) {
      chunkSessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.action === 'init') return handleInitialize(body, userId);
      if (body.action === 'finalize') return handleFinalize(body);
    }
    
    if (contentType.includes('multipart/form-data')) {
      return handleChunkUpload(request);
    }
    
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message || 'Upload failed' } }, { status: 500 });
  }
}

async function handleInitialize(body: { filename: string; fileSize: number; fileType: string; totalChunks: number }, userId: string) {
  const sessionId = uuidv4();
  chunkSessions.set(sessionId, {
    chunks: [],
    filename: body.filename,
    fileType: body.fileType,
    fileSize: body.fileSize,
    totalChunks: body.totalChunks,
    receivedChunks: 0,
    userId,
    createdAt: Date.now()
  });
  return NextResponse.json({ sessionId, totalChunks: body.totalChunks, chunkSize: MAX_CHUNK_SIZE });
}

async function handleChunkUpload(request: NextRequest) {
  const formData = await request.formData();
  const sessionId = formData.get('sessionId') as string;
  const chunkIndex = parseInt(formData.get('chunkIndex') as string);
  const totalChunks = parseInt(formData.get('totalChunks') as string);
  const chunk = formData.get('chunk') as File;
  
  const session = chunkSessions.get(sessionId);
  if (!session) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 });
  
  const bytes = await chunk.arrayBuffer();
  session.chunks[chunkIndex] = Buffer.from(bytes);
  session.receivedChunks++;
  
  const progress = Math.round((session.receivedChunks / totalChunks) * 100);
  return NextResponse.json({ received: session.receivedChunks, total: totalChunks, progress });
}

async function handleFinalize(body: { sessionId: string }) {
  const session = chunkSessions.get(body.sessionId);
  if (!session) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 });
  
  const buffer = Buffer.concat(session.chunks);
  
  const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('id').eq('clerk_user_id', session.userId).single();
  if (profileError || !profile) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Profile not found' } }, { status: 401 });
  
  const datasetId = uuidv4();
  const timestamp = Date.now();
  const safeFileName = session.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${profile.id}/${datasetId}/${timestamp}_${safeFileName}`;
  
  const { error: uploadError } = await supabaseAdmin.storage.from(STORAGE_BUCKETS.DATASETS).upload(storagePath, buffer, {
    contentType: session.fileType || 'application/octet-stream',
    upsert: false
  });
  
  if (uploadError) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to upload' } }, { status: 500 });
  
  const { data: publicUrl } = supabaseAdmin.storage.from(STORAGE_BUCKETS.DATASETS).getPublicUrl(storagePath);
  chunkSessions.delete(body.sessionId);
  
  return NextResponse.json({
    id: datasetId,
    path: storagePath,
    publicUrl: publicUrl.publicUrl,
    name: session.filename,
    size: session.fileSize,
    type: session.fileType,
    rowCount: 0,
    columnCount: 0
  });
}
