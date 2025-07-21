-- Add member_id column to donations table if it doesn't exist
DO $$
BEGIN
  -- First, check if the column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'donations' 
                AND column_name = 'member_id') THEN
    
    -- Add the column
    ALTER TABLE public.donations 
    ADD COLUMN member_id UUID;
    
    -- Add foreign key constraint
    ALTER TABLE public.donations 
    ADD CONSTRAINT fk_donations_member 
    FOREIGN KEY (member_id) 
    REFERENCES public.members(id) 
    ON DELETE SET NULL;
    
    -- Create index for better performance
    CREATE INDEX idx_donations_member_id ON public.donations(member_id);
    
    -- Update existing donations to link to members by email if possible
    UPDATE public.donations d
    SET member_id = m.id
    FROM public.members m
    WHERE d.donor_email = m.email
    AND d.member_id IS NULL;
  END IF;
END $$;
