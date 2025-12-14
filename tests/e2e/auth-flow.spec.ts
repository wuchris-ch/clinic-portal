import { test, expect } from '@playwright/test';
import { TEST_URLS, TEST_ORG_URLS } from '../setup';

/**
 * Smoke Tests: Authentication Flow
 *
 * These tests verify authentication-related functionality:
 * - Protected routes redirect to login
 * - Login page renders correctly
 * - Auth forms have correct structure
 */

test.describe('Authentication Flow Smoke Tests', () => {

    test.describe('Org-Scoped Protected Route Redirects', () => {
        test('org dashboard redirects unauthenticated users to login', async ({ page }) => {
            // Try to access org dashboard without auth
            await page.goto(TEST_ORG_URLS.dashboard);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('org admin page redirects unauthenticated users to login', async ({ page }) => {
            // Try to access org admin without auth
            await page.goto(TEST_ORG_URLS.admin);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('org calendar page redirects unauthenticated users to login', async ({ page }) => {
            // Try to access org calendar without auth
            await page.goto(TEST_ORG_URLS.calendar);

            // Should redirect to login
            await expect(page).toHaveURL(/login/);
        });

        test('org dashboard day-off form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardDayOff);
            await expect(page).toHaveURL(/login/);
        });

        test('org dashboard time-clock form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardTimeClock);
            await expect(page).toHaveURL(/login/);
        });

        test('org dashboard overtime form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardOvertime);
            await expect(page).toHaveURL(/login/);
        });

        test('org dashboard vacation form redirects unauthenticated users', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardVacation);
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Legacy Protected Route Redirects', () => {
        test('legacy dashboard redirects unauthenticated users to login', async ({ page }) => {
            await page.goto(TEST_URLS.legacyDashboard);
            await expect(page).toHaveURL(/login/);
        });

        test('legacy admin page redirects unauthenticated users to login', async ({ page }) => {
            await page.goto(TEST_URLS.legacyAdmin);
            await expect(page).toHaveURL(/login/);
        });

        test('legacy calendar page redirects unauthenticated users to login', async ({ page }) => {
            await page.goto(TEST_URLS.legacyCalendar);
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
            const pageContent = page.getByText(/create|sign up|register|join|staffhub|organization/i);
            await expect(pageContent.first()).toBeVisible();
        });

        test('register form has all required fields', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Organization name field (multi-tenancy)
            const orgField = page.getByLabel(/organization/i).first();
            await expect(orgField).toBeVisible();

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

            const submitButton = page.getByRole('button', { name: /join organization|sign up|register|create|submit/i });
            await expect(submitButton.first()).toBeVisible();
        });

        test('register page has home navigation', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Should have a link/button to go back home
            const homeLink = page.getByRole('link', { name: /home/i })
                .or(page.getByRole('button', { name: /home/i }));
            await expect(homeLink.first()).toBeVisible();
        });

        test('register page has link to org registration', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Should have link to register an organization
            const orgRegLink = page.getByRole('link', { name: /register your organization|clinic administrator/i });
            await expect(orgRegLink.first()).toBeVisible();
        });

        test('org registration link navigates to register-org page', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const orgRegLink = page.getByRole('link', { name: /register your organization|clinic administrator/i }).first();
            await orgRegLink.click();

            await expect(page).toHaveURL(/register-org/);
        });
    });

    test.describe('Organization Registration Page Structure', () => {
        test('register-org page renders correctly', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            // Should have form content
            const pageContent = page.getByText(/register|organization|clinic|staffhub/i);
            await expect(pageContent.first()).toBeVisible();
        });

        test('register-org form has all required fields', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            // Organization name
            const orgNameField = page.getByLabel(/organization.*name|clinic.*name/i);
            await expect(orgNameField.first()).toBeVisible();

            // Admin name
            const adminNameField = page.getByLabel(/your name|admin/i);
            await expect(adminNameField.first()).toBeVisible();

            // Email field
            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'));
            await expect(emailField.first()).toBeVisible();

            // Password fields
            const passwordFields = page.locator('input[type="password"]');
            await expect(passwordFields).toHaveCount(2); // Password and confirm password
        });

        test('register-org form has submit button', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const submitButton = page.getByRole('button', { name: /create organization|register/i });
            await expect(submitButton.first()).toBeVisible();
        });

        test('register-org page has link to staff registration', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            // Should have link to join existing org as staff
            const staffRegLink = page.getByRole('link', { name: /join.*existing|register as staff/i });
            await expect(staffRegLink.first()).toBeVisible();
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
        test('homepage is accessible without authentication', async ({ page }) => {
            await page.goto(TEST_URLS.home);
            await expect(page).not.toHaveURL(/login/);
            await expect(page).toHaveURL('/');
        });

        // Documentation is now org-scoped and requires authentication
        // See documentation.spec.ts for protected documentation tests

        test('login page is accessible without authentication', async ({ page }) => {
            await page.goto(TEST_URLS.login);
            await expect(page).toHaveURL(/login/);
        });

        test('register page is accessible without authentication', async ({ page }) => {
            await page.goto(TEST_URLS.register);
            await expect(page).toHaveURL(/register/);
        });

        test('register-org page is accessible without authentication', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);
            await expect(page).toHaveURL(/register-org/);
        });
    });
});
