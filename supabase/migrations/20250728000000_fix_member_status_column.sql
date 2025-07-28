-- Fix member_status column in members table
DO $$
BEGIN
  -- Add member_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'members' 
                AND column_name = 'member_status') THEN
    ALTER TABLE public.members ADD COLUMN member_status TEXT DEFAULT 'active';
  END IF;
  
  -- Add membership_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'members' 
                AND column_name = 'membership_type') THEN
    ALTER TABLE public.members ADD COLUMN membership_type TEXT DEFAULT 'regular';
  END IF;
  
  -- Create index for member_status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_members_status') THEN
    CREATE INDEX idx_members_status ON public.members(member_status);
  END IF;
  
  -- Create index for membership_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_members_membership_type') THEN
    CREATE INDEX idx_members_membership_type ON public.members(membership_type);
  END IF;
END $$; 