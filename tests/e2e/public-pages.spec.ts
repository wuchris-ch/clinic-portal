import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Smoke Tests: Public Pages Accessibility
 * 
 * These tests verify that all public pages load correctly without authentication.
 * They are fast, high-level tests designed to catch critical failures early.
 */

test.describe('Public Pages Smoke Tests', () => {

    test('homepage loads successfully', async ({ page }) => {
        await page.goto(TEST_URLS.home);

        // Check page loads without errors
        await expect(page).toHaveTitle(/StaffHub|Clinic|Portal/i);

        // Check main content is visible
        await expect(page.locator('body').first()).toBeVisible();

        // Check for key homepage elements - look for any content on the page
        const pageContent = page.getByText(/StaffHub|Help|Announcements|Forms/i);
        await expect(pageContent.first()).toBeVisible();
    });

    test('homepage has help topic cards', async ({ page }) => {
        await page.goto(TEST_URLS.home);

        // Check for announcements link/card
        const announcementsCard = page.getByText(/Announcements/i).first();
        await expect(announcementsCard).toBeVisible();

        // Check for day off form link
        const dayOffLink = page.getByText(/Day Off|Request Day/i).first();
        await expect(dayOffLink).toBeVisible();

        // Check for time clock link
        const timeClockLink = page.getByText(/Time Clock/i).first();
        await expect(timeClockLink).toBeVisible();

        // Check for overtime link
        const overtimeLink = page.getByText(/Overtime/i).first();
        await expect(overtimeLink).toBeVisible();
    });

    test('announcements page loads', async ({ page }) => {
        await page.goto(TEST_URLS.announcements);

        // Page should load (might redirect to announcements list or show content)
        await expect(page).not.toHaveURL(/error|404/);

        // Should have some announcement-related content
        const heading = page.getByRole('heading', { level: 1 }).or(
            page.getByRole('heading', { level: 2 })
        ).first();
        await expect(heading).toBeVisible();
    });

    test('documentation page loads', async ({ page }) => {
        await page.goto(TEST_URLS.documentation);

        // Page should load without error
        await expect(page).not.toHaveURL(/error|404/);

        // Should have documentation content
        await expect(page.locator('body')).toContainText(/documentation|handbook|protocol/i);
    });

    test('walkthrough page loads', async ({ page }) => {
        await page.goto(TEST_URLS.walkthrough);

        // Page should load without error
        await expect(page).not.toHaveURL(/error|404/);

        // Should have walkthrough content
        await expect(page.locator('body')).toContainText(/walkthrough|guide|how to/i);
    });

    test('walkthrough page has correct header text', async ({ page }) => {
        await page.goto(TEST_URLS.walkthrough);

        // Header should say "App Walkthrough" not "Dashboard"
        const heading = page.getByRole('heading', { level: 1, name: /App Walkthrough/i });
        await expect(heading).toBeVisible();
    });

    test('tech page loads', async ({ page }) => {
        await page.goto(TEST_URLS.tech);

        // Page should load without error
        await expect(page).not.toHaveURL(/error|404/);

        // Should have the main heading
        const heading = page.getByRole('heading', { level: 1, name: /Under the Hood/i });
        await expect(heading).toBeVisible();
    });

    test('tech page has key sections', async ({ page }) => {
        await page.goto(TEST_URLS.tech);

        // Check for major tech sections
        await expect(page.getByText(/Core Stack/i)).toBeVisible();
        await expect(page.getByText(/Database.*Authentication/i)).toBeVisible();
        await expect(page.getByText(/CI\/CD Pipeline/i)).toBeVisible();
    });

    test('tech page has back link to walkthrough', async ({ page }) => {
        await page.goto(TEST_URLS.tech);

        const backLink = page.getByRole('link', { name: /Back to App Walkthrough/i });
        await expect(backLink).toBeVisible();
    });

    test('public day-off form page loads', async ({ page }) => {
        await page.goto(TEST_URLS.publicDayOff);

        // Form page should load
        await expect(page.locator('form')).toBeVisible();

        // Should have name input
        const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name" i]'));
        await expect(nameInput.first()).toBeVisible();

        // Should have email input
        const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]'));
        await expect(emailInput.first()).toBeVisible();
    });

    test('public time-clock form page loads', async ({ page }) => {
        await page.goto(TEST_URLS.publicTimeClock);

        // Form page should load
        await expect(page.locator('form')).toBeVisible();

        // Should have name input
        const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name" i]'));
        await expect(nameInput.first()).toBeVisible();
    });

    test('public overtime form page loads', async ({ page }) => {
        await page.goto(TEST_URLS.publicOvertime);

        // Form page should load
        await expect(page.locator('form')).toBeVisible();

        // Should have name input
        const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name" i]'));
        await expect(nameInput.first()).toBeVisible();
    });

    test('pages load without JavaScript errors', async ({ page }) => {
        const errors: string[] = [];

        page.on('pageerror', (error) => {
            errors.push(error.message);
        });

        // Visit critical public pages
        await page.goto(TEST_URLS.home);
        await page.goto(TEST_URLS.publicDayOff);
        await page.goto(TEST_URLS.publicTimeClock);
        await page.goto(TEST_URLS.publicOvertime);

        // Filter out benign errors (like React hydration warnings in dev)
        const criticalErrors = errors.filter(e =>
            !e.includes('Hydration') &&
            !e.includes('Warning:') &&
            !e.includes('ResizeObserver')
        );

        expect(criticalErrors).toHaveLength(0);
    });
});
