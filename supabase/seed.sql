-- StaffHub Seed Data
-- Run this AFTER running schema.sql and creating auth users
-- 
-- IMPORTANT: First create users in Supabase Auth Dashboard:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add user" > "Create new user"
-- 3. Create the following users with these emails (use any password):
--    - admin@test.com (Admin)
--    - sarah.johnson@test.com (Staff)
--    - michael.chen@test.com (Staff)
--    - emily.davis@test.com (Staff)
--    - james.wilson@test.com (Staff)
--
-- Then update the UUIDs below with the actual user IDs from Supabase Auth

-- ============================================
-- STEP 1: Get the leave type IDs
-- ============================================
-- Run: SELECT id, name FROM leave_types;
-- Then use those IDs below

-- ============================================
-- STEP 2: Update these variables with your actual IDs
-- ============================================

-- Replace these placeholder UUIDs with actual auth.users IDs after creating users
DO $$
DECLARE
  admin_id UUID;
  sarah_id UUID;
  michael_id UUID;
  emily_id UUID;
  james_id UUID;
  vacation_type_id UUID;
  single_day_type_id UUID;
BEGIN
  -- Get leave type IDs
  SELECT id INTO vacation_type_id FROM leave_types WHERE name = 'Vacation';
  SELECT id INTO single_day_type_id FROM leave_types WHERE name = 'Single Day Off';

  -- Get user IDs from profiles (these are created by the trigger when auth users are created)
  SELECT id INTO admin_id FROM profiles WHERE email = 'admin@test.com';
  SELECT id INTO sarah_id FROM profiles WHERE email = 'sarah.johnson@test.com';
  SELECT id INTO michael_id FROM profiles WHERE email = 'michael.chen@test.com';
  SELECT id INTO emily_id FROM profiles WHERE email = 'emily.davis@test.com';
  SELECT id INTO james_id FROM profiles WHERE email = 'james.wilson@test.com';

  -- Skip if users don't exist yet
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Users not found. Please create auth users first.';
    RETURN;
  END IF;

  -- Update profile names
  UPDATE profiles SET full_name = 'Admin User', role = 'admin' WHERE id = admin_id;
  UPDATE profiles SET full_name = 'Sarah Johnson' WHERE id = sarah_id;
  UPDATE profiles SET full_name = 'Michael Chen' WHERE id = michael_id;
  UPDATE profiles SET full_name = 'Emily Davis' WHERE id = emily_id;
  UPDATE profiles SET full_name = 'James Wilson' WHERE id = james_id;

  -- ============================================
  -- Sample Leave Requests
  -- ============================================

  -- Sarah's requests
  INSERT INTO leave_requests (user_id, leave_type_id, submission_date, start_date, end_date, reason, status, reviewed_by, reviewed_at, created_at)
  VALUES
    (sarah_id, vacation_type_id, (NOW() - INTERVAL '5 days')::date, '2025-12-23', '2025-12-27', 'Holiday vacation with family', 'approved', admin_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days'),
    (sarah_id, single_day_type_id, (NOW() - INTERVAL '1 day')::date, '2026-01-10', '2026-01-10', 'Doctor appointment', 'pending', NULL, NULL, NOW() - INTERVAL '1 day');

  -- Michael's requests
  INSERT INTO leave_requests (user_id, leave_type_id, submission_date, start_date, end_date, reason, status, reviewed_by, reviewed_at, admin_notes, created_at)
  VALUES
    (michael_id, vacation_type_id, (NOW() - INTERVAL '7 days')::date, '2025-12-18', '2025-12-20', 'Short trip', 'denied', admin_id, NOW() - INTERVAL '3 days', 'Too many staff already off during this period', NOW() - INTERVAL '7 days'),
    (michael_id, single_day_type_id, (NOW() - INTERVAL '12 hours')::date, '2026-01-15', '2026-01-15', 'Personal errand', 'pending', NULL, NULL, NULL, NOW() - INTERVAL '12 hours');

  -- Emily's requests
  INSERT INTO leave_requests (user_id, leave_type_id, submission_date, start_date, end_date, reason, coverage_name, coverage_email, status, reviewed_by, reviewed_at, created_at)
  VALUES
    (emily_id, vacation_type_id, (NOW() - INTERVAL '4 days')::date, '2026-01-06', '2026-01-10', 'New Year vacation', 'Michael Chen', 'michael.chen@test.com', 'approved', admin_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days'),
    (emily_id, single_day_type_id, NOW()::date, '2026-02-14', '2026-02-14', 'Valentine''s Day plans', NULL, NULL, 'pending', NULL, NULL, NOW());

  -- James's requests
  INSERT INTO leave_requests (user_id, leave_type_id, submission_date, start_date, end_date, reason, status, reviewed_by, reviewed_at, created_at)
  VALUES
    (james_id, vacation_type_id, (NOW() - INTERVAL '2 days')::date, '2026-02-01', '2026-02-05', 'Winter getaway', 'pending', NULL, NULL, NOW() - INTERVAL '2 days'),
    (james_id, single_day_type_id, (NOW() - INTERVAL '10 days')::date, '2025-12-13', '2025-12-13', 'Moving day', 'approved', admin_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days');

  RAISE NOTICE 'Seed data inserted successfully!';
END $$;

