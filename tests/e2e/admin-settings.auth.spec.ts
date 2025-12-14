import { test, expect } from '@playwright/test';
import { TEST_ORG_URLS, TEST_ORG } from '../setup';

/**
 * E2E Tests: Admin Settings Page (Authenticated)
 *
 * These tests run with an authenticated admin session.
 * The session is set up by auth.setup.ts before these tests run.
 *
 * File naming: *.auth.spec.ts runs in the 'authenticated' project
 * which uses the saved auth state from tests/.auth/admin.json
 */

test.describe('Admin Settings - Authenticated', () => {

    test('admin can view Google Sheets section', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        // Google Sheets card should be visible
        const googleSheetsCard = page.getByText('Google Sheets').first();
        await googleSheetsCard.scrollIntoViewIfNeeded();

        // Should see Google Sheets card
        await expect(googleSheetsCard).toBeVisible();

        // Should see organization name somewhere on the page
        await expect(page.getByText(/testorg/i).first()).toBeVisible();
    });

    test('admin page shows stats cards', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        // Should see all 4 stats cards
        await expect(page.getByText(/total staff/i)).toBeVisible();
        await expect(page.getByText('Pending').first()).toBeVisible();
        await expect(page.getByText('Approved')).toBeVisible();
        await expect(page.getByText('Denied')).toBeVisible();
    });

    test('admin page shows time-off requests section', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        // Should see Time-Off Requests text (use exact match to avoid duplicates)
        await expect(page.getByText('Time-Off Requests', { exact: true })).toBeVisible();

        // Should see tabs
        await expect(page.getByRole('tab', { name: /pending/i })).toBeVisible();
        await expect(page.getByRole('tab', { name: /history/i })).toBeVisible();
    });

    test('admin page shows email notifications section', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        // Scroll down to find Email Notifications
        const emailSection = page.getByText('Email Notifications').first();
        await emailSection.scrollIntoViewIfNeeded();
        await expect(emailSection).toBeVisible();
    });

    test('can switch between pending and history tabs', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        // Click History tab
        await page.getByRole('tab', { name: /history/i }).click();

        // History tab should be selected
        await expect(page.getByRole('tab', { name: /history/i })).toHaveAttribute('data-state', 'active');

        // Click Pending tab
        await page.getByRole('tab', { name: /pending/i }).click();

        // Pending tab should be selected
        await expect(page.getByRole('tab', { name: /pending/i })).toHaveAttribute('data-state', 'active');
    });
});

test.describe('Admin Settings - Google Sheets Integration', () => {

    // Helper to scroll to and expand the link sheet section
    async function scrollToLinkSheetSection(page: import('@playwright/test').Page) {
        // Scroll to Google Sheets card
        const googleSheetsCard = page.getByText('Google Sheets').first();
        await googleSheetsCard.scrollIntoViewIfNeeded();

        // Find and click the link sheet section to expand it
        const linkSection = page.getByText(/link your google sheet/i).or(page.getByText(/change linked sheet/i));
        await linkSection.scrollIntoViewIfNeeded();
        await linkSection.click();
    }

    test('admin can see Google Sheets section', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        // Scroll to Google Sheets card
        const googleSheetsCard = page.getByText('Google Sheets').first();
        await googleSheetsCard.scrollIntoViewIfNeeded();

        // Should see Google Sheets card with subtitle
        await expect(page.getByText(/automatic form submission logging/i)).toBeVisible();
    });

    test('admin can expand link sheet section', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        // Should see step-by-step instructions
        await expect(page.getByText(/create a google sheet/i)).toBeVisible();
        await expect(page.getByText(/share it with our system/i)).toBeVisible();
    });

    test('Test Connection button is disabled when input is empty', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        const testButton = page.getByRole('button', { name: /test connection/i });
        await expect(testButton).toBeDisabled();
    });

    test('Test Connection button enables when sheet ID is entered', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        // Enter a sheet URL
        const sheetInput = page.getByPlaceholder(/docs\.google\.com\/spreadsheets/i);
        await sheetInput.fill('https://docs.google.com/spreadsheets/d/test123');

        // Test Connection button should now be enabled
        const testButton = page.getByRole('button', { name: /test connection/i });
        await expect(testButton).toBeEnabled();
    });

    test('Link Sheet button remains disabled until connection test succeeds', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        // Enter a sheet URL
        const sheetInput = page.getByPlaceholder(/docs\.google\.com\/spreadsheets/i);
        await sheetInput.fill('https://docs.google.com/spreadsheets/d/test123');

        // Link Sheet button should still be disabled (no test yet)
        const linkButton = page.getByRole('button', { name: /link sheet/i });
        await expect(linkButton).toBeDisabled();
    });

    test('shows error for invalid sheet connection', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        // Enter an invalid sheet ID
        const sheetInput = page.getByPlaceholder(/docs\.google\.com\/spreadsheets/i);
        await sheetInput.fill('invalid-sheet-id-12345');

        // Click Test Connection
        const testButton = page.getByRole('button', { name: /test connection/i });
        await testButton.click();

        // Wait for error - should show connection failed or similar
        await expect(
            page.getByText(/connection failed/i)
                .or(page.getByText(/failed to connect/i))
                .or(page.getByText(/error/i))
        ).toBeVisible({ timeout: 10000 });

        // Link Sheet button should remain disabled
        const linkButton = page.getByRole('button', { name: /link sheet/i });
        await expect(linkButton).toBeDisabled();
    });
});

test.describe('Admin Settings - Sheet Input Parsing', () => {

    // Helper to scroll to and expand the link sheet section
    async function scrollToLinkSheetSection(page: import('@playwright/test').Page) {
        // Scroll to Google Sheets card
        const googleSheetsCard = page.getByText('Google Sheets').first();
        await googleSheetsCard.scrollIntoViewIfNeeded();

        // Find and click the link sheet section to expand it
        const linkSection = page.getByText(/link your google sheet/i).or(page.getByText(/change linked sheet/i));
        await linkSection.scrollIntoViewIfNeeded();
        await linkSection.click();
    }

    test('accepts full Google Sheets URL', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        const sheetInput = page.getByPlaceholder(/docs\.google\.com\/spreadsheets/i);
        const fullUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0';
        await sheetInput.fill(fullUrl);

        await expect(sheetInput).toHaveValue(fullUrl);

        // Test Connection button should be enabled
        const testButton = page.getByRole('button', { name: /test connection/i });
        await expect(testButton).toBeEnabled();
    });

    test('accepts raw sheet ID', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);
        await scrollToLinkSheetSection(page);

        const sheetInput = page.getByPlaceholder(/docs\.google\.com\/spreadsheets/i);
        const rawId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
        await sheetInput.fill(rawId);

        await expect(sheetInput).toHaveValue(rawId);

        // Test Connection button should be enabled
        const testButton = page.getByRole('button', { name: /test connection/i });
        await expect(testButton).toBeEnabled();
    });
});

test.describe('Admin Settings - Navigation', () => {

    test('admin can navigate from dashboard to admin page', async ({ page }) => {
        // Start at dashboard
        await page.goto(TEST_ORG_URLS.dashboard);

        // Find and click admin link in sidebar
        const adminLink = page.getByRole('link', { name: /admin/i });
        await adminLink.click();

        // Should be on admin page
        await expect(page).toHaveURL(TEST_ORG_URLS.admin);
    });

    test('admin page URL contains org slug', async ({ page }) => {
        await page.goto(TEST_ORG_URLS.admin);

        expect(page.url()).toContain(`/org/${TEST_ORG.slug}/admin`);
    });
});
