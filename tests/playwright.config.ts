import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for HR Employee Portal E2E and Sanity tests.
 */
export default defineConfig({
    // Global setup - checks we're not running against production
    globalSetup: require.resolve('./global-setup.ts'),

    // Test directory
    testDir: './',

    // Test files pattern
    testMatch: ['**/*.spec.ts'],

    // Run tests in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: '../test-results/html-report' }],
        ['list']
    ],

    // Shared settings for all the projects
    use: {
        // Base URL for the tests (dev server)
        baseURL: 'http://localhost:3000',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Take screenshot on failure
        screenshot: 'only-on-failure',
    },

    // Configure projects
    projects: [
        // Setup project - runs first to authenticate
        {
            name: 'setup',
            testMatch: /auth\.setup\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },

        // Authenticated tests - use saved auth state
        {
            name: 'authenticated',
            testMatch: /.*\.auth\.spec\.ts/,
            dependencies: ['setup'],
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'tests/.auth/admin.json',
            },
        },

        // Default project - unauthenticated tests
        {
            name: 'chromium',
            testMatch: /(?<!\.auth)\.spec\.ts$/,
            testIgnore: /auth\.setup\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },

        // Add more browsers as needed:
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
    ],

    // Run local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },

    // Global timeout for each test
    timeout: 30 * 1000,

    // Expect timeout
    expect: {
        timeout: 10 * 1000,
    },

    // Output folder for test artifacts
    outputDir: '../test-results/artifacts',
});
