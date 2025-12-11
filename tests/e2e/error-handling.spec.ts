import { test, expect } from '@playwright/test';

/**
 * Error Handling Tests
 * 
 * These tests verify that the application handles error cases gracefully:
 * - 404 pages for non-existent routes
 * - Proper error display without crashing
 */

test.describe('Error Handling', () => {

    test.describe('404 Not Found', () => {
        test('non-existent page returns 404 or shows error message', async ({ page }) => {
            // Navigate to a page that definitely doesn't exist
            const response = await page.goto('/this-page-definitely-does-not-exist-12345');

            // Either get a 404 status or show an error page (not crash)
            const status = response?.status();

            // Next.js might return 404 or redirect to a custom error page
            // The key is that it doesn't crash and shows something useful
            if (status === 404) {
                // Good - proper 404 response
                expect(status).toBe(404);
            } else {
                // If not 404, should at least show some content (custom error page)
                await expect(page.locator('body')).toBeVisible();

                // Should show some indication this page doesn't exist
                const errorIndicator = page.getByText(/404|not found|doesn't exist|page not found/i);
                const homeLink = page.getByRole('link', { name: /home|back/i });

                // Either show error message or have a way to get back
                const hasErrorIndicator = await errorIndicator.first().isVisible().catch(() => false);
                const hasHomeLink = await homeLink.first().isVisible().catch(() => false);

                // Page should provide some navigation option at minimum
                expect(hasErrorIndicator || hasHomeLink || page.url().includes('404')).toBe(true);
            }
        });

        test('404 page does not throw JavaScript errors', async ({ page }) => {
            const errors: string[] = [];

            page.on('pageerror', (error) => {
                errors.push(error.message);
            });

            await page.goto('/non-existent-route-xyz');
            await page.waitForLoadState('networkidle');

            // Filter out benign errors
            const criticalErrors = errors.filter(e =>
                !e.includes('Hydration') &&
                !e.includes('Warning:') &&
                !e.includes('ResizeObserver')
            );

            expect(criticalErrors).toHaveLength(0);
        });

        test('deep non-existent route handles gracefully', async ({ page }) => {
            // Test a deeply nested non-existent route
            await page.goto('/forms/this-form-does-not-exist');

            // Should not crash
            await expect(page.locator('body')).toBeVisible();
        });
    });

    test.describe('Protected Route Access', () => {
        test('accessing protected route with invalid path format still redirects to login', async ({ page }) => {
            // Try to access a protected-looking route with unusual format
            await page.goto('/dashboard/some-invalid-form');

            // Should redirect to login (protected routes require auth)
            await expect(page).toHaveURL(/login/);
        });
    });
});
