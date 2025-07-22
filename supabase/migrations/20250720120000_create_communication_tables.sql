-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms')),
  created_at timestamp with time zone DEFAULT now()
);

-- Create message_logs table
CREATE TABLE IF NOT EXISTS message_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms')),
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at timestamp with time zone DEFAULT now(),
  template_id uuid REFERENCES message_templates(id)
); 