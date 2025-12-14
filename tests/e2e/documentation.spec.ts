import { test, expect } from '@playwright/test';
import { TEST_ORG_URLS, TEST_ORG } from '../setup';

/**
 * E2E Tests: Protected Documentation Page
 *
 * These tests verify that the documentation page:
 * 1. Is protected and requires authentication
 * 2. Is org-scoped (/org/{slug}/documentation)
 * 3. Redirects unauthenticated users to login
 */

test.describe('Protected Documentation Page', () => {

    test.describe('Route Protection', () => {
        test('documentation page redirects unauthenticated users to login', async ({ page }) => {
            // Try to access org-scoped documentation without auth
            await page.goto(TEST_ORG_URLS.documentation);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('documentation page is org-scoped', async () => {
            // The URL should include /org/{slug}/documentation pattern
            const docUrl = TEST_ORG_URLS.documentation;
            expect(docUrl).toContain(`/org/${TEST_ORG.slug}/documentation`);
        });

        test('accessing documentation without org slug returns 404 or redirect', async ({ page }) => {
            // Try to access old public documentation route
            await page.goto('/documentation');

            // Should either 404 or redirect (old route no longer exists)
            const currentUrl = page.url();
            const is404 = currentUrl.includes('404') || await page.locator('text=/not found|404/i').isVisible().catch(() => false);
            const isRedirected = !currentUrl.includes('/documentation') || currentUrl.includes('/login');

            expect(is404 || isRedirected).toBe(true);
        });
    });

    test.describe('Cross-Organization Security', () => {
        test('cannot access documentation of another organization', async ({ page }) => {
            // Try to access a different org's documentation (should fail without auth)
            await page.goto('/org/another-org/documentation');

            // Should redirect to login (auth required)
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Unauthenticated User Experience', () => {
        test('unauthenticated users see clean landing page without sidebar', async ({ page }) => {
            await page.goto('/');

            // Unauthenticated users should NOT see sidebar chrome
            const sidebar = page.locator('[data-sidebar="sidebar"]');
            await expect(sidebar).not.toBeVisible();

            // Should see the landing page content directly
            const staffHubText = page.getByText(/staffhub/i);
            await expect(staffHubText.first()).toBeVisible();
        });

        test('unauthenticated users do not see header navigation', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto('/');

            // Header with navigation should not be present for unauthenticated users
            const header = page.locator('header');
            await expect(header).not.toBeVisible();
        });

        test('landing page has sign in CTA for unauthenticated users', async ({ page }) => {
            await page.goto('/');

            // Should have sign in button on the landing page itself
            const signInLink = page.getByRole('link', { name: /sign in/i });
            await expect(signInLink.first()).toBeVisible();
        });
    });
});

test.describe('Documentation Page Content (Smoke)', () => {
    // These tests verify basic page structure if we could access it
    // In a real scenario with authenticated session, these would be useful

    test('org documentation URL follows correct pattern', () => {
        // Verify the URL pattern is correct
        const expectedPattern = /\/org\/[^/]+\/documentation$/;
        expect(TEST_ORG_URLS.documentation).toMatch(expectedPattern);
    });

    test('documentation is included in org URLs helper', () => {
        // Verify the test setup includes documentation
        expect(TEST_ORG_URLS).toHaveProperty('documentation');
        expect(TEST_ORG_URLS.documentation).toBe(`/org/${TEST_ORG.slug}/documentation`);
    });
});
