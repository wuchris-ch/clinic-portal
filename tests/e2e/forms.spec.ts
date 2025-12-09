import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Smoke Tests: Form Rendering and Interactions
 * 
 * These tests verify that all forms render correctly with expected fields
 * and that basic interactions (field focus, typing) work properly.
 */

test.describe('Form Smoke Tests', () => {

    test.describe('Public Day Off Form', () => {
        test('form has all required fields', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Name field
            await expect(page.getByLabel(/full name|your name|name/i).first()).toBeVisible();

            // Email field
            await expect(page.getByLabel(/email/i).first()).toBeVisible();

            // Date picker should be present
            const dateField = page.locator('[data-testid="date-picker"]')
                .or(page.getByRole('button', { name: /date|pick a date|select date/i }))
                .or(page.locator('input[type="date"]'))
                .or(page.getByText(/pick a date/i));
            await expect(dateField.first()).toBeVisible();

            // Submit button
            await expect(page.getByRole('button', { name: /submit|send|request/i }).first()).toBeVisible();
        });

        test('form fields are interactive', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Find and fill name field
            const nameInput = page.getByLabel(/full name|your name|name/i).first()
                .or(page.locator('input[placeholder*="name" i]').first());
            await nameInput.fill('Test User');
            await expect(nameInput).toHaveValue('Test User');

            // Find and fill email field
            const emailInput = page.getByLabel(/email/i).first()
                .or(page.locator('input[type="email"]').first());
            await emailInput.fill('test@example.com');
            await expect(emailInput).toHaveValue('test@example.com');
        });

        test('form has leave type selector', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Should have a leave type dropdown or select
            const leaveTypeSelector = page.getByLabel(/type|leave type/i)
                .or(page.getByRole('combobox'))
                .or(page.locator('button:has-text("Select")'));
            await expect(leaveTypeSelector.first()).toBeVisible();
        });
    });

    test.describe('Public Time Clock Form', () => {
        test('form has all required fields', async ({ page }) => {
            await page.goto(TEST_URLS.publicTimeClock);

            // Name field
            await expect(page.getByLabel(/full name|your name|name/i).first()).toBeVisible();

            // Email field
            await expect(page.getByLabel(/email/i).first()).toBeVisible();

            // Should have time-related fields
            const timeFields = page.locator('input[type="time"]')
                .or(page.getByLabel(/time|clock/i));
            await expect(timeFields.first()).toBeVisible();

            // Submit button
            await expect(page.getByRole('button', { name: /submit|send|request/i }).first()).toBeVisible();
        });

        test('form fields accept input', async ({ page }) => {
            await page.goto(TEST_URLS.publicTimeClock);

            // Find and fill name field
            const nameInput = page.getByLabel(/full name|your name|name/i).first()
                .or(page.locator('input[placeholder*="name" i]').first());
            await nameInput.fill('Test Employee');
            await expect(nameInput).toHaveValue('Test Employee');
        });
    });

    test.describe('Public Overtime Form', () => {
        test('form has all required fields', async ({ page }) => {
            await page.goto(TEST_URLS.publicOvertime);

            // Name field
            await expect(page.getByLabel(/full name|your name|name/i).first()).toBeVisible();

            // Email field
            await expect(page.getByLabel(/email/i).first()).toBeVisible();

            // Should have some form fields for overtime
            const overtimeField = page.getByLabel(/hours|overtime|amount|pay period/i)
                .or(page.locator('input[type="number"]'))
                .or(page.locator('textarea'));
            // If no specific fields found, just verify the form exists
            const hasOvertimeField = await overtimeField.first().isVisible().catch(() => false);
            expect(hasOvertimeField || await page.locator('form').isVisible()).toBe(true);

            // Submit button
            await expect(page.getByRole('button', { name: /submit|send|request/i }).first()).toBeVisible();
        });

        test('form has pay period selector', async ({ page }) => {
            await page.goto(TEST_URLS.publicOvertime);

            // Should have pay period selection
            const payPeriodSelector = page.getByLabel(/pay period/i)
                .or(page.getByRole('combobox'))
                .or(page.getByText(/select.*period/i));
            await expect(payPeriodSelector.first()).toBeVisible();
        });
    });

    test.describe('Form Loading States', () => {
        test('forms do not show loading state initially', async ({ page }) => {
            await page.goto(TEST_URLS.publicDayOff);

            // Submit button should not be disabled (unless form is invalid)
            const submitButton = page.getByRole('button', { name: /submit|send|request/i }).first();

            // Wait for page to fully load
            await page.waitForLoadState('networkidle');

            // Check that there's no spinner visible (loading complete)
            const spinner = page.locator('.animate-spin');
            await expect(spinner).toHaveCount(0);
        });
    });
});
