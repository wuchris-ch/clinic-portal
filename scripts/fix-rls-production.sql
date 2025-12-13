-- =============================================================================
-- FIX RLS POLICIES FOR PRODUCTION
-- =============================================================================
-- Run this in Supabase Dashboard > SQL Editor
--
-- This script fixes infinite recursion bugs in RLS policies that cause:
-- - "Organization not found" on staff registration
-- - "Limbo state" after login (logged in but no data shown)
--
-- Safe to run multiple times (uses DROP IF EXISTS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FIX ORGANIZATIONS TABLE
-- -----------------------------------------------------------------------------
-- Problem: Old policy queried profiles, which queried orgs = infinite loop
-- Solution: Allow anyone to view organizations (they're not sensitive - just name/slug)

DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Anyone can view organizations for registration" ON organizations;
DROP POLICY IF EXISTS "Anyone can view organizations" ON organizations;

CREATE POLICY "Anyone can view organizations" ON organizations
  FOR SELECT TO anon, authenticated
  USING (true);

-- Keep existing policies for mutations (these are fine)
-- - "Service role can manage organizations" (ALL for service_role)
-- - "Org admins can update their organization" (UPDATE with proper checks)


-- -----------------------------------------------------------------------------
-- 2. FIX PROFILES TABLE
-- -----------------------------------------------------------------------------
-- Problem: Policy checked organization_id by querying profiles = infinite loop
-- Solution: Use auth.uid() for own profile, auth.jwt() for org membership

DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view org member profiles" ON profiles;

-- Users can always view their own profile (no recursion possible)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can view other profiles in their org (use JWT metadata, not subquery)
CREATE POLICY "Users can view org member profiles" ON profiles
  FOR SELECT USING (
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::UUID
  );

-- Fix admin update policy too (same recursion issue)
DROP POLICY IF EXISTS "Admins can update org profiles" ON profiles;

CREATE POLICY "Admins can update org profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id  -- Can always update own profile
    OR (
      -- Admins can update profiles in their org (use JWT to avoid recursion)
      organization_id = (auth.jwt() -> 'user_metadata' ->> 'organization_id')::UUID
      AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );


-- -----------------------------------------------------------------------------
-- 3. VERIFY POLICIES
-- -----------------------------------------------------------------------------
-- Run this to confirm policies are correct:

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('organizations', 'profiles')
ORDER BY tablename, policyname;
