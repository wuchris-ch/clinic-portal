import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Smoke Tests: Navigation
 *
 * These tests verify that navigation links work correctly across the application.
 * Note: Public forms have been removed in favor of org-scoped authenticated forms.
 */

test.describe('Navigation Smoke Tests', () => {

    test.describe('Homepage Navigation', () => {
        test('homepage loads correctly', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Should display StaffHub branding
            await expect(page.getByRole('heading', { name: /staffhub/i })).toBeVisible();
        });

        test('register org button links to registration page', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click register organization link
            const registerOrgLink = page.getByRole('link', { name: /register organization/i }).first();
            await registerOrgLink.click();

            // Should navigate to register-org page
            await expect(page).toHaveURL(/register-org/);
        });

        test('sign in link navigates to login', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click sign in link
            const signInLink = page.getByRole('link', { name: /sign in/i }).first();
            await signInLink.click();

            // Should navigate to login page
            await expect(page).toHaveURL(/login/);
        });

        test('staff registration link navigates to register', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click staff registration link
            const staffLink = page.getByRole('link', { name: /register as staff/i }).first();
            await staffLink.click();

            // Should navigate to register page
            await expect(page).toHaveURL(/register/);
        });
    });

    test.describe('Login Page Navigation', () => {
        test('login page has home button', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Find home button/link
            const homeLink = page.getByRole('link', { name: /home|back/i })
                .or(page.getByRole('button', { name: /home/i }))
                .or(page.locator('a[href="/"]'));

            await expect(homeLink.first()).toBeVisible();
        });

        test('home button on login page navigates to homepage', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Find and click home link
            const homeLink = page.getByRole('link', { name: /home/i })
                .or(page.locator('a[href="/"]'))
                .first();
            await homeLink.click();

            // Should navigate to homepage
            await expect(page).toHaveURL('/');
        });

        test('login page has register link', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Find register/signup link
            const registerLink = page.getByRole('link', { name: /sign up|register|create account/i });
            await expect(registerLink.first()).toBeVisible();
        });

        test('register link navigates to register page', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const registerLink = page.getByRole('link', { name: /sign up|register/i }).first();
            await registerLink.click();

            await expect(page).toHaveURL(/register/);
        });
    });

    test.describe('Register Page Navigation', () => {
        test('register page has login link', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Find sign in link
            const loginLink = page.getByRole('link', { name: /sign in|log in|login/i });
            await expect(loginLink.first()).toBeVisible();
        });

        test('login link on register page navigates to login', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const loginLink = page.getByRole('link', { name: /sign in|log in|login/i }).first();
            await loginLink.click();

            await expect(page).toHaveURL(/login/);
        });

        test('register page has org registration link', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const orgLink = page.getByRole('link', { name: /register your organization|clinic administrator/i });
            await expect(orgLink.first()).toBeVisible();
        });

        test('org registration link navigates to register-org', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const orgLink = page.getByRole('link', { name: /register your organization|clinic administrator/i }).first();
            await orgLink.click();

            await expect(page).toHaveURL(/register-org/);
        });
    });

    test.describe('Organization Registration Page Navigation', () => {
        test('register-org page has login link', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const loginLink = page.getByRole('link', { name: /sign in|log in|login/i });
            await expect(loginLink.first()).toBeVisible();
        });

        test('register-org page has staff registration link', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const staffLink = page.getByRole('link', { name: /join.*existing|register as staff/i });
            await expect(staffLink.first()).toBeVisible();
        });

        test('staff registration link navigates to register page', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const staffLink = page.getByRole('link', { name: /join.*existing|register as staff/i }).first();
            await staffLink.click();

            await expect(page).toHaveURL(/\/register$/);
        });

        test('register-org page has home button', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const homeLink = page.getByRole('link', { name: /home/i })
                .or(page.getByRole('button', { name: /home/i }));
            await expect(homeLink.first()).toBeVisible();
        });
    });

    test.describe('Header/Brand Navigation', () => {
        test('brand logo links to homepage from login', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Find brand/logo link (usually in header)
            const brandLink = page.getByRole('link', { name: /staffhub/i })
                .or(page.locator('header a').first())
                .or(page.locator('a:has(svg)').first());

            if (await brandLink.first().isVisible()) {
                await brandLink.first().click();
                await expect(page).toHaveURL('/');
            }
        });
    });

    test.describe('Browser Navigation', () => {
        test('back button works correctly', async ({ page }) => {
            // Start at home
            await page.goto(TEST_URLS.home);

            // Navigate to login
            await page.goto(TEST_URLS.login);

            // Go back
            await page.goBack();

            // Should be back at home
            await expect(page).toHaveURL('/');
        });

        test('forward button works correctly', async ({ page }) => {
            // Navigate through pages
            await page.goto(TEST_URLS.home);
            await page.goto(TEST_URLS.login);

            // Go back
            await page.goBack();
            await expect(page).toHaveURL('/');

            // Go forward
            await page.goForward();
            await expect(page).toHaveURL(/login/);
        });
    });
});
