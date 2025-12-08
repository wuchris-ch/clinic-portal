-- Migration: Add notification_recipients table
-- This allows admins to manage notification emails through the UI instead of env vars

-- Create notification recipients table
CREATE TABLE notification_recipients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_notification_recipients_active ON notification_recipients(is_active);
CREATE INDEX idx_notification_recipients_email ON notification_recipients(email);

-- Trigger for updated_at
CREATE TRIGGER update_notification_recipients_updated_at
  BEFORE UPDATE ON notification_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view and manage notification recipients
CREATE POLICY "Admins can view notification recipients" ON notification_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert notification recipients" ON notification_recipients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update notification recipients" ON notification_recipients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete notification recipients" ON notification_recipients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can query for sending emails (API routes use service role)
CREATE POLICY "Service role can view active recipients" ON notification_recipients
  FOR SELECT TO service_role
  USING (true);

