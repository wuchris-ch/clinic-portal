# Tests Directory

This folder contains the test suite for the HR Employee Portal.

## Test Structure

```
tests/
├── .auth/                     # Auth state storage (gitignored)
│   └── README.md                # Instructions for auth setup
├── e2e/                       # E2E smoke tests (Playwright)
│   ├── public-pages.spec.ts     # Public route accessibility
│   ├── forms.spec.ts            # Form rendering & interactions
│   ├── navigation.spec.ts       # Navigation & routing
│   └── auth-flow.spec.ts        # Authentication redirects
├── sanity/                    # Sanity tests (Playwright)
│   ├── form-validation.spec.ts  # Form validation behavior
│   ├── theme-toggle.spec.ts     # Theme switching
│   └── sidebar-navigation.spec.ts # Navigation & responsive layout
├── unit/                      # Unit tests (Vitest)
│   ├── utils.test.ts            # Utility function tests
│   ├── types.test.ts            # Type validation tests
│   ├── google-sheets.test.ts    # Google Sheets integration tests
│   └── ...                      # Additional unit tests
├── fixtures.ts                # Custom Playwright fixtures
├── setup.ts                   # Shared test utilities & constants
├── playwright.config.ts       # Playwright configuration
└── vitest.config.ts           # Vitest configuration
```

## Running Tests

### Prerequisites

1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install chromium`

> **Note**: E2E tests now automatically start the dev server via `webServer` config.

### Commands

```bash
# Run all tests (E2E + Unit)
npm test

# Run E2E smoke tests only
npm run test:e2e:smoke

# Run E2E sanity tests only
npm run test:e2e:sanity

# Run all E2E tests
npm run test:e2e

# Run unit tests
npm run test:unit

# Run unit tests in watch mode (development)
npm run test:unit:watch

# Run unit tests with coverage report
npm run test:unit -- --coverage
```

## Test Categories

### Smoke Tests (`tests/e2e/`)
Fast, high-level tests that verify critical paths work:
- All pages load without errors
- Navigation links work correctly
- Forms render with expected fields
- Authentication redirects work

### Sanity Tests (`tests/sanity/`)
More detailed tests for specific features:
- Form validation (required fields, email format)
- Theme toggle functionality
- Responsive layout behavior

### Unit Tests (`tests/unit/`)
Fast tests for utility functions and business logic:
- `cn` utility function (className merging)
- TypeScript type validation
- Date formatting utilities
- API handlers and integrations

## Writing New Tests

### E2E Tests

```typescript
// tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';
import { TEST_URLS } from '../setup';

test.describe('My Feature', () => {
    test('should work correctly', async ({ page }) => {
        await page.goto(TEST_URLS.home);
        await expect(page).toHaveTitle(/StaffHub/i);
    });
});
```

### Authenticated E2E Tests

```typescript
// Use custom fixtures for authenticated tests
import { test, expect } from '../fixtures';

test('dashboard loads for authenticated user', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage).not.toHaveURL(/login/);
});
```

### Unit Tests

```typescript
// tests/unit/my-util.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/my-util';

describe('myFunction', () => {
    it('should return expected result', () => {
        expect(myFunction('input')).toBe('expected');
    });
});
```

## CI/CD Integration

Tests run automatically on every push and pull request via GitHub Actions.

### GitHub Actions Workflow

The workflow (`.github/workflows/test.yml`) runs:
1. **Unit Tests** - Fast feedback on utility functions
2. **E2E Tests** - Full browser testing with Playwright
3. **Lint & Type Check** - Code quality verification
4. **Build Check** - Ensures production build succeeds

### Viewing Test Results

After CI runs, you can:
- View test results in the GitHub Actions tab
- Download coverage reports from the workflow artifacts
- Download Playwright HTML reports for debugging failed E2E tests

### Running Locally Like CI

```bash
# Simulate CI environment
CI=true npm test
```

## Coverage Thresholds

Unit tests enforce minimum coverage thresholds:
- **Lines**: 50%
- **Functions**: 50%
- **Branches**: 40%
- **Statements**: 50%

Coverage reports are generated at `test-results/coverage/`.

## Debugging Tests

### Playwright UI Mode

```bash
npx playwright test --ui --config=tests/playwright.config.ts
```

### Run Single Test

```bash
# E2E
npx playwright test my-test.spec.ts --config=tests/playwright.config.ts

# Unit
npx vitest run my-test.test.ts --config=tests/vitest.config.ts
```

### Show Browser During E2E Tests

```bash
npx playwright test --headed --config=tests/playwright.config.ts
```

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Keep tests independent**: Each test should be able to run in isolation
3. **Use setup.ts constants**: Centralize test data and URLs
4. **Mock external services**: Don't hit real APIs in unit tests
5. **Write descriptive test names**: Test names should describe the expected behavior
