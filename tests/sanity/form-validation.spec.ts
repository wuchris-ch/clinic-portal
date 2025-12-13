import { test, expect } from '@playwright/test';
import { TEST_URLS, TEST_ORG_URLS } from '../setup';

/**
 * Sanity Tests: Form Validation
 *
 * Note: Public forms have been removed. Forms are now org-scoped and require authentication.
 * These tests verify form route protection and auth form validation.
 *
 * Full form validation tests (field validation, submission, etc.) would require
 * authenticated test fixtures with valid org membership.
 */

test.describe('Form Validation Sanity Tests', () => {

    test.describe('Org-Scoped Form Route Protection', () => {
        test('day-off form requires authentication', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardDayOff);
            await expect(page).toHaveURL(/login/);
        });

        test('time-clock form requires authentication', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardTimeClock);
            await expect(page).toHaveURL(/login/);
        });

        test('overtime form requires authentication', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardOvertime);
            await expect(page).toHaveURL(/login/);
        });

        test('vacation form requires authentication', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardVacation);
            await expect(page).toHaveURL(/login/);
        });

        test('sick-day form requires authentication', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardSickDay);
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Login Form Validation', () => {
        test('email field is required', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'))
                .first();

            const isRequired = await emailField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('password field is required', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const passwordField = page.getByLabel(/password/i)
                .or(page.locator('input[type="password"]'))
                .first();

            const isRequired = await passwordField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('email field validates format', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const emailField = page.locator('input[type="email"]').first();
            await emailField.fill('notanemail');
            await emailField.blur();

            const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });

        test('email field accepts valid email', async ({ page }) => {
            await page.goto(TEST_URLS.login);

            const emailField = page.locator('input[type="email"]').first();
            await emailField.fill('valid@example.com');
            await emailField.blur();

            const isValid = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
            expect(isValid).toBe(true);
        });
    });

    test.describe('Register Form Validation', () => {
        test('organization field is required', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const orgField = page.getByLabel(/organization/i).first();
            await expect(orgField).toBeVisible();

            // Check for required attribute
            const isRequired = await orgField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('email field validates format', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const emailField = page.locator('input[type="email"]').first();
            await emailField.fill('invalid-email');
            await emailField.blur();

            const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });

        test('password fields are present', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const passwordFields = page.locator('input[type="password"]');
            await expect(passwordFields).toHaveCount(2);
        });
    });

    test.describe('Register Org Form Validation', () => {
        test('organization name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const orgNameField = page.getByLabel(/organization.*name|clinic.*name/i).first();
            await expect(orgNameField).toBeVisible();

            const isRequired = await orgNameField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('admin name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const adminNameField = page.getByLabel(/your name|admin/i).first();
            await expect(adminNameField).toBeVisible();

            const isRequired = await adminNameField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('has password confirmation field', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            const passwordFields = page.locator('input[type="password"]');
            await expect(passwordFields).toHaveCount(2);
        });

        test('validates password match', async ({ page }) => {
            await page.goto(TEST_URLS.registerOrg);

            // Fill form with mismatched passwords
            await page.getByLabel(/organization.*name|clinic.*name/i).first().fill('Test Org');
            await page.getByLabel(/your name|admin/i).first().fill('Test Admin');
            await page.locator('input[type="email"]').first().fill('test@example.com');

            const passwordFields = page.locator('input[type="password"]');
            await passwordFields.first().fill('password123');
            await passwordFields.last().fill('password456'); // Mismatched

            await page.getByRole('button', { name: /create organization/i }).click();

            // Should show error or stay on page
            await page.waitForTimeout(1000);
            const errorText = page.getByText(/password.*not match|passwords must match/i);
            await expect(errorText.first()).toBeVisible();
        });
    });
});
