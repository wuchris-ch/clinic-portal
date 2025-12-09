# Tests Directory

This folder contains the test suite for the HR Employee Portal.

## Test Structure

```
tests/
├── e2e/                     # E2E smoke tests (Playwright)
│   ├── public-pages.spec.ts   # Public route accessibility
│   ├── forms.spec.ts          # Form rendering & interactions
│   ├── navigation.spec.ts     # Navigation & routing
│   └── auth-flow.spec.ts      # Authentication redirects
├── sanity/                  # Sanity tests (Playwright)
│   ├── form-validation.spec.ts  # Form validation behavior
│   ├── theme-toggle.spec.ts     # Theme switching
│   └── sidebar-navigation.spec.ts # Navigation & responsive layout
├── unit/                    # Unit tests (Vitest)
│   ├── utils.test.ts          # Utility function tests
│   ├── types.test.ts          # Type validation tests
│   └── google-sheets.test.ts  # Google Sheets integration tests
├── playwright.config.ts     # Playwright configuration
├── vitest.config.ts         # Vitest configuration
└── setup.ts                 # Shared test utilities
```

## Running Tests

### Prerequisites
- Dev server must be running for E2E tests: `npm run dev`
- Playwright browsers installed: `npx playwright install chromium`

### Commands

```bash
# Run all tests
npm test

# Run E2E smoke tests only
npm run test:e2e:smoke

# Run E2E sanity tests only
npm run test:e2e:sanity

# Run unit tests only
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run all E2E tests
npm run test:e2e
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
Fast tests for utility functions and types:
- `cn` utility function (className merging)
- TypeScript type validation
- Date formatting utilities

## Writing New Tests

1. **E2E tests**: Add `.spec.ts` files in `tests/e2e/` or `tests/sanity/`
2. **Unit tests**: Add `.test.ts` files in `tests/unit/`
3. Use the utilities from `setup.ts` for common constants

## CI/CD Integration

For CI environments, tests run headless. Set `CI=true` environment variable:

```bash
CI=true npm run test:e2e
```
