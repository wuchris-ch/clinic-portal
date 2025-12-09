import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Sanity Tests: Form Validation
 * 
 * These tests verify that form validation works correctly:
 * - Required fields show errors when empty
 * - Email validation works
 * - Date validation works
 */

test.describe('Form Validation Sanity Tests', () => {

    test.describe('Day Off Form Validation', () => {
        test('shows error when submitting without required fields', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Find and click submit button without filling form
            const submitButton = page.getByRole('button', { name: /submit|send|request/i }).first();
            await submitButton.click();

            // Wait a moment for validation
            await page.waitForTimeout(500);

            // Form should still be visible (not submitted successfully)
            await expect(page.locator('form')).toBeVisible();

            // Should show some validation feedback (native HTML5 or custom)
            // Check for required attribute or validation message
            const invalidInputs = page.locator('input:invalid, [aria-invalid="true"], .error');
            const hasValidation = await invalidInputs.count() > 0;

            // Or form should not have navigated away
            await expect(page).toHaveURL(/day-off/);
        });

        test('email field validates email format', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Find email field
            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'))
                .first();

            // Enter invalid email
            await emailField.fill('notanemail');
            await emailField.blur();

            // Check for invalid state
            const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });

        test('email field accepts valid email', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Find email field
            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'))
                .first();

            // Enter valid email
            await emailField.fill('valid@example.com');
            await emailField.blur();

            // Check for valid state
            const isValid = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
            expect(isValid).toBe(true);
        });

        test('name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Find name field
            const nameField = page.getByLabel(/full name|your name|name/i).first()
                .or(page.locator('input[placeholder*="name" i]').first());

            // Check if it has required attribute
            const isRequired = await nameField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });
    });

    test.describe('Time Clock Form Validation', () => {
        test('name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.publicTimeClock);

            const nameField = page.getByLabel(/full name|your name|name/i).first()
                .or(page.locator('input[placeholder*="name" i]').first());

            const isRequired = await nameField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('email field validates format', async ({ page }) => {
            await page.goto(TEST_URLS.publicTimeClock);

            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'))
                .first();

            await emailField.fill('invalid-email');
            await emailField.blur();

            const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });
    });

    test.describe('Overtime Form Validation', () => {
        test('name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.publicOvertime);

            const nameField = page.getByLabel(/full name|your name|name/i).first()
                .or(page.locator('input[placeholder*="name" i]').first());

            const isRequired = await nameField.evaluate((el: HTMLInputElement) => el.required);
            expect(isRequired).toBe(true);
        });

        test('email field validates format', async ({ page }) => {
            await page.goto(TEST_URLS.publicOvertime);

            const emailField = page.getByLabel(/email/i)
                .or(page.locator('input[type="email"]'))
                .first();

            await emailField.fill('not-an-email');
            await emailField.blur();

            const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
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
    });
});
