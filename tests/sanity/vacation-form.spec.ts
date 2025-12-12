import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

/**
 * Sanity Tests: Vacation Form
 *
 * Verifies the vacation request view renders expected content.
 */

test.describe('Vacation Form Sanity Tests', () => {
  test('vacation form loads and shows submit helper text', async ({ page }) => {
    await page.goto(TEST_URLS.publicVacation);

    await expect(page.locator('form')).toBeVisible();

    // Button label requested
    await expect(page.getByRole('button', { name: /^submit request$/i }).first()).toBeVisible();

    // 72 hour SLA copy requested
    await expect(
      page.getByText(/we will reply by email, within 72 hours of your submission/i).first()
    ).toBeVisible();
  });

  test('vacation form has pay period checkbox list', async ({ page }) => {
    await page.goto(TEST_URLS.publicVacation);

    const checkboxes = page.getByRole('checkbox');
    expect(await checkboxes.count()).toBeGreaterThan(0);
  });
});
