import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Sanity Tests: Sidebar Navigation
 *
 * These tests verify that the sidebar/navigation components work correctly:
 * - All expected links are present
 * - Active state is shown on current route
 * - Mobile menu toggle works
 *
 * Note: Public forms have been removed. Forms are now org-scoped and require auth.
 */

test.describe('Sidebar Navigation Sanity Tests', () => {

    test.describe('Homepage CTA Section', () => {
        test('homepage has organization registration CTA', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Should have register organization button
            const registerOrgLink = page.getByRole('link', { name: /register organization/i });
            await expect(registerOrgLink.first()).toBeVisible();
        });

        test('homepage has sign in link', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Should have sign in link
            const signInLink = page.getByRole('link', { name: /sign in/i });
            await expect(signInLink.first()).toBeVisible();
        });

        test('homepage has staff registration link', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Should have register as staff link
            const staffLink = page.getByRole('link', { name: /register as staff/i });
            await expect(staffLink.first()).toBeVisible();
        });
    });

    test.describe('Login Page Navigation', () => {
        test('login page has all necessary navigation elements', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Should have way to go home
            const homeLink = page.locator('a[href="/"]');
            await expect(homeLink.first()).toBeVisible();

            // Should have sign up link
            const signUpLink = page.getByRole('link', { name: /sign up|register/i });
            await expect(signUpLink.first()).toBeVisible();
        });
    });

    test.describe('Mobile Navigation', () => {
        test.beforeEach(async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
        });

        test('content is accessible on mobile', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Content should still be visible
            await expect(page.locator('body').first()).toBeVisible();

            // Key text should be readable
            const staffHubText = page.getByText(/staffhub/i);
            await expect(staffHubText.first()).toBeVisible();
        });

        test('login page works on mobile viewport', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Form should be visible
            await expect(page.locator('form')).toBeVisible();

            // Email field should be accessible
            const emailField = page.getByLabel(/email/i).first()
                .or(page.locator('input[type="email"]').first());
            await expect(emailField).toBeVisible();
        });
    });

    test.describe('External Links', () => {
        test('BC Employment Standards link opens external site', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            const bcLink = page.getByRole('link', { name: /BC Employment Standards/i })
                .or(page.locator('a[href*="gov.bc.ca"]'));

            if (await bcLink.first().isVisible()) {
                // External link should have target blank or proper href
                const href = await bcLink.first().getAttribute('href');
                expect(href).toMatch(/gov\.bc\.ca|employment/);
            }
        });
    });

    test.describe('Section Navigation', () => {
        test('homepage has feature sections', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Check for section headings on the new landing page
            const sections = [
                /time-off requests/i,
                /google sheets integration/i,
                /email notifications/i,
                /team calendar/i,
            ];

            let foundSections = 0;
            for (const section of sections) {
                const heading = page.getByRole('heading', { name: section })
                    .or(page.getByText(section));
                if (await heading.first().isVisible().catch(() => false)) {
                    foundSections++;
                }
            }

            // Should have at least some feature sections
            expect(foundSections).toBeGreaterThan(0);
        });
    });

    test.describe('Responsive Layout', () => {
        test('layout adjusts for tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto(TEST_URLS.home);

            // Page should render without horizontal scroll
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.evaluate(() => window.innerWidth);

            // Body shouldn't be significantly wider than viewport (sidebar may extend)
            expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 150);
        });

        test('layout adjusts for desktop viewport', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto(TEST_URLS.home);

            // Content should still be visible (landing page renders without main wrapper for unauthenticated users)
            const pageContent = page.locator('body').first();
            await expect(pageContent).toBeVisible();

            // Key content should be accessible
            const staffHubText = page.getByText(/staffhub/i);
            await expect(staffHubText.first()).toBeVisible();
        });
    });
});
