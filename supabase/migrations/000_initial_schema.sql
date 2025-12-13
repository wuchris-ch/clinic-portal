-- StaffHub HR Portal Database Schema
-- Initial schema migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('staff', 'admin');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'staff' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Leave types table
CREATE TABLE leave_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  is_single_day BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Pay periods table (reference data)
CREATE TABLE pay_periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  period_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  t4_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(period_number, t4_year)
);

-- Leave requests table
CREATE TABLE leave_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
  pay_period_id UUID REFERENCES pay_periods(id),
  submission_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  coverage_name TEXT,
  coverage_email TEXT,
  status request_status DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Leave request dates table (stores individual dates for each request)
CREATE TABLE leave_request_dates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(request_id, date)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES leave_requests(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_request_dates_request_id ON leave_request_dates(request_id);
CREATE INDEX idx_leave_request_dates_date ON leave_request_dates(date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_pay_periods_dates ON pay_periods(start_date, end_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'staff'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_request_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Supabase admin can insert profiles" ON profiles
  FOR INSERT TO supabase_admin
  WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leave types policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view leave types" ON leave_types
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leave types" ON leave_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Pay periods policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view pay periods" ON pay_periods
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pay periods" ON pay_periods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leave requests policies
CREATE POLICY "Users can view own requests" ON leave_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved requests for calendar" ON leave_requests
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all requests" ON leave_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create own requests" ON leave_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests" ON leave_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any request" ON leave_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own pending requests" ON leave_requests
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Leave request dates policies
CREATE POLICY "Users can view own request dates" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view approved request dates for calendar" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND status = 'approved'
    )
  );

CREATE POLICY "Admins can view all request dates" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert dates for own requests" ON leave_request_dates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete dates from own pending requests" ON leave_request_dates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM leave_requests WHERE id = request_id AND user_id = auth.uid() AND status = 'pending'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Insert default leave types
INSERT INTO leave_types (name, color, is_single_day) VALUES
  ('Vacation', '#10b981', false),
  ('Single Day Off', '#f59e0b', true);

-- Insert pay periods for 2025-2026 T4 year (Dec 16, 2025 - Dec 15, 2026)
INSERT INTO pay_periods (period_number, start_date, end_date, t4_year) VALUES
  (1, '2025-12-16', '2025-12-31', 2026),
  (2, '2026-01-01', '2026-01-15', 2026),
  (3, '2026-01-16', '2026-01-31', 2026),
  (4, '2026-02-01', '2026-02-15', 2026),
  (5, '2026-02-16', '2026-02-28', 2026),
  (6, '2026-03-01', '2026-03-15', 2026),
  (7, '2026-03-16', '2026-03-31', 2026),
  (8, '2026-04-01', '2026-04-15', 2026),
  (9, '2026-04-16', '2026-04-30', 2026),
  (10, '2026-05-01', '2026-05-15', 2026),
  (11, '2026-05-16', '2026-05-31', 2026),
  (12, '2026-06-01', '2026-06-15', 2026),
  (13, '2026-06-16', '2026-06-30', 2026),
  (14, '2026-07-01', '2026-07-15', 2026),
  (15, '2026-07-16', '2026-07-31', 2026),
  (16, '2026-08-01', '2026-08-15', 2026),
  (17, '2026-08-16', '2026-08-31', 2026),
  (18, '2026-09-01', '2026-09-15', 2026),
  (19, '2026-09-16', '2026-09-30', 2026),
  (20, '2026-10-01', '2026-10-15', 2026),
  (21, '2026-10-16', '2026-10-31', 2026),
  (22, '2026-11-01', '2026-11-15', 2026),
  (23, '2026-11-16', '2026-11-30', 2026),
  (24, '2026-12-01', '2026-12-15', 2026);
