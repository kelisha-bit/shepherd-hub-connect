// Script to setup storage bucket for profile pictures
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wucdbfyyoorxzwnnnpgh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Y2RiZnl5b29yeHp3bm5ucGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDM4MjUsImV4cCI6MjA2ODIxOTgyNX0.ArzYIdqR6XF0dg14LbyhF_6PLzfrNAYoHXaqRlucwFA";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function setupStorage() {
  console.log('Setting up storage bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Existing buckets:', buckets.map(b => b.name));
    
    const bucketExists = buckets.some(bucket => bucket.name === 'profile-pictures');
    
    if (bucketExists) {
      console.log('profile-pictures bucket already exists');
    } else {
      console.log('Creating profile-pictures bucket...');
      
      const { data, error } = await supabase.storage.createBucket('profile-pictures', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('profile-pictures bucket created successfully:', data);
      }
    }
    
    // Test upload to verify bucket is working
    console.log('Testing bucket upload...');
    
    // Create a simple test image (1x1 pixel)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Convert data URL to blob
    const response = await fetch(testImageData);
    const blob = await response.blob();
    
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(`test/${testFileName}`, blob);
      
    if (uploadError) {
      console.error('Error testing upload:', uploadError);
    } else {
      console.log('Test upload successful:', uploadData);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(`test/${testFileName}`);
        
      console.log('Test image public URL:', publicUrl);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([`test/${testFileName}`]);
        
      if (deleteError) {
        console.error('Error cleaning up test file:', deleteError);
      } else {
        console.log('Test file cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage(); 