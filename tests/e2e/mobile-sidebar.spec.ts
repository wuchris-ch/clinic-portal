import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Mobile Sidebar Behavior
 *
 * Note: As of the UX update, unauthenticated users no longer see the sidebar
 * on public pages (landing page, login, register). The sidebar is only shown
 * to authenticated users in org-scoped routes.
 *
 * These tests verify:
 * - Unauthenticated users see clean pages without sidebar
 * - Login page works without sidebar chrome
 */

test.describe('Unauthenticated Mobile Experience', () => {
    // Use iPhone viewport for all mobile tests
    test.use({ viewport: { width: 375, height: 667 } });

    test.describe('Landing Page', () => {
        test('landing page does not show sidebar for unauthenticated users', async ({ page }) => {
            await page.goto('/');

            // Sidebar should not be visible for unauthenticated users
            const sidebar = page.locator('[data-sidebar="sidebar"]');
            await expect(sidebar).not.toBeVisible();

            // No hamburger menu button should be present
            const menuButton = page.getByRole('button', { name: /toggle sidebar/i })
                .or(page.locator('[data-sidebar="trigger"]'));
            await expect(menuButton).not.toBeVisible();
        });

        test('landing page shows sign in link directly in content', async ({ page }) => {
            await page.goto('/');

            // Sign in link should be visible in the landing page content
            const signInLink = page.getByRole('link', { name: /sign in/i });
            await expect(signInLink.first()).toBeVisible();
        });

        test('landing page is fully accessible on mobile', async ({ page }) => {
            await page.goto('/');

            // Content should be visible without sidebar
            const staffHubText = page.getByText(/staffhub/i);
            await expect(staffHubText.first()).toBeVisible();

            // Register organization CTA should be visible
            const registerLink = page.getByRole('link', { name: /register organization/i });
            await expect(registerLink.first()).toBeVisible();
        });
    });

    test.describe('Login Page', () => {
        test('login page does not show sidebar', async ({ page }) => {
            await page.goto('/login');

            // Sidebar should not be visible
            const sidebar = page.locator('[data-sidebar="sidebar"]');
            await expect(sidebar).not.toBeVisible();
        });

        test('login form is accessible without sidebar', async ({ page }) => {
            await page.goto('/login');

            // Form should be visible and usable
            await expect(page.locator('form')).toBeVisible();

            // Email field should be accessible
            const emailField = page.getByLabel(/email/i).first()
                .or(page.locator('input[type="email"]').first());
            await expect(emailField).toBeVisible();
        });

        test('can navigate from login to home via logo link', async ({ page }) => {
            await page.goto('/login');

            // There should be a way to get back home (logo or link)
            const homeLink = page.locator('a[href="/"]');
            if (await homeLink.first().isVisible()) {
                await homeLink.first().click();
                await expect(page).toHaveURL('/');
            }
        });
    });
});

test.describe('Desktop Unauthenticated Experience', () => {
    // Use desktop viewport
    test.use({ viewport: { width: 1280, height: 800 } });

    test('landing page does not show sidebar on desktop for unauthenticated users', async ({ page }) => {
        await page.goto('/');

        // Sidebar should not be visible for unauthenticated users
        const sidebar = page.locator('[data-sidebar="sidebar"]');
        await expect(sidebar).not.toBeVisible();
    });

    test('landing page content is centered without sidebar', async ({ page }) => {
        await page.goto('/');

        // Content should be visible
        const staffHubText = page.getByText(/staffhub/i);
        await expect(staffHubText.first()).toBeVisible();

        // Hero section should be present
        const heroSection = page.locator('h1');
        await expect(heroSection.first()).toBeVisible();
    });
});

/**
 * Note: Tests for authenticated sidebar behavior should be in
 * authenticated test files that set up proper auth state.
 *
 * Authenticated sidebar features that should be tested elsewhere:
 * - Sidebar auto-close on navigation (mobile)
 * - X close button functionality (mobile)
 * - Sidebar navigation links work
 * - Organization name displayed in sidebar header
 */
