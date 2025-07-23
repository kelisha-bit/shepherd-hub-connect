-- Create sermons table
CREATE TABLE sermons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    preacher TEXT NOT NULL,
    date DATE NOT NULL,
    audio_url TEXT NOT NULL,
    duration INTEGER, -- in seconds
    series TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create prayer_requests table
CREATE TABLE prayer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES members(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived')),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create prayer_responses table for tracking responses/updates to prayer requests
CREATE TABLE prayer_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id),
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create small_groups table
CREATE TABLE small_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES members(id),
    meeting_day TEXT,
    meeting_time TEXT,
    location TEXT,
    max_members INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create small_group_members junction table
CREATE TABLE small_group_members (
    small_group_id UUID REFERENCES small_groups(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'co-leader', 'member')),
    PRIMARY KEY (small_group_id, member_id)
);

-- Add RLS policies
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_group_members ENABLE ROW LEVEL SECURITY;

-- Sermons policies
CREATE POLICY "Sermons are viewable by all authenticated users"
    ON sermons FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Sermons can be created by admins"
    ON sermons FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM members
        WHERE members.id = auth.uid()
        AND role = 'admin'
    ));

CREATE POLICY "Sermons can be updated by admins"
    ON sermons FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND role = 'admin'
        )
    );

-- Prayer requests policies
CREATE POLICY "Users can view public prayer requests and their own private ones"
    ON prayer_requests FOR SELECT
    TO authenticated
    USING (
        (NOT is_private) OR
        requester_id = auth.uid()
    );

CREATE POLICY "Users can create prayer requests"
    ON prayer_requests FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own prayer requests"
    ON prayer_requests FOR UPDATE
    TO authenticated
    USING (requester_id = auth.uid());

-- Prayer responses policies
CREATE POLICY "Users can view responses to visible prayer requests"
    ON prayer_responses FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM prayer_requests
            WHERE prayer_requests.id = prayer_responses.prayer_request_id
            AND ((NOT is_private) OR requester_id = auth.uid())
        )
    );

CREATE POLICY "Users can create prayer responses"
    ON prayer_responses FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM prayer_requests
            WHERE prayer_requests.id = prayer_request_id
            AND ((NOT is_private) OR requester_id = auth.uid())
        )
    );

-- Small groups policies
CREATE POLICY "Small groups are viewable by all authenticated users"
    ON small_groups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Small groups can be created by admins"
    ON small_groups FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Small groups can be updated by their leaders or admins"
    ON small_groups FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM members
            WHERE members.id = auth.uid()
            AND (role = 'admin' OR members.id = small_groups.leader_id)
        )
    );

-- Small group members policies
CREATE POLICY "Small group members are viewable by all authenticated users"
    ON small_group_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Members can join small groups"
    ON small_group_members FOR INSERT
    TO authenticated
    WITH CHECK (member_id = auth.uid());

CREATE POLICY "Group leaders and admins can manage members"
    ON small_group_members FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM small_groups
            WHERE small_groups.id = small_group_id
            AND (
                EXISTS (
                    SELECT 1 FROM members
                    WHERE members.id = auth.uid()
                    AND role = 'admin'
                ) OR
                leader_id = auth.uid()
            )
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_timestamp_sermons
    BEFORE UPDATE ON sermons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_timestamp_prayer_requests
    BEFORE UPDATE ON prayer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_timestamp_small_groups
    BEFORE UPDATE ON small_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();