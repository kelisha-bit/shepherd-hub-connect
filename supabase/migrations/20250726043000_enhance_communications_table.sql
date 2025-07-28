-- Add new columns to communications table for enhanced announcement system
ALTER TABLE public.communications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'event', 'service', 'prayer')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_communications_priority ON public.communications(priority);
CREATE INDEX IF NOT EXISTS idx_communications_category ON public.communications(category);
CREATE INDEX IF NOT EXISTS idx_communications_expires_at ON public.communications(expires_at);

-- Update existing records to have default values
UPDATE public.communications 
SET priority = 'normal' 
WHERE priority IS NULL;

UPDATE public.communications 
SET category = 'general' 
WHERE category IS NULL;

-- Add comment to table
COMMENT ON COLUMN public.communications.priority IS 'Priority level of the communication (low, normal, high, urgent)';
COMMENT ON COLUMN public.communications.category IS 'Category of the communication (general, urgent, event, service, prayer)';
COMMENT ON COLUMN public.communications.expires_at IS 'Optional expiration date for the communication';
