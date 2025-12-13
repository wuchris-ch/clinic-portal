import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * E2E Tests: Public Pages Accessibility
 *
 * These tests verify that all public pages load correctly without authentication.
 * Note: Public forms have been removed - forms are now org-scoped and require auth.
 */

test.describe('Public Pages E2E Tests', () => {

    test.describe('Homepage', () => {
        test('homepage loads successfully', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Check page loads without errors
            await expect(page).toHaveTitle(/StaffHub|Clinic|Portal/i);

            // Check main content is visible
            await expect(page.locator('body').first()).toBeVisible();

            // Check for key homepage elements
            const pageContent = page.getByText(/StaffHub/i);
            await expect(pageContent.first()).toBeVisible();
        });

        test('homepage has registration options', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Check for organization registration link
            const registerOrgLink = page.getByRole('link', { name: /register organization/i });
            await expect(registerOrgLink.first()).toBeVisible();

            // Check for staff registration link
            const staffLink = page.getByRole('link', { name: /register as staff/i });
            await expect(staffLink.first()).toBeVisible();

            // Check for sign in link
            const signInLink = page.getByRole('link', { name: /sign in/i });
            await expect(signInLink.first()).toBeVisible();
        });

        test('homepage has feature descriptions', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Check for feature mentions
            const features = [
                /Day Off|Request/i,
                /Time Clock/i,
                /Overtime/i,
            ];

            for (const feature of features) {
                const element = page.getByText(feature).first();
                await expect(element).toBeVisible();
            }
        });
    });

    test.describe('Documentation Page', () => {
        test('documentation page loads', async ({ page }) => {
            await page.goto(TEST_URLS.documentation);

            // Page should load without error
            await expect(page).not.toHaveURL(/error|404/);

            // Should have documentation content
            await expect(page.locator('body')).toContainText(/documentation|handbook|protocol/i);
        });

        test('documentation page is accessible without auth', async ({ page }) => {
            await page.goto(TEST_URLS.documentation);

            // Should NOT redirect to login
            await expect(page).not.toHaveURL(/login/);
        });
    });

    test.describe('Auth Pages Are Publicly Accessible', () => {
        test('login page is accessible', async ({ page }) => {
            await page.goto(TEST_URLS.login);
            await expect(page).toHaveURL(/login/);
            await expect(page.locator('form')).toBeVisible();
        });

        test('register page is accessible', async ({ page }) => {
            await page.goto(TEST_URLS.register);
            await expect(page).toHaveURL(/register/);
            await expect(page.locator('form')).toBeVisible();
        });

        test('register-org page is accessible', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);
            await expect(page).toHaveURL(/register-org/);
            await expect(page.locator('form')).toBeVisible();
        });
    });

    test.describe('Page Error Handling', () => {
        test('pages load without JavaScript errors', async ({ page }) => {
            const errors: string[] = [];

            page.on('pageerror', (error) => {
                errors.push(error.message);
            });

            // Visit critical public pages
            await page.goto(TEST_URLS.home);
            await page.goto(TEST_URLS.documentation);
            await page.goto(TEST_URLS.login);
            await page.goto(TEST_URLS.register);

            // Filter out benign errors (like React hydration warnings in dev)
            const criticalErrors = errors.filter(e =>
                !e.includes('Hydration') &&
                !e.includes('Warning:') &&
                !e.includes('ResizeObserver')
            );

            expect(criticalErrors).toHaveLength(0);
        });
    });
});
