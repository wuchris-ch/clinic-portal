import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Sanity Tests: Sick Day Form
 *
 * Verifies the sick day submission view renders expected content.
 */

test.describe('Sick Day Form Sanity Tests', () => {
    test('sick day form loads and shows key elements', async ({ page }) => {
        await page.goto(TEST_URLS.publicSickDay);

        await expect(page.locator('form')).toBeVisible();

        // Submit button
        await expect(page.getByRole('button', { name: /submit/i }).first()).toBeVisible();

        // BC Employment Standards reference
        await expect(
            page.getByText(/bc employment standards/i).first()
        ).toBeVisible();
    });

    test('sick day form has pay period selector', async ({ page }) => {
        await page.goto(TEST_URLS.publicSickDay);

        const payPeriodSelector = page.getByLabel(/pay period/i)
            .or(page.getByRole('combobox'))
            .or(page.getByText(/select.*period/i));
        await expect(payPeriodSelector.first()).toBeVisible();
    });

    test('sick day form has doctor note question', async ({ page }) => {
        await page.goto(TEST_URLS.publicSickDay);

        await expect(page.getByText(/doctor.*note/i).first()).toBeVisible();
    });

    test('file upload appears when Yes is selected for doctor note', async ({ page }) => {
        await page.goto(TEST_URLS.publicSickDay);

        // Click Yes checkbox
        const yesCheckbox = page.getByLabel(/yes/i).first();
        await yesCheckbox.click();

        // File upload zone should appear
        await expect(page.getByText(/click to upload|drag and drop/i).first()).toBeVisible();
    });
});
