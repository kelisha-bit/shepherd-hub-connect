/*
  # Fix Member Portal Schema Issues

  1. Database Schema Updates
    - Fix prayer_requests table structure
    - Update small_groups table structure  
    - Fix sermons table structure
    - Add missing columns and constraints

  2. Security
    - Update RLS policies for proper access control
    - Fix authentication-based access

  3. Data Integrity
    - Add proper foreign key constraints
    - Fix column names and types
*/

-- Fix prayer_requests table structure
DO $$
BEGIN
  -- Check if prayer_requests table exists and has correct structure
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayer_requests') THEN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_requests' AND column_name = 'requester_id') THEN
      ALTER TABLE prayer_requests ADD COLUMN requester_id UUID REFERENCES members(id) ON DELETE CASCADE;
    END IF;
    
    -- Rename member_id to requester_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_requests' AND column_name = 'member_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_requests' AND column_name = 'requester_id') THEN
      ALTER TABLE prayer_requests RENAME COLUMN member_id TO requester_id;
    END IF;
    
    -- Fix description column name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_requests' AND column_name = 'details') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_requests' AND column_name = 'description') THEN
      ALTER TABLE prayer_requests RENAME COLUMN details TO description;
    END IF;
    
    -- Add is_public column if missing (opposite of is_private)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_requests' AND column_name = 'is_public') THEN
      ALTER TABLE prayer_requests ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
  END IF;
END $$;

-- Fix small_groups table structure
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'small_groups') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'small_groups' AND column_name = 'meeting_location') THEN
      ALTER TABLE small_groups ADD COLUMN meeting_location TEXT;
    END IF;
    
    -- Rename location to meeting_location if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'small_groups' AND column_name = 'location') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'small_groups' AND column_name = 'meeting_location') THEN
      ALTER TABLE small_groups RENAME COLUMN location TO meeting_location;
    END IF;
    
    -- Add is_active column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'small_groups' AND column_name = 'is_active') THEN
      ALTER TABLE small_groups ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  END IF;
END $$;

-- Fix sermons table structure
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sermons') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'description') THEN
      ALTER TABLE sermons ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_reference') THEN
      ALTER TABLE sermons ADD COLUMN scripture_reference TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'video_url') THEN
      ALTER TABLE sermons ADD COLUMN video_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'tags') THEN
      ALTER TABLE sermons ADD COLUMN tags TEXT[];
    END IF;
    
    -- Rename columns if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'sermon_date') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'date') THEN
      ALTER TABLE sermons RENAME COLUMN sermon_date TO date;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sermons' AND column_name = 'scripture_reference') THEN
      ALTER TABLE sermons RENAME COLUMN scripture TO scripture_reference;
    END IF;
  END IF;
END $$;

-- Fix members table to include missing fields
DO $$
BEGIN
  -- Add missing fields to members table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'profile_image_url') THEN
    ALTER TABLE members ADD COLUMN profile_image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'avatar_url') THEN
    ALTER TABLE members ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'group') THEN
    ALTER TABLE members ADD COLUMN "group" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'name') THEN
    ALTER TABLE members ADD COLUMN name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
  END IF;
  
  -- Add membership fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'membership_type') THEN
    ALTER TABLE members ADD COLUMN membership_type TEXT DEFAULT 'regular';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'membership_date') THEN
    ALTER TABLE members ADD COLUMN membership_date DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'role') THEN
    ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'member';
  END IF;
END $$;

-- Update RLS policies for prayer_requests
DROP POLICY IF EXISTS "Users can view their own prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users can create their own prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users can update their own prayer requests" ON prayer_requests;

CREATE POLICY "Members can view their own prayer requests"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = prayer_requests.requester_id 
      AND (members.id = auth.uid() OR members.email = auth.email())
    )
  );

CREATE POLICY "Members can view public prayer requests"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Members can create prayer requests"
  ON prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = requester_id 
      AND (members.id = auth.uid() OR members.email = auth.email())
    )
  );

CREATE POLICY "Members can update their own prayer requests"
  ON prayer_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = prayer_requests.requester_id 
      AND (members.id = auth.uid() OR members.email = auth.email())
    )
  );

-- Update RLS policies for small_group_members
DROP POLICY IF EXISTS "Users can view their own group memberships" ON small_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON small_group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON small_group_members;

CREATE POLICY "Members can view all group memberships"
  ON small_group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can join groups"
  ON small_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_id 
      AND (members.id = auth.uid() OR members.email = auth.email())
    )
  );

CREATE POLICY "Members can leave groups"
  ON small_group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = small_group_members.member_id 
      AND (members.id = auth.uid() OR members.email = auth.email())
    )
  );

-- Update members table RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON members;
DROP POLICY IF EXISTS "Users can update their own profile" ON members;
DROP POLICY IF EXISTS "Users can insert their own profile" ON members;

CREATE POLICY "Members can view all member profiles"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update their own profile"
  ON members FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR email = auth.email());

CREATE POLICY "Members can insert their own profile"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR email = auth.email());

-- Create storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-images', 'profile-images', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for profile images
CREATE POLICY "Users can upload their own profile images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Users can view all profile images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-images');

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-images');