import { test as setup, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TEST_ADMIN, TEST_STAFF } from './setup';

/**
 * Authentication Setup for Playwright E2E Tests
 *
 * This runs before authenticated tests to:
 * 1. Ensure test users exist (creates via Admin API if not)
 * 2. Log in with the test admin account
 * 3. Save the session to .auth/admin.json
 * 4. Authenticated tests reuse this session (no repeated logins)
 *
 * Prerequisites:
 * - Local Supabase running (supabase start)
 * - Environment variables set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 */

const AUTH_FILE = 'tests/.auth/admin.json';

// Test org ID (matches seed.sql)
const TEST_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

/**
 * Create Supabase admin client for user management
 */
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
        );
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Ensure a test user exists, creating if necessary
 */
async function ensureTestUser(
    adminClient: SupabaseClient,
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'staff',
    organizationId: string
): Promise<void> {
    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
        console.log(`✓ User ${email} already exists`);

        // Ensure profile exists and is linked to org
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id, organization_id')
            .eq('id', existingUser.id)
            .single();

        if (profile && !(profile as { organization_id: string | null }).organization_id) {
            // Update profile with organization
            await adminClient
                .from('profiles')
                .update({
                    organization_id: organizationId,
                    role: role,
                    full_name: fullName,
                } as Record<string, unknown>)
                .eq('id', existingUser.id);
            console.log(`  → Updated profile with organization`);
        }

        return;
    }

    // Create new user
    console.log(`Creating user ${email}...`);
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
            full_name: fullName,
        },
    });

    if (createError) {
        throw new Error(`Failed to create user ${email}: ${createError.message}`);
    }

    if (!newUser?.user) {
        throw new Error(`Failed to create user ${email}: No user returned`);
    }

    console.log(`✓ Created user ${email}`);

    // Update profile with organization and role
    // (profile is auto-created by trigger, we just need to update it)
    await new Promise((resolve) => setTimeout(resolve, 500)); // Brief wait for trigger

    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            organization_id: organizationId,
            role: role,
            full_name: fullName,
        } as Record<string, unknown>)
        .eq('id', newUser.user.id);

    if (profileError) {
        console.warn(`Warning: Could not update profile for ${email}: ${profileError.message}`);
    } else {
        console.log(`  → Profile linked to organization`);
    }
}

/**
 * Setup: Ensure test users exist and authenticate as admin
 */
setup('authenticate as admin', async ({ page }) => {
    console.log('\n=== Auth Setup ===\n');

    // Step 1: Ensure test users exist via Admin API
    try {
        const adminClient = getAdminClient();

        // Create admin user
        await ensureTestUser(
            adminClient,
            TEST_ADMIN.email,
            TEST_ADMIN.password,
            TEST_ADMIN.name,
            'admin',
            TEST_ORG_ID
        );

        // Create staff user
        await ensureTestUser(
            adminClient,
            TEST_STAFF.email,
            TEST_STAFF.password,
            TEST_STAFF.name,
            'staff',
            TEST_ORG_ID
        );

        console.log('\n✓ Test users ready\n');
    } catch (error) {
        console.error('Failed to setup test users:', error);
        throw error;
    }

    // Step 2: Log in via the UI
    console.log(`Logging in as ${TEST_ADMIN.email}...`);

    await page.goto('/login');

    // Fill in credentials
    await page.locator('input[type="email"]').fill(TEST_ADMIN.email);
    await page.locator('input[type="password"]').fill(TEST_ADMIN.password);

    // Click sign in
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect to org dashboard (confirms successful login)
    await expect(page).toHaveURL(/\/org\/[^/]+\/dashboard/, { timeout: 15000 });

    // Verify we're logged in by checking for authenticated UI elements
    await expect(page.locator('nav, [data-testid="sidebar"]').first()).toBeVisible({ timeout: 5000 });

    // Save authentication state
    await page.context().storageState({ path: AUTH_FILE });

    console.log(`\n✅ Admin authentication saved to ${AUTH_FILE}\n`);
});
