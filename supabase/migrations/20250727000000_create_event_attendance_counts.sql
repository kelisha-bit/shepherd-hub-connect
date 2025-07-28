-- Create event_attendance_counts table for aggregate attendance tracking
CREATE TABLE IF NOT EXISTS event_attendance_counts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  members_count INTEGER DEFAULT 0,
  visitors_count INTEGER DEFAULT 0,
  adults_count INTEGER DEFAULT 0,
  children_count INTEGER DEFAULT 0,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_attendance_counts_event_id ON event_attendance_counts(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_counts_date ON event_attendance_counts(attendance_date);
CREATE INDEX IF NOT EXISTS idx_event_attendance_counts_recorded_by ON event_attendance_counts(recorded_by);

-- Add RLS policies
ALTER TABLE event_attendance_counts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all attendance counts
CREATE POLICY "Users can view event attendance counts" ON event_attendance_counts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert attendance counts
CREATE POLICY "Users can insert event attendance counts" ON event_attendance_counts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own attendance count records
CREATE POLICY "Users can update their own event attendance counts" ON event_attendance_counts
  FOR UPDATE USING (auth.uid() = recorded_by);

-- Policy: Users can delete their own attendance count records
CREATE POLICY "Users can delete their own event attendance counts" ON event_attendance_counts
  FOR DELETE USING (auth.uid() = recorded_by);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_attendance_counts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_attendance_counts_updated_at
  BEFORE UPDATE ON event_attendance_counts
  FOR EACH ROW EXECUTE FUNCTION update_event_attendance_counts_updated_at();
