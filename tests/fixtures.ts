/**
 * Playwright Test Fixtures
 * 
 * Custom fixtures for authenticated testing and common test patterns.
 * These extend the base Playwright test to provide reusable authentication
 * and other setup patterns.
 */

/* eslint-disable react-hooks/rules-of-hooks */
// Note: The above disable is needed because ESLint incorrectly flags Playwright's
// fixture `use()` function as a React hook violation. It's not a React hook.

import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * Custom fixtures extending the base Playwright test.
 */
type CustomFixtures = {
    /**
     * A page that attempts to set up auth state via localStorage/cookies.
     * Note: For real authenticated testing, you'd use storageState files
     * generated from actual login flows.
     */
    authenticatedContext: BrowserContext;
    authenticatedPage: Page;
};

/**
 * Extended test with custom fixtures.
 * 
 * Usage:
 * ```ts
 * import { test, expect } from '../fixtures';
 * 
 * test('can access dashboard when authenticated', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard');
 *   await expect(authenticatedPage).not.toHaveURL(/login/);
 * });
 * ```
 */
export const test = base.extend<CustomFixtures>({
    authenticatedContext: async ({ browser }, use) => {
        // Create a new context with potential auth state
        // In a real scenario, you'd load a storageState file here
        const context = await browser.newContext({
            // Uncomment and configure when you have actual auth state:
            // storageState: 'tests/.auth/user.json',
        });

        await use(context);
        await context.close();
    },

    authenticatedPage: async ({ authenticatedContext }, use) => {
        const page = await authenticatedContext.newPage();

        // For demo/development: inject test auth state
        // In production testing, you'd use actual Supabase auth tokens
        // This is a placeholder that shows the pattern
        await page.addInitScript(() => {
            // This would set up localStorage with auth tokens
            // localStorage.setItem('supabase.auth.token', JSON.stringify({...}));
        });

        await use(page);
    },
});

/**
 * Re-export expect for convenience.
 */
export { expect };

/**
 * Storage state configuration for authenticated sessions.
 * 
 * To generate a storage state file:
 * 1. Run: npx playwright codegen --save-storage=tests/.auth/user.json http://localhost:3000
 * 2. Log in through the UI
 * 3. Close the browser
 * 4. The auth state will be saved to tests/.auth/user.json
 * 
 * Then update the authenticatedContext fixture to use it.
 */
export const AUTH_STORAGE_STATE = 'tests/.auth/user.json';

/**
 * Helper to wait for navigation to complete after an action.
 */
export async function waitForNavigation(
    page: Page,
    action: () => Promise<void>,
    options: { timeout?: number } = {}
): Promise<void> {
    const { timeout = 10000 } = options;
    await Promise.all([
        page.waitForNavigation({ timeout }),
        action(),
    ]);
}

/**
 * Helper to fill a form field by label and submit.
 */
export async function fillFormField(
    page: Page,
    label: string,
    value: string
): Promise<void> {
    const field = page.getByLabel(new RegExp(label, 'i')).first();
    await field.fill(value);
}

/**
 * Helper to submit a form and wait for response.
 */
export async function submitFormAndWait(
    page: Page,
    buttonText: string = 'submit'
): Promise<void> {
    const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
    await button.click();
    // Wait for network activity to settle
    await page.waitForLoadState('networkidle');
}

/**
 * Helper to check for toast/alert notifications.
 */
export async function expectNotification(
    page: Page,
    textPattern: RegExp | string
): Promise<void> {
    const notification = page.locator('[role="alert"], [data-sonner-toast], .toast')
        .filter({ hasText: typeof textPattern === 'string' ? textPattern : undefined });

    if (typeof textPattern === 'string') {
        await expect(notification.first()).toBeVisible();
    } else {
        await expect(notification.first()).toBeVisible();
        await expect(notification.first()).toContainText(textPattern);
    }
}

/**
 * Helper to take a screenshot with a descriptive name.
 */
export async function takeNamedScreenshot(
    page: Page,
    name: string
): Promise<void> {
    await page.screenshot({
        path: `test-results/screenshots/${name}-${Date.now()}.png`,
        fullPage: true,
    });
}
