-- Create prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'answered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create small_groups table
CREATE TABLE IF NOT EXISTS small_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES members(id),
  meeting_day TEXT,
  meeting_time TEXT,
  location TEXT,
  max_members INTEGER DEFAULT 20,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create small_group_members junction table
CREATE TABLE IF NOT EXISTS small_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES small_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- Create sermons table
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  preacher TEXT NOT NULL,
  sermon_date DATE NOT NULL,
  duration TEXT,
  category TEXT,
  scripture TEXT,
  audio_url TEXT,
  notes_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resources table for facility/equipment booking
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('facility', 'equipment')),
  capacity INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resource_bookings table
CREATE TABLE IF NOT EXISTS resource_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for prayer_requests
CREATE POLICY "Users can view their own prayer requests"
  ON prayer_requests FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create their own prayer requests"
  ON prayer_requests FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own prayer requests"
  ON prayer_requests FOR UPDATE
  USING (auth.uid() = member_id);

-- Create policies for small_group_members
CREATE POLICY "Users can view their own group memberships"
  ON small_group_members FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can join groups"
  ON small_group_members FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can leave groups"
  ON small_group_members FOR DELETE
  USING (auth.uid() = member_id);

-- Create policies for resource_bookings
CREATE POLICY "Users can view their own bookings"
  ON resource_bookings FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can create bookings"
  ON resource_bookings FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own bookings"
  ON resource_bookings FOR UPDATE
  USING (auth.uid() = member_id AND status = 'pending');

-- Create public read policies
CREATE POLICY "Everyone can view small groups"
  ON small_groups FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view sermons"
  ON sermons FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view resources"
  ON resources FOR SELECT
  USING (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prayer_requests_updated_at
BEFORE UPDATE ON prayer_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_small_groups_updated_at
BEFORE UPDATE ON small_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at
BEFORE UPDATE ON sermons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_bookings_updated_at
BEFORE UPDATE ON resource_bookings
FOR EACH ROW