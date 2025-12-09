import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Smoke Tests: Navigation
 * 
 * These tests verify that navigation links work correctly across the application.
 */

test.describe('Navigation Smoke Tests', () => {

    test.describe('Homepage Navigation', () => {
        test('announcements card links to announcements page', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click announcements link
            const announcementsLink = page.getByRole('link', { name: /announcements/i }).first();
            await announcementsLink.click();

            // Should navigate to announcements page
            await expect(page).toHaveURL(/announcements/);
        });

        test('day off card links to public form', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click day off link
            const dayOffLink = page.getByRole('link', { name: /day off|request day/i }).first();
            await dayOffLink.click();

            // Should navigate to day off form
            await expect(page).toHaveURL(/forms\/day-off|day-off/);
        });

        test('time clock card links to public form', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click time clock link
            const timeClockLink = page.getByRole('link', { name: /time clock/i }).first();
            await timeClockLink.click();

            // Should navigate to time clock form
            await expect(page).toHaveURL(/forms\/time-clock|time-clock/);
        });

        test('overtime card links to public form', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Find and click overtime link
            const overtimeLink = page.getByRole('link', { name: /overtime/i }).first();
            await overtimeLink.click();

            // Should navigate to overtime form
            await expect(page).toHaveURL(/forms\/overtime|overtime/);
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

            // Navigate to announcements
            await page.goto(TEST_URLS.announcements);

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
