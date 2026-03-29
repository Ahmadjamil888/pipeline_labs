import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('Setting up Supabase storage...')

  try {
    // Create datasets bucket with minimal config
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('datasets', {
      public: true
    })

    if (bucketError) {
      if (bucketError.message?.includes('already exists')) {
        console.log('✓ Bucket "datasets" already exists')
      } else {
        console.error('✗ Failed to create bucket:', bucketError)
        process.exit(1)
      }
    } else {
      console.log('✓ Created bucket "datasets"')
    }

    console.log('\n✓ Storage setup complete!')
    console.log('You can now upload files to the datasets bucket.')
    console.log('\n⚠️  IMPORTANT: Make sure to run this SQL in Supabase SQL Editor:')
    console.log(`
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'datasets' AND owner = auth.uid());

-- Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated 
  USING (bucket_id = 'datasets' AND owner = auth.uid());

-- Allow public read access to files (for download URLs)
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO anon 
  USING (bucket_id = 'datasets');
    `)
    
  } catch (error) {
    console.error('✗ Setup failed:', error)
    process.exit(1)
  }
}

setupStorage()
