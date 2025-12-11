import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Smoke Tests: Authentication Flow
 * 
 * These tests verify authentication-related functionality:
 * - Protected routes redirect to login
 * - Login page renders correctly
 * - Auth forms have correct structure
 */

test.describe('Authentication Flow Smoke Tests', () => {

    test.describe('Protected Route Redirects', () => {
        test('dashboard redirects unauthenticated users to login', async ({ page }) => {
            // Try to access dashboard without auth
            await page.goto(TEST_URLS.dashboard);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('admin page redirects unauthenticated users to login', async ({ page }) => {
            // Try to access admin without auth
            await page.goto(TEST_URLS.admin);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('calendar page redirects unauthenticated users to login', async ({ page }) => {
            // Try to access calendar without auth
            await page.goto(TEST_URLS.calendar);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('dashboard day-off form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_URLS.dashboardDayOff);
            await expect(page).toHaveURL(/login/);
        });

        test('dashboard time-clock form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_URLS.dashboardTimeClock);
            await expect(page).toHaveURL(/login/);
        });

        test('dashboard overtime form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_URLS.dashboardOvertime);
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Login Page Structure', () => {
        test('login page renders correctly', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Should have title/heading or card content
            const pageContent = page.getByText(/welcome|sign in|staffhub/i);
            await expect(pageContent.first()).toBeVisible();
        });

        test('login form has email field', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'));
            await expect(emailField.first()).toBeVisible();
        });

        test('login form has password field', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const passwordField = page.getByLabel(/password/i)
                .or(page.locator('input[type="password"]'));
            await expect(passwordField.first()).toBeVisible();
        });

        test('login form has submit button', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });
            await expect(submitButton.first()).toBeVisible();
        });

        test('login page has Google OAuth option', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const googleButton = page.getByRole('button', { name: /google/i })
                .or(page.getByText(/continue with google/i));
            await expect(googleButton.first()).toBeVisible();
        });
    });

    test.describe('Register Page Structure', () => {
        test('register page renders correctly', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Should have form content
            const pageContent = page.getByText(/create|sign up|register|join|staffhub/i);
            await expect(pageContent.first()).toBeVisible();
        });

        test('register form has all required fields', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Email field
            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'));
            await expect(emailField.first()).toBeVisible();

            // Password field
            const passwordField = page.getByLabel(/password/i)
                .or(page.locator('input[type="password"]'));
            await expect(passwordField.first()).toBeVisible();
        });

        test('register form has submit button', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const submitButton = page.getByRole('button', { name: /sign up|register|create|submit/i });
            await expect(submitButton.first()).toBeVisible();
        });
    });

    test.describe('Login Form Interaction', () => {
        test('email field accepts input', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'))
                .first();

            await emailField.fill('test@example.com');
            await expect(emailField).toHaveValue('test@example.com');
        });

        test('password field accepts input and masks characters', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const passwordField = page.getByLabel(/password/i)
                .or(page.locator('input[type="password"]'))
                .first();

            await passwordField.fill('testpassword123');

            // Check input type is password (masked)
            await expect(passwordField).toHaveAttribute('type', 'password');
            await expect(passwordField).toHaveValue('testpassword123');
        });

        test('form can be submitted (shows error for invalid credentials)', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Fill form with test credentials
            await page.getByLabel(/email/i).first().fill('invalid@test.com');
            await page.getByLabel(/password/i).first().fill('wrongpassword');

            // Submit form
            const submitButton = page.getByRole('button', { name: /sign in/i }).first();
            await submitButton.click();

            // Should show some feedback (error message or stay on login page)
            // The exact behavior depends on implementation
            await page.waitForTimeout(2000); // Wait for response

            // Should either show error or stay on login page (not crash)
            const currentUrl = page.url();
            const hasError = await page.locator('[role="alert"], .error, .toast').isVisible()
                .catch(() => false);

            expect(currentUrl.includes('login') || hasError).toBe(true);
        });
    });

    test.describe('Password Visibility Toggle', () => {
        test('login page has password visibility toggle button', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            // Should have the toggle button with aria-label
            const toggleButton = page.getByRole('button', { name: /show password|hide password/i });
            await expect(toggleButton).toBeVisible();
        });

        test('login password toggle reveals and hides password', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const passwordField = page.locator('#password');
            const toggleButton = page.getByRole('button', { name: /show password/i });

            // Fill in a password
            await passwordField.fill('testpassword123');

            // Initially should be hidden (type="password")
            await expect(passwordField).toHaveAttribute('type', 'password');

            // Click to reveal password
            await toggleButton.click();

            // Should now be visible (type="text")
            await expect(passwordField).toHaveAttribute('type', 'text');

            // Click again to hide
            const hideButton = page.getByRole('button', { name: /hide password/i });
            await hideButton.click();

            // Should be hidden again
            await expect(passwordField).toHaveAttribute('type', 'password');
        });

        test('register page has password visibility toggle buttons', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Should have toggle buttons for both password fields
            const toggleButtons = page.getByRole('button', { name: /show password|hide password/i });
            await expect(toggleButtons).toHaveCount(2);
        });

        test('register password toggle reveals and hides password', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const passwordField = page.locator('#password');
            const confirmPasswordField = page.locator('#confirmPassword');

            // Fill passwords
            await passwordField.fill('testpassword123');
            await confirmPasswordField.fill('testpassword123');

            // Both should be hidden initially
            await expect(passwordField).toHaveAttribute('type', 'password');
            await expect(confirmPasswordField).toHaveAttribute('type', 'password');

            // Click first toggle (password field)
            const toggleButtons = page.getByRole('button', { name: /show password/i });
            await toggleButtons.first().click();

            // First field should be visible, second still hidden
            await expect(passwordField).toHaveAttribute('type', 'text');
            await expect(confirmPasswordField).toHaveAttribute('type', 'password');

            // Click second toggle (confirm password field)
            await toggleButtons.first().click(); // This is now the confirm password toggle

            // Both should be visible now
            await expect(confirmPasswordField).toHaveAttribute('type', 'text');
        });
    });

    test.describe('Public Routes Accessibility', () => {
        test('public forms are accessible without authentication', async ({ page }) => {
            // Public day off form
            await page.goto(TEST_URLS.publicDayOff);
            await expect(page).not.toHaveURL(/login/);

            // Public time clock form
            await page.goto(TEST_URLS.publicTimeClock);
            await expect(page).not.toHaveURL(/login/);

            // Public overtime form
            await page.goto(TEST_URLS.publicOvertime);
            await expect(page).not.toHaveURL(/login/);
        });

        test('homepage is accessible without authentication', async ({ page }) => {
            await page.goto(TEST_URLS.home);
            await expect(page).not.toHaveURL(/login/);
            await expect(page).toHaveURL('/');
        });

        test('announcements page is accessible without authentication', async ({ page }) => {
            await page.goto(TEST_URLS.announcements);
            await expect(page).not.toHaveURL(/login/);
        });
    });
});
