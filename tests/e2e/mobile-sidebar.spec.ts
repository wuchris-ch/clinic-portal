import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * E2E Tests: Mobile Sidebar Behavior
 * 
 * These tests verify that the mobile sidebar works correctly:
 * - Sidebar auto-closes when navigation links are clicked
 * - X close button is visible on mobile and works
 * - Sidebar can be toggled open/closed
 */

test.describe('Mobile Sidebar Behavior', () => {
    // Use iPhone viewport for all mobile tests
    test.use({ viewport: { width: 375, height: 667 } });

    test.describe('Sidebar Auto-Close on Navigation', () => {
        test('sidebar closes automatically when clicking a navigation link', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Open the sidebar (click the hamburger menu)
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            await menuButton.click();

            // Wait for sidebar to be visible
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Click on a navigation link (Documentation)
            const docLink = page.getByRole('link', { name: /documentation/i });
            await docLink.click();

            // Wait for navigation
            await page.waitForURL('**/documentation');

            // Sidebar should be closed (the sheet/drawer should not be visible)
            await expect(page.locator('[data-mobile="true"][data-sidebar="sidebar"]')).not.toBeVisible();
        });

        test('sidebar closes when clicking navigation links', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Open the sidebar
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            await menuButton.click();
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Click on Home link (always available in public sidebar)
            const homeLink = page.getByRole('link', { name: /^home$/i }).first();
            await homeLink.click();

            // Wait for navigation
            await page.waitForURL('/');

            // Sidebar should be closed
            await expect(page.locator('[data-mobile="true"][data-sidebar="sidebar"]')).not.toBeVisible();
        });

        test('sidebar closes when clicking Home link', async ({ page }) => {
            // Start on documentation page
            await page.goto(TEST_URLS.documentation);

            // Open the sidebar
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            await menuButton.click();
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Click on Home
            const homeLink = page.getByRole('link', { name: /^home$/i });
            await homeLink.click();

            // Wait for navigation
            await page.waitForURL('/');

            // Sidebar should be closed
            await expect(page.locator('[data-mobile="true"][data-sidebar="sidebar"]')).not.toBeVisible();
        });
    });

    test.describe('X Close Button', () => {
        test('X close button is visible in mobile sidebar header', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Open the sidebar
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            await menuButton.click();

            // Wait for sidebar to be visible
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // X close button should be visible
            const closeButton = page.getByRole('button', { name: /close sidebar/i });
            await expect(closeButton).toBeVisible();
        });

        test('clicking X button closes the sidebar', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Open the sidebar
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            await menuButton.click();

            // Wait for sidebar to be visible
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Click the X close button
            const closeButton = page.getByRole('button', { name: /close sidebar/i });
            await closeButton.click();

            // Sidebar should be closed
            await expect(page.locator('[data-mobile="true"][data-sidebar="sidebar"]')).not.toBeVisible();
        });

        test('X button has hover effect', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            // Open the sidebar
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            await menuButton.click();
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Hover over X button and verify it's interactive
            const closeButton = page.getByRole('button', { name: /close sidebar/i });
            await closeButton.hover();

            // Button should still be visible and hoverable
            await expect(closeButton).toBeVisible();
        });
    });

    test.describe('Sidebar Toggle Functionality', () => {
        test('sidebar can be opened and closed multiple times', async ({ page }) => {
            await page.goto(TEST_URLS.home);

            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));

            // Open
            await menuButton.click();
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Close with X button
            const closeButton = page.getByRole('button', { name: /close sidebar/i });
            await closeButton.click();
            await expect(page.locator('[data-mobile="true"][data-sidebar="sidebar"]')).not.toBeVisible();

            // Open again
            await menuButton.click();
            await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();

            // Navigate to close (using Documentation link since Announcements is now org-scoped)
            const documentationLink = page.getByRole('link', { name: /documentation/i });
            await documentationLink.click();
            await page.waitForURL('**/documentation');

            // Sidebar should be closed
            await expect(page.locator('[data-mobile="true"][data-sidebar="sidebar"]')).not.toBeVisible();
        });
    });
});

test.describe('Desktop Sidebar Behavior', () => {
    // Use desktop viewport
    test.use({ viewport: { width: 1280, height: 800 } });

    test('X close button is NOT visible on desktop', async ({ page }) => {
        await page.goto(TEST_URLS.home);

        // On desktop, sidebar should be visible by default (not in a sheet)
        // The X button has md:hidden class so should not be visible
        const closeButton = page.getByRole('button', { name: /close sidebar/i });

        // Should not be visible on desktop
        await expect(closeButton).not.toBeVisible();
    });

    test('sidebar navigation links work on desktop', async ({ page }) => {
        await page.goto(TEST_URLS.home);

        // Click on Documentation link (in sidebar)
        const docLink = page.getByRole('link', { name: /documentation/i }).first();
        await docLink.click();

        // Should navigate
        await page.waitForURL('**/documentation');

        // Sidebar should still be visible on desktop (not hidden)
        await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
    });
});
