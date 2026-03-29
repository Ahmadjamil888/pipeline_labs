import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Server-side Supabase client with service role for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket names
export const STORAGE_BUCKETS = {
  DATASETS: 'datasets',
  PROCESSED: 'processed',
  TEMP: 'temp',
} as const;

// Helper to get authenticated user from request
export async function getAuthUser(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

// Helper to upload file to storage
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType: string
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

// Helper to get public URL
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Helper to download file from storage
export async function downloadFromStorage(bucket: string, path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);

  if (error) {
    throw error;
  }

  return data;
}

// Helper to delete file from storage
export async function deleteFromStorage(bucket: string, paths: string[]) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    throw error;
  }

  return data;
}
