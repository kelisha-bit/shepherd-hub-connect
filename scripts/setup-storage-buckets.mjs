import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY0MzgyNSwiZXhwIjoyMDY4MjE5ODI1fQ.Ey8Ql7Eo8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

// Create admin client for storage operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupStorageBuckets() {
  console.log('🚀 Setting up storage buckets for file uploads...');
  
  const buckets = [
    {
      name: 'profile-images',
      description: 'Profile pictures for members',
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    },
    {
      name: 'event-images',
      description: 'Images for events',
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    },
    {
      name: 'hero-images',
      description: 'Hero/banner images for the website',
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    },
    {
      name: 'sermon-audio',
      description: 'Audio files for sermons',
      public: true,
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      fileSizeLimit: 52428800 // 50MB
    },
    {
      name: 'sermon-video',
      description: 'Video files for sermons',
      public: true,
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      fileSizeLimit: 524288000 // 500MB
    },
    {
      name: 'documents',
      description: 'General documents and files',
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760 // 10MB
    }
  ];

  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}`);
      
      // Create bucket
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.allowedMimeTypes,
        fileSizeLimit: bucket.fileSizeLimit
      });

      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          console.log(`   ✅ Bucket '${bucket.name}' already exists`);
        } else {
          console.log(`   ⚠️  Error creating bucket '${bucket.name}':`, bucketError.message);
        }
      } else {
        console.log(`   ✅ Created bucket '${bucket.name}' successfully`);
      }

      // Set up RLS policies for the bucket
      await setupBucketPolicies(bucket.name, bucket.public);

    } catch (error) {
      console.log(`   ❌ Failed to create bucket '${bucket.name}':`, error.message);
    }
  }

  console.log('\n🎉 Storage bucket setup completed!');
  console.log('\n📋 Created buckets:');
  buckets.forEach(bucket => {
    console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
  });
}

async function setupBucketPolicies(bucketName, isPublic) {
  try {
    // For public buckets, allow authenticated users to upload and view
    if (isPublic) {
      // Allow authenticated users to view files
      const { error: viewError } = await supabase.rpc('exec', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Authenticated users can view ${bucketName}" 
          ON storage.objects FOR SELECT 
          TO authenticated 
          USING (bucket_id = '${bucketName}');
        `
      });

      // Allow authenticated users to upload files
      const { error: uploadError } = await supabase.rpc('exec', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Authenticated users can upload to ${bucketName}" 
          ON storage.objects FOR INSERT 
          TO authenticated 
          WITH CHECK (bucket_id = '${bucketName}');
        `
      });

      // Allow users to update their own files
      const { error: updateError } = await supabase.rpc('exec', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can update their own files in ${bucketName}" 
          ON storage.objects FOR UPDATE 
          TO authenticated 
          USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      });

      // Allow users to delete their own files
      const { error: deleteError } = await supabase.rpc('exec', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can delete their own files in ${bucketName}" 
          ON storage.objects FOR DELETE 
          TO authenticated 
          USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      });

      if (viewError || uploadError || updateError || deleteError) {
        console.log(`   ⚠️  Some policies for '${bucketName}' may not have been created`);
      } else {
        console.log(`   ✅ Policies created for '${bucketName}'`);
      }
    } else {
      // For private buckets, more restrictive policies
      const { error: viewError } = await supabase.rpc('exec', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Admins can view ${bucketName}" 
          ON storage.objects FOR SELECT 
          TO authenticated 
          USING (
            bucket_id = '${bucketName}' AND 
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE user_id = auth.uid() AND role = 'admin'
            )
          );
        `
      });

      const { error: uploadError } = await supabase.rpc('exec', {
        sql: `
          CREATE POLICY IF NOT EXISTS "Admins can upload to ${bucketName}" 
          ON storage.objects FOR INSERT 
          TO authenticated 
          WITH CHECK (
            bucket_id = '${bucketName}' AND 
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE user_id = auth.uid() AND role = 'admin'
            )
          );
        `
      });

      if (viewError || uploadError) {
        console.log(`   ⚠️  Some policies for '${bucketName}' may not have been created`);
      } else {
        console.log(`   ✅ Admin policies created for '${bucketName}'`);
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Error setting up policies for '${bucketName}':`, error.message);
  }
}

// Run the setup
setupStorageBuckets(); 