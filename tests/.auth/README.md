# Test Authentication State

This directory stores authentication state files for Playwright tests.

## Generating Auth State

To create an authenticated state file for testing:

```bash
# Start the dev server
npm run dev

# In another terminal, run codegen with storage save
npx playwright codegen --save-storage=tests/.auth/user.json http://localhost:3000/login
```

Then:
1. Log in through the browser UI
2. Close the browser when done
3. The auth state will be saved to `user.json`

## Usage

In your Playwright tests, use the authenticated fixture:

```typescript
import { test, expect } from '../fixtures';

test('dashboard loads for authenticated user', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

## Security Note

**Never commit real authentication tokens to version control.**

The `user.json` file is gitignored by default. For CI/CD, generate fresh tokens
as part of your test setup or use test-specific accounts.
