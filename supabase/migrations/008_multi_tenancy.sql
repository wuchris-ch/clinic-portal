-- Migration: Add multi-tenancy support
-- Creates organizations table and adds organization_id to tenant tables

-- 1. Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  admin_email TEXT NOT NULL,
  google_sheet_id TEXT,
  settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_admin_email ON organizations(admin_email);

-- Trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 2. Add organization_id to profiles FIRST (before any RLS policies reference it)
ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);

-- 3. Add organization_id to leave_requests
ALTER TABLE leave_requests ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_leave_requests_organization_id ON leave_requests(organization_id);

-- 4. Add organization_id to notification_recipients
-- First drop the unique constraint on email since same email can exist in different orgs
ALTER TABLE notification_recipients DROP CONSTRAINT IF EXISTS notification_recipients_email_key;
ALTER TABLE notification_recipients ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_notification_recipients_organization_id ON notification_recipients(organization_id);
-- Add unique constraint per org
ALTER TABLE notification_recipients ADD CONSTRAINT notification_recipients_org_email_unique UNIQUE (organization_id, email);

-- 5. Add organization_id to announcements
ALTER TABLE announcements ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX idx_announcements_organization_id ON announcements(organization_id);

-- 6. NOW create RLS Policies for organizations (after organization_id column exists in profiles)
-- NOTE: We use a single permissive SELECT policy that allows anyone to view organizations.
-- This is needed for staff registration (lookup org before joining) and doesn't expose sensitive data.
-- The old "Users can view their organization" policy caused infinite recursion with profiles RLS.

CREATE POLICY "Anyone can view organizations" ON organizations
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage organizations" ON organizations
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Org admins can update their organization" ON organizations
  FOR UPDATE USING (
    id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- 7. Update RLS policies for profiles to include org isolation
-- NOTE: Avoid self-referencing queries in profiles policies to prevent infinite recursion.
-- Use auth.uid() for own profile, and JWT metadata for org membership checks.
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Users can always view their own profile (no recursion)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can view other profiles in their org (use JWT to avoid recursion)
CREATE POLICY "Users can view org member profiles" ON profiles
  FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::UUID
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update org profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id  -- Can update own profile
    OR (
      -- Use JWT for org check to avoid recursion
      organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::UUID
      AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );

-- 7. Update RLS policies for leave_requests to include org isolation
DROP POLICY IF EXISTS "Users can view own requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can view approved requests for calendar" ON leave_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can create own requests" ON leave_requests;
DROP POLICY IF EXISTS "Users can update own pending requests" ON leave_requests;
DROP POLICY IF EXISTS "Admins can update any request" ON leave_requests;
DROP POLICY IF EXISTS "Users can delete own pending requests" ON leave_requests;

CREATE POLICY "Users can view own org requests" ON leave_requests
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create own requests in org" ON leave_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own pending requests" ON leave_requests
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status = 'pending'
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update org requests" ON leave_requests
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own pending requests" ON leave_requests
  FOR DELETE USING (
    auth.uid() = user_id 
    AND status = 'pending'
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- 8. Update RLS policies for notification_recipients to include org isolation
DROP POLICY IF EXISTS "Admins can view notification recipients" ON notification_recipients;
DROP POLICY IF EXISTS "Admins can insert notification recipients" ON notification_recipients;
DROP POLICY IF EXISTS "Admins can update notification recipients" ON notification_recipients;
DROP POLICY IF EXISTS "Admins can delete notification recipients" ON notification_recipients;
DROP POLICY IF EXISTS "Service role can view active recipients" ON notification_recipients;

CREATE POLICY "Admins can view org notification recipients" ON notification_recipients
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert org notification recipients" ON notification_recipients
  FOR INSERT WITH CHECK (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update org notification recipients" ON notification_recipients
  FOR UPDATE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete org notification recipients" ON notification_recipients
  FOR DELETE USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can view all recipients" ON notification_recipients
  FOR SELECT TO service_role
  USING (true);

-- 9. Update RLS policies for announcements to include org isolation
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;

CREATE POLICY "Users can view org announcements" ON announcements
  FOR SELECT USING (
    organization_id IS NULL  -- Global announcements
    OR organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage org announcements" ON announcements
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 10. Update leave_request_dates RLS to work through leave_requests org
DROP POLICY IF EXISTS "Users can view own request dates" ON leave_request_dates;
DROP POLICY IF EXISTS "Users can view approved request dates for calendar" ON leave_request_dates;
DROP POLICY IF EXISTS "Admins can view all request dates" ON leave_request_dates;
DROP POLICY IF EXISTS "Users can insert dates for own requests" ON leave_request_dates;
DROP POLICY IF EXISTS "Users can delete dates from own pending requests" ON leave_request_dates;

CREATE POLICY "Users can view org request dates" ON leave_request_dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.id = request_id 
      AND lr.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert dates for own org requests" ON leave_request_dates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.id = request_id 
      AND lr.user_id = auth.uid()
      AND lr.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete dates from own pending requests" ON leave_request_dates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM leave_requests lr 
      WHERE lr.id = request_id 
      AND lr.user_id = auth.uid() 
      AND lr.status = 'pending'
      AND lr.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
  );

-- 11. Update notifications RLS to include org context
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12. Update handle_new_user function to include organization_id from signup metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'staff'::public.user_role),
    (NEW.raw_user_meta_data->>'organization_id')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;



