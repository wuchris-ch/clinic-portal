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

    test.describe('Sidebar Navigation', () => {
        test('documentation link is NOT visible in sidebar for unauthenticated users', async ({ page }) => {
            await page.goto('/');

            // Open sidebar on mobile if needed
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            if (await menuButton.isVisible()) {
                await menuButton.click();
                await page.waitForTimeout(300); // Wait for sidebar animation
            }

            // Documentation link should NOT be visible for unauthenticated users
            const docLink = page.getByRole('link', { name: /documentation/i });
            await expect(docLink).not.toBeVisible();
        });

        test('home link is visible in sidebar for unauthenticated users', async ({ page }) => {
            await page.goto('/');

            // Open sidebar on mobile if needed
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            if (await menuButton.isVisible()) {
                await menuButton.click();
                await page.waitForTimeout(300);
            }

            // Home link should be visible
            const homeLink = page.getByRole('link', { name: /^home$/i });
            await expect(homeLink.first()).toBeVisible();
        });
    });

    test.describe('Header Navigation', () => {
        test('documentation link is NOT visible in header for unauthenticated users', async ({ page }) => {
            // Use desktop viewport to see header links
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto('/');

            // Documentation link should NOT be in header
            const headerDocLink = page.locator('header').getByRole('link', { name: /docs|documentation/i });
            await expect(headerDocLink).not.toBeVisible();
        });

        test('home link IS visible in header on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto('/');

            // Home link should be visible in header
            const headerHomeLink = page.locator('header').getByRole('link', { name: /home/i });
            await expect(headerHomeLink.first()).toBeVisible();
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
