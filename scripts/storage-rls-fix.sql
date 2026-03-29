-- ==========================================================
-- STORAGE RLS FIX - Run this in Supabase Dashboard SQL Editor
-- ==========================================================
-- NOTE: You need admin privileges to run this. 
-- Go to Supabase Dashboard → SQL Editor → New Query → Paste & Run

-- OPTION 1: Disable RLS on storage.objects (Simpler, less secure)
-- Use this if you're getting "must be owner" errors with policies
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- OR OPTION 2: Create policies as superuser (More secure)
-- Uncomment below if you want proper RLS with policies
/*
-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'datasets');

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'datasets');

-- Allow public reads
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO anon 
  USING (bucket_id = 'datasets');

-- Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated 
  USING (bucket_id = 'datasets');
*/

-- ==========================================================
-- ALTERNATIVE: Make bucket public (if RLS is problematic)
-- ==========================================================
-- Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'datasets';

-- Verify bucket exists and is public
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name = 'datasets';

-- ==========================================================
-- DONE! Try uploading files now.
-- ==========================================================
