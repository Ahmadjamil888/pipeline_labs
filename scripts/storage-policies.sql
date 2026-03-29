-- ==========================================================
-- STORAGE RLS POLICIES FOR PIPELINE LABS
-- Run this in Supabase SQL Editor to fix file upload issues
-- ==========================================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files to datasets bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'datasets' 
    AND owner = auth.uid()
  );

-- Policy 2: Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated 
  USING (
    bucket_id = 'datasets' 
    AND owner = auth.uid()
  );

-- Policy 3: Allow public read access to files (for download URLs)
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO anon 
  USING (
    bucket_id = 'datasets'
  );

-- Policy 4: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated 
  USING (
    bucket_id = 'datasets' 
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'datasets' 
    AND owner = auth.uid()
  );

-- Policy 5: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated 
  USING (
    bucket_id = 'datasets' 
    AND owner = auth.uid()
  );

-- ==========================================================
-- DONE! File uploads should now work.
-- ==========================================================
