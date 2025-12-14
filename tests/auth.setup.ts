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
    // Try to create the user first - if they exist, we'll get an error we can handle
    console.log(`Ensuring user ${email} exists...`);
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
            full_name: fullName,
        },
    });

    let userId: string;

    if (createError) {
        // User already exists - this is expected and OK
        if (createError.message.includes('already been registered')) {
            console.log(`✓ User ${email} already exists`);
            // Find the user by querying profiles table (more reliable than listUsers pagination)
            const { data: profile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (!profile) {
                // Fallback: iterate through auth users to find by email
                const { data: users } = await adminClient.auth.admin.listUsers();
                const matchingUser = users?.users?.find((u) => u.email === email);
                if (matchingUser) {
                    userId = matchingUser.id;
                } else {
                    console.warn(`  → Could not find user ID for ${email}, skipping profile update`);
                    return;
                }
            } else {
                userId = profile.id;
            }
        } else {
            throw new Error(`Failed to create user ${email}: ${createError.message}`);
        }
    } else if (!newUser?.user) {
        throw new Error(`Failed to create user ${email}: No user returned`);
    } else {
        console.log(`✓ Created user ${email}`);
        userId = newUser.user.id;
        // Brief wait for profile trigger
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Ensure profile is linked to org
    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            organization_id: organizationId,
            role: role,
            full_name: fullName,
        } as Record<string, unknown>)
        .eq('id', userId);

    if (profileError) {
        console.warn(`  → Warning: Could not update profile for ${email}: ${profileError.message}`);
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
