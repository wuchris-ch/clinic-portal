-- HR Employee Portal Seed Data
-- This creates test data for local development and CI
--
-- NOTE: Auth users are NOT created here (Supabase auth is separate)
-- Auth users are created by tests/auth.setup.ts via Admin API
--
-- This seed creates:
-- 1. Test organization (testorg)
-- 2. Sample announcements for the test org
--
-- Leave types and pay periods are already in migrations (000_initial_schema.sql)

-- ============================================
-- Test Organization
-- ============================================
-- This org is used by E2E tests. The admin user is created by auth.setup.ts

INSERT INTO organizations (id, name, slug, admin_email, google_sheet_id, settings, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Test Organization',
    'testorg',
    'test@org.com',
    NULL,
    '{}',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Sample Announcements for Test Org
-- ============================================

INSERT INTO announcements (id, title, content, pinned, image_url, organization_id, created_at, updated_at)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'Welcome to Test Organization',
        'This is a sample announcement for testing purposes. You can create, edit, and delete announcements from the admin panel.',
        true,
        NULL,
        'a0000000-0000-0000-0000-000000000001',
        NOW(),
        NOW()
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'Holiday Schedule Update',
        'Please note the upcoming holiday schedule. The office will be closed on December 25th and January 1st. Submit your time-off requests in advance.',
        false,
        NULL,
        'a0000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Notification Recipients for Test Org
-- ============================================

INSERT INTO notification_recipients (id, email, organization_id, created_at, updated_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'test@org.com',
    'a0000000-0000-0000-0000-000000000001',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Done
-- ============================================
-- Auth users (test@org.com, test@staff.com) are created by tests/auth.setup.ts
-- This allows the tests to work in CI where we can't create auth users via SQL

DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Test organization: testorg (slug)';
    RAISE NOTICE 'Note: Auth users are created by tests/auth.setup.ts via Admin API';
END $$;
