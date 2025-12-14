import { test, expect } from '@playwright/test';
import { TEST_ORG_URLS } from '../setup';

/**
 * E2E Tests: Form Rendering and Structure
 *
 * Note: Public forms have been removed in favor of org-scoped authenticated forms.
 * These tests verify that org-scoped form pages exist and redirect properly.
 * Full form interaction tests require authenticated sessions.
 */

test.describe('Form Route Tests', () => {

    test.describe('Org-Scoped Form Routes Require Authentication', () => {
        test('day-off form redirects to login when unauthenticated', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardDayOff);
            await expect(page).toHaveURL(/login/);
        });

        test('time-clock form redirects to login when unauthenticated', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardTimeClock);
            await expect(page).toHaveURL(/login/);
        });

        test('overtime form redirects to login when unauthenticated', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardOvertime);
            await expect(page).toHaveURL(/login/);
        });

        test('vacation form redirects to login when unauthenticated', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardVacation);
            await expect(page).toHaveURL(/login/);
        });

        test('sick-day form redirects to login when unauthenticated', async ({ page }) => {
            await page.goto(TEST_ORG_URLS.dashboardSickDay);
            await expect(page).toHaveURL(/login/);
        });
    });

    test.describe('Form Routes Follow Org-Scoped Pattern', () => {
        test('all form routes include org slug', async () => {
            // Verify URL structure is correct
            expect(TEST_ORG_URLS.dashboardDayOff).toMatch(/\/org\/[^/]+\/dashboard\/day-off/);
            expect(TEST_ORG_URLS.dashboardTimeClock).toMatch(/\/org\/[^/]+\/dashboard\/time-clock/);
            expect(TEST_ORG_URLS.dashboardOvertime).toMatch(/\/org\/[^/]+\/dashboard\/overtime/);
            expect(TEST_ORG_URLS.dashboardVacation).toMatch(/\/org\/[^/]+\/dashboard\/vacation/);
            expect(TEST_ORG_URLS.dashboardSickDay).toMatch(/\/org\/[^/]+\/dashboard\/sick-day/);
        });
    });
});
