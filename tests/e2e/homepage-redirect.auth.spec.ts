import { test, expect } from '@playwright/test';
import { TEST_ORG_URLS, TEST_URLS } from '../setup';

/**
 * E2E Tests: Homepage Redirect for Authenticated Users
 *
 * Tests the public layout redirect logic:
 * - Logged-in users with an org → redirect to their org dashboard
 * - This prevents authenticated users from seeing the marketing landing page
 *
 * File naming: *.auth.spec.ts runs in the 'authenticated' project
 * which uses the saved auth state from tests/.auth/admin.json
 */

test.describe('Homepage Redirect - Authenticated Users', () => {

    test('logged-in user visiting homepage redirects to org dashboard', async ({ page }) => {
        // Visit the homepage as an authenticated user
        await page.goto(TEST_URLS.home);

        // Should redirect to the user's org dashboard (may include sub-route like /day-off)
        await expect(page).toHaveURL(new RegExp(`${TEST_ORG_URLS.dashboard}(/.*)?$`));
    });

    test('redirect preserves user session after landing on dashboard', async ({ page }) => {
        // Visit homepage
        await page.goto(TEST_URLS.home);

        // Wait for redirect to complete (dashboard or sub-route)
        await expect(page).toHaveURL(new RegExp(`${TEST_ORG_URLS.dashboard}(/.*)?$`));

        // Verify we're actually on the dashboard (not just redirected to login)
        // The dashboard should show some indication of being logged in
        const dashboardContent = page.getByText(/time.?off|request|dashboard/i);
        await expect(dashboardContent.first()).toBeVisible();
    });

    test('direct navigation to homepage always redirects', async ({ page }) => {
        // First go to dashboard
        await page.goto(TEST_ORG_URLS.dashboard);
        await expect(page).toHaveURL(new RegExp(`${TEST_ORG_URLS.dashboard}(/.*)?$`));

        // Then try to navigate to homepage
        await page.goto(TEST_URLS.home);

        // Should redirect back to dashboard
        await expect(page).toHaveURL(new RegExp(`${TEST_ORG_URLS.dashboard}(/.*)?$`));
    });

});
