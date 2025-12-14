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

            // First validate org (required for submit to work)
            await page.locator('#organization').fill('testorg');
            await page.locator('#organization').blur();

            // Wait for org validation to complete
            await expect(page.getByText(/organization found/i)).toBeVisible({ timeout: 10000 });

            // Fill in all required fields
            await page.locator('#fullName').fill('Test User');
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('password123');
            await page.locator('#confirmPassword').fill('differentpassword');

            // Click submit (should be enabled now)
            const submitButton = page.getByRole('button', { name: /join organization/i });
            await expect(submitButton).toBeEnabled();
            await submitButton.click();

            // Should show error toast for password mismatch
            const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /passwords do not match/i })
                .or(page.getByText(/passwords do not match/i));
            await expect(errorToast.first()).toBeVisible({ timeout: 5000 });

            // Should remain on register page (form not submitted)
            await expect(page).toHaveURL(/register/);
        });

        test('submit button is disabled without valid org', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill other fields but NOT organization
            await page.locator('#fullName').fill('Test User');
            await page.locator('#email').fill('test@example.com');
            await page.locator('#password').fill('password123');
            await page.locator('#confirmPassword').fill('password123');

            // Submit button should be disabled (org not validated)
            const submitButton = page.getByRole('button', { name: /join organization/i });
            await expect(submitButton).toBeDisabled();
        });
    });

    test.describe('Password Minimum Length Validation', () => {
        test('password field has minLength attribute set to 6', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const passwordField = page.locator('#password');
            const minLength = await passwordField.getAttribute('minlength');

            expect(minLength).toBe('6');
        });

        test('password field validates minimum length', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill with short password
            const passwordField = page.locator('#password');
            await passwordField.fill('12345'); // Only 5 characters
            await passwordField.blur();

            // Password field should be in invalid state due to minLength constraint
            const isInvalid = await passwordField.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBe(true);
        });

        test('password field accepts 6+ characters', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            // Fill with exactly 6 characters
            const passwordField = page.locator('#password');
            await passwordField.fill('123456');
            await passwordField.blur();

            // Password field should be valid
            const isValid = await passwordField.evaluate((el: HTMLInputElement) => el.validity.valid);
            expect(isValid).toBe(true);
        });
    });

    test.describe('Full Name Required Validation', () => {
        test('full name field is required', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const fullNameField = page.locator('#fullName');
            const isRequired = await fullNameField.evaluate((el: HTMLInputElement) => el.required);

            expect(isRequired).toBe(true);
        });

        test('organization field is required', async ({ page }) => {
            await page.goto(TEST_URLS.register);

            const orgField = page.locator('#organization');
            const isRequired = await orgField.evaluate((el: HTMLInputElement) => el.required);

            expect(isRequired).toBe(true);
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
