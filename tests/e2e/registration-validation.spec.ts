import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Registration Form Validation Tests
 * 
 * These tests cover registration-specific validation logic that is
 * not covered by the general form validation tests:
 * - Password mismatch detection
 * - Password minimum length validation
 * - Full name required field
 */

test.describe('Registration Form Validation', () => {

    test.describe('Password Mismatch Validation', () => {
        test('shows error toast when passwords do not match', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill in all required fields
            await page.locator('#fullName').fill('Test User');
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('password123');
            await page.locator('#confirmPassword').fill('differentpassword');

            // Click submit
            const submitButton = page.getByRole('button', { name: /create account/i });
            await submitButton.click();

            // Should show error toast for password mismatch
            // The app uses sonner for toasts which creates elements with role="status" or similar
            const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /passwords do not match/i })
                .or(page.getByText(/passwords do not match/i));
            await expect(errorToast.first()).toBeVisible({ timeout: 5000 });

            // Should remain on register page (form not submitted)
            await expect(page).toHaveURL(/register/);
        });

        test('submit button is not disabled with mismatched passwords (client validation handles it)', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill with mismatched passwords
            await page.locator('#fullName').fill('Test User');
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('password123');
            await page.locator('#confirmPassword').fill('differentpassword');

            // Submit button should still be clickable (validation happens on submit)
            const submitButton = page.getByRole('button', { name: /create account/i });
            await expect(submitButton).toBeEnabled();
        });
    });

    test.describe('Password Minimum Length Validation', () => {
        test('form does not submit when password is too short (HTML5 validation)', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill in all required fields with short password
            await page.locator('#fullName').fill('Test User');
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('12345'); // Only 5 characters
            await page.locator('#confirmPassword').fill('12345');

            // Click submit
            const submitButton = page.getByRole('button', { name: /create account/i });
            await submitButton.click();

            // HTML5 minLength validation should prevent form submission
            // Form should remain on register page
            await expect(page).toHaveURL(/register/);

            // Password field should be in invalid state due to minLength constraint
            const passwordField = page.locator('#password');
            const isInvalid = await passwordField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });

        test('password field has minLength attribute set to 6', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const passwordField = page.locator('#password');
            const minLength = await passwordField.getAttribute('minlength');

            expect(minLength).toBe('6');
        });

        test('accepts password with exactly 6 characters (boundary)', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill with exactly 6 character password
            await page.locator('#fullName').fill('Test User');
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('123456');
            await page.locator('#confirmPassword').fill('123456');

            // Submit
            const submitButton = page.getByRole('button', { name: /create account/i });
            await submitButton.click();

            // Should NOT show the "too short" error
            // (may show other errors like already registered, invalid email domain, etc. but not length)
            await page.waitForTimeout(500);
            const shortPasswordError = page.getByText(/at least 6 characters/i);
            await expect(shortPasswordError).toHaveCount(0);
        });
    });

    test.describe('Full Name Required Validation', () => {
        test('full name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const fullNameField = page.locator('#fullName');
            const isRequired = await fullNameField.evaluate((el: HTMLInputElement) => el.required);

            expect(isRequired).toBe(true);
        });

        test('form does not submit without full name', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill email and password but NOT name
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('password123');
            await page.locator('#confirmPassword').fill('password123');

            // Click submit
            const submitButton = page.getByRole('button', { name: /create account/i });
            await submitButton.click();

            // Should stay on register page due to HTML5 required validation
            await expect(page).toHaveURL(/register/);

            // Name field should show validation state
            const fullNameField = page.locator('#fullName');
            const isInvalid = await fullNameField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });
    });

    test.describe('Register Page Brand/Logo Navigation', () => {
        test('clicking the brand logo navigates to homepage', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Find and click the brand link (the StaffHub text/logo that links to /)
            const brandLink = page.locator('a[href="/"]').filter({
                has: page.getByText('StaffHub')
            }).first();

            await expect(brandLink).toBeVisible();
            await brandLink.click();

            // Should navigate to homepage
            await expect(page).toHaveURL('/');
        });

        test('brand logo has hover state for interactivity feedback', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // The logo link should exist and be interactive
            const brandLink = page.locator('a[href="/"]').filter({
                has: page.getByText('StaffHub')
            }).first();

            await expect(brandLink).toBeVisible();

            // Check it has the cursor pointer (via CSS class) or is a proper link
            const cursor = await brandLink.evaluate((el) => window.getComputedStyle(el).cursor);
            expect(cursor).toBe('pointer');
        });
    });
});
