-- Migration: Add leave_request_dates table and new columns
-- Run this if you have an existing database and need to add the new table

-- Add new columns to leave_requests
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS pay_period_id UUID REFERENCES pay_periods(id),
ADD COLUMN IF NOT EXISTS submission_date DATE;

-- Set submission_date to created_at date for existing records
UPDATE leave_requests SET submission_date = created_at::date WHERE submission_date IS NULL;

-- Make submission_date required for new records
ALTER TABLE leave_requests ALTER COLUMN submission_date SET NOT NULL;

-- Create the leave_request_dates table
CREATE TABLE IF NOT EXISTS leave_request_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(request_id, date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leave_request_dates_request_id ON leave_request_dates(request_id);
CREATE INDEX IF NOT EXISTS idx_leave_request_dates_date ON leave_request_dates(date);

-- Enable RLS
ALTER TABLE leave_request_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to make migration idempotent)
DROP POLICY IF EXISTS "Users can view own request dates" ON leave_request_dates;
CREATE POLICY "Users can view own request dates" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view approved request dates for calendar" ON leave_request_dates;
CREATE POLICY "Users can view approved request dates for calendar" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Admins can view all request dates" ON leave_request_dates;
CREATE POLICY "Admins can view all request dates" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert dates for own requests" ON leave_request_dates;
CREATE POLICY "Users can insert dates for own requests" ON leave_request_dates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete dates from own pending requests" ON leave_request_dates;
CREATE POLICY "Users can delete dates from own pending requests" ON leave_request_dates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND user_id = auth.uid() AND status = 'pending'
    )
  );

