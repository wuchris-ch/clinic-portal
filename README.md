# StaffHub - Time Off Portal

A modern, multi-tenant employee time-off request and management portal built with **Next.js 16**, Supabase, and shadcn/ui.

## Features

### Multi-Tenancy
- **Organization Isolation**: Each clinic/business has its own isolated data space
- **URL-based Routing**: `/org/{slug}/dashboard` pattern for org-scoped access
- **Self-Service Registration**: Organizations can sign up and invite staff
- **Row Level Security**: Database-enforced data isolation

### Public Features (No Login)
- **Quick Forms**: Submit single day off, time clock adjustment, and overtime requests without an account
- **Anonymous Submissions**: Requests are emailed directly to admin
- **Information Access**: View clinic protocols, handbook chapters, and announcements

### Staff Dashboard (Logged In)
- **Pre-filled Forms**: Name and email auto-populated from profile
- **Database Tracking**: Requests are saved and trackable
- **Team Calendar**: View approved time-off across the organization

### Admin Dashboard
- **Request Management**: Review, approve, or deny pending requests
- **Employee Management**: View and manage staff
- **Organization Settings**: Configure email notifications and preferences

### Notifications & Logging
- **Google Sheets Integration**: All requests logged automatically
- **Email Notifications**: Admins notified on submissions, staff notified on approvals
- **Timezone Intelligence**: Pacific Time (PST/PDT) with automatic DST handling

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth with Google OAuth
- **Email**: Gmail SMTP via Nodemailer + React Email templates
- **Logging**: Google Sheets API via Service Account
- **Testing**: Vitest (unit) + Playwright (E2E)
- **CI/CD**: GitHub Actions + Vercel

## Environments & Authentication

This project uses **three environments** following professional best practices:

| Environment | Database | Auth Method | URL | Purpose |
|-------------|----------|-------------|-----|---------|
| **Local Dev** | Local Supabase (Docker) | Email/password only | `localhost:3000` | Daily development, safe experimentation |
| **Vercel Preview** | Production Supabase | Google OAuth + email | `*.vercel.app` | Test OAuth, PR reviews, stakeholder demos |
| **Production** | Production Supabase | Google OAuth + email | Your domain | Real users |

### Why This Setup?

**Google OAuth requires HTTPS** with registered redirect URIs. Rather than complex local OAuth configuration, we use the industry-standard approach:

1. **Develop locally** with email/password auth (fast, no OAuth setup)
2. **Test OAuth on Vercel Preview** branches (automatic HTTPS, real OAuth flow)
3. **Deploy to Production** when ready

### Quick Reference

```bash
# Local development (email/password auth)
supabase start && npm run dev     # localhost:3000

# Test Google OAuth
git push origin feature/my-branch # Creates Vercel preview at feature-my-branch-*.vercel.app

# Switch to production DB temporarily (if needed)
cp .env.production.backup .env.local

# Switch back to local DB
cp .env.local.example .env.local  # Then update with `supabase status` output
```

### Environment Files

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.local` | Your active config (should be LOCAL credentials) | Ignored |
| `.env.local.example` | Template for new developers | Committed |
| `.env.production.backup` | Backup of production credentials | Ignored |

**Rule of thumb:** `.env.local` should always point to local Supabase. Only temporarily switch to production if absolutely necessary, then switch back.

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (required for local Supabase)
- Supabase CLI

### 1. Clone and Install

```bash
git clone <repository-url>
cd hr-employee-portal
npm install
```

### 2. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# or via npm
npm install -g supabase
```

### 3. Start Local Development

```bash
# Start local Supabase (PostgreSQL + Auth via Docker)
supabase start

# Copy environment template
cp .env.local.example .env.local

# Update .env.local with credentials shown from `supabase start`
# The output shows ANON_KEY, SERVICE_ROLE_KEY, and API_URL

# Start development server
npm run dev
```

### 4. Access Local Services

| Service | URL | Purpose |
|---------|-----|---------|
| App | http://localhost:3000 | Your application |
| Supabase Studio | http://127.0.0.1:54323 | Database browser, SQL editor |
| Mailpit | http://127.0.0.1:54324 | Email testing inbox |

### 5. Environment Variables

Your `.env.local` should contain:

```env
# Supabase (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>

# Gmail SMTP (optional for local dev)
GMAIL_USER=yourcompany.hr@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Google Sheets (optional for local dev)
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service-account>@<project>.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

### Quick Reference

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run test` | E2E + unit tests | Before creating PR, or anytime |
| `npm run test:local` | Unit tests + lint only | Quick check (no DB needed) |
| `npm run test:e2e` | E2E tests only | Debug specific E2E failures |
| `npm run test:unit` | Unit tests only | Fast iteration on logic |

### Safety: Production Database Protection

E2E tests create test data, so there's a **built-in safety check** that blocks E2E tests if your `.env.local` points to production:

| Your `NEXT_PUBLIC_SUPABASE_URL` | E2E Tests |
|----------------------------------|-----------|
| `http://127.0.0.1:54321` (local) | ✅ Allowed |
| `https://xxx.supabase.co` (prod) | 🛑 Blocked |

This means:
- **With local Supabase running:** All tests are safe, run anything
- **If you accidentally point to production:** E2E tests refuse to run (you'll see a big warning)

### Recommended Workflow

```bash
# Daily development - run everything locally
supabase start              # Start local database
npm run test                # Run full test suite (safe!)

# Quick check (no database needed)
npm run test:local          # Just unit tests + lint

# When CI E2E fails and you need to debug
npm run test:e2e            # Run E2E locally to reproduce
```

### What Runs Where

| Where | What Runs | Database |
|-------|-----------|----------|
| **Your machine** | `npm run test` | Local Supabase |
| **GitHub Actions** | Full suite (automatic) | Fresh ephemeral Supabase |
| **Vercel Preview** | Nothing (deploy only) | Production Supabase |

### Test Structure

```
tests/
├── unit/                    # Vitest - fast, no DB needed
│   └── *.test.ts           # Timezone logic, validation
├── e2e/                     # Playwright - unauthenticated tests
│   ├── auth-flow.spec.ts   # Login, registration
│   ├── navigation.spec.ts  # Page navigation
│   ├── admin-settings.spec.ts      # Admin page (unauthenticated checks)
│   └── admin-settings.auth.spec.ts # Admin page (authenticated) ← NEW
├── sanity/                  # Quick sanity checks
├── .auth/                   # Saved auth state (gitignored)
│   └── admin.json          # Admin session for auth tests
├── auth.setup.ts           # Logs in and saves session
├── setup.ts                # Test utilities
└── global-setup.ts         # Production database safeguard
```

### Authenticated E2E Tests

Tests ending in `.auth.spec.ts` run with a logged-in admin session:

```bash
# Run only authenticated tests
npx playwright test --project=authenticated

# Run only unauthenticated tests
npx playwright test --project=chromium

# Run everything
npm run test:e2e
```

**How it works:**
1. `auth.setup.ts` logs in with test credentials and saves session to `.auth/admin.json`
2. Tests in `*.auth.spec.ts` files automatically use that saved session
3. No repeated logins - tests start already authenticated

**Test accounts (local Supabase only):**

| Role | Email | Password | Org |
|------|-------|----------|-----|
| Admin | test@org.com | testadmin | testorg |
| Staff | test@staff.com | teststaff | testorg |

See `scripts/test-login-info.md` for setup details.

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public routes (Home, Announcements)
│   ├── (auth)/             # Login, Register, Register-Org
│   ├── org/[slug]/         # Multi-tenant org routes
│   │   ├── dashboard/      # Employee dashboard
│   │   ├── admin/          # Admin dashboard
│   │   └── calendar/       # Team calendar
│   ├── api/                # API routes
│   └── auth/               # OAuth callback
├── components/
│   ├── organization-context.tsx  # Org context provider
│   ├── admin/              # Admin components
│   ├── emails/             # React Email templates
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── google-sheets.ts    # Sheets integration
│   └── types/              # TypeScript types
└── middleware.ts           # Auth & route protection
```

## Database

### Key Tables

- `organizations` - Multi-tenant organizations
- `profiles` - User profiles (linked to org)
- `leave_requests` - Time-off requests
- `leave_request_dates` - Individual dates per request
- `leave_types` - Request types (Vacation, Sick, etc.)
- `pay_periods` - T4 year pay periods (reference data, easy to delete/augment via SQL)
- `announcements` - Org announcements
- `notification_recipients` - Email settings

### Type Generation

```bash
npx supabase gen types typescript --local > src/lib/types/database.types.ts
```

## Database Schema Consistency

### The Golden Rule

> **Migrations are the single source of truth.** All environments get identical schemas by applying the same migration files.

```
supabase/migrations/
├── 000_initial_schema.sql      # Tables, RLS policies
├── 001_add_leave_request_dates.sql
├── 002_add_notifications.sql
├── ...
└── 008_multi_tenancy.sql       # Latest migration
```

### How Each Environment Gets Its Schema

| Environment | How Schema Is Applied | When |
|-------------|----------------------|------|
| **Local Dev** | `supabase start` | Automatically applies all migrations |
| **CI (GitHub Actions)** | `supabase start` in workflow | Fresh DB per test run |
| **Production** | `supabase db push` or Dashboard | You apply manually after merge |

### Schema vs Data

|  | Local | CI | Production |
|--|-------|----|----|
| **Schema** | ✅ Identical | ✅ Identical | ✅ Identical |
| **Data** | Test data | Ephemeral test data | Real user data |

The schema (tables, columns, RLS policies, functions) is the same everywhere. Only the data differs.

### Professional Workflow for Schema Changes

```bash
# 1. Create a new migration file
touch supabase/migrations/009_add_feature_x.sql
# Or generate from changes made in Studio:
supabase db diff -f add_feature_x

# 2. Write your SQL
cat > supabase/migrations/009_add_feature_x.sql << 'EOF'
-- Add new column for feature X
ALTER TABLE profiles ADD COLUMN department TEXT;

-- Add RLS policy
CREATE POLICY "Users can see own department"
ON profiles FOR SELECT
USING (auth.uid() = id);
EOF

# 3. Test locally (applies migration fresh)
supabase db reset
npm run test

# 4. Commit and push
git add supabase/migrations/
git commit -m "feat: add department field to profiles"
git push

# 5. CI runs tests with new migration ✅

# 6. After PR merge, apply to production
supabase link --project-ref your-project-ref
supabase db push
# Or: Apply via Supabase Dashboard > SQL Editor
```

### Verifying Schema Consistency

**The "Am I in Sync?" Check:**

```bash
# 1. Link to production (one-time setup)
supabase link --project-ref your-project-ref

# 2. Dry run - shows what WOULD be applied without doing it
supabase db push --dry-run
```

| Output | Meaning | Action |
|--------|---------|--------|
| `No changes to push` | ✅ Prod = Local = CI | You're good! |
| `Would apply: 008_xxx.sql` | ⚠️ Prod is behind | Run `supabase db push` |

**Full verification checklist:**

```bash
# Step 1: Ensure local is clean (matches migration files)
supabase db reset              # Reapply all migrations fresh
supabase db diff               # Should show NO differences

# Step 2: Ensure tests pass (proves CI will pass too)
npm run test                   # All green = CI will be green

# Step 3: Check production sync status
supabase db push --dry-run     # "No changes" = prod is in sync

# Step 4: If prod is behind, apply migrations
supabase db push               # Actually apply to production
```

**Why this works:**
- `supabase db reset` proves your local matches migration files
- `npm run test` proves CI will pass (same migrations, same code)
- `supabase db push --dry-run` proves production matches
- If all three pass, **Local = CI = Production** ✅

### Common Scenarios & Solutions

| Scenario | Symptom | Solution |
|----------|---------|----------|
| Local behind prod | Missing tables/columns locally | `git pull && supabase db reset` |
| Prod behind local | New migration not in prod | `supabase db push` after merge |
| CI fails, local works | Migration not committed | `git add supabase/migrations/` |
| Schema drift | Direct prod edits (bad!) | Generate migration from diff, commit it |

### Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|----------|---------------|
| Edit production schema directly in Dashboard | Create migration file, test locally, then push |
| Forget to commit migration files | Always `git add supabase/migrations/` |
| Test migrations only on prod | Test with `supabase db reset` locally first |
| Make schema changes without migrations | Even small changes need migration files |

### How CI Ensures Consistency

GitHub Actions workflow:
```yaml
- name: Start Supabase
  run: supabase start  # ← Applies ALL migrations to fresh DB

- name: Run tests
  run: npm run test    # ← Tests run against migrated schema
```

If a migration is broken, CI fails. If you forget to commit a migration, CI fails (schema won't match your code). This catches issues before they reach production.

### Quick Reference Commands

```bash
# Local development
supabase start           # Start local DB, apply all migrations
supabase db reset        # Nuke data, reapply migrations (useful for testing)
supabase status          # Show local DB connection info

# Schema changes
supabase db diff -f name # Generate migration from Studio changes
supabase db push         # Apply migrations to linked remote DB
supabase db push --dry-run  # Preview what would be applied

# Troubleshooting
supabase db diff         # Show uncommitted schema changes
supabase db lint         # Check for schema issues
```

## Development Workflow

### Protected Main Branch

The `main` branch requires Pull Requests. Never push directly.

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add my feature"

# 3. Push and create PR
git push -u origin feature/my-feature

# 4. GitHub Actions runs tests automatically
# 5. Merge after tests pass and review
```

### CI/CD Pipeline

GitHub Actions runs on every PR:
- Unit tests (Vitest)
- E2E tests (Playwright + local Supabase)
- Lint + Type check
- Build verification

Tests run against ephemeral local Supabase - never production.

## Production Deployment

### Vercel

1. Connect repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (production Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `NEXT_PUBLIC_APP_URL`

3. Deploy - merges to `main` auto-deploy

### Vercel Preview Deployments

Every push to a feature branch creates a preview deployment:
- URL pattern: `feature-branch-name-*.vercel.app`
- Uses production Supabase (same env vars as production)
- **Google OAuth works** on preview deployments (HTTPS + registered redirect URIs)
- Use this to test OAuth flows before merging to main

### Google OAuth Setup (Supabase + Google Cloud)

For OAuth to work on Vercel (preview + production):

1. **Google Cloud Console** → APIs & Services → Credentials
2. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback` (Supabase handles OAuth)
3. **Supabase Dashboard** → Authentication → Providers → Google
   - Add your Google Client ID and Client Secret
4. Vercel preview deployments automatically work because Supabase handles the OAuth callback

### Database Migrations

For production schema changes:
1. Test migration locally with `supabase db reset`
2. Apply to production via Supabase Dashboard SQL Editor
3. Schedule during low-traffic periods

## Gmail Setup (for notifications)

1. Create Gmail account for notifications
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and generate
   - Use the 16-character password in `GMAIL_APP_PASSWORD`

## Google Sheets Setup (for logging)

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a Service Account
4. Download JSON key and extract:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
5. Share your Google Sheet with the service account email

## TODO (Multi-tenancy PR cleanup)

- [ ] Create migration file for GRANT statements (currently manually applied to prod Supabase):
  ```sql
  GRANT ALL ON organizations TO service_role, authenticated;
  GRANT SELECT ON organizations TO anon;
  GRANT ALL ON profiles TO service_role, authenticated;
  GRANT SELECT ON profiles TO anon;
  GRANT ALL ON leave_requests TO service_role, authenticated;
  GRANT ALL ON leave_types TO service_role, authenticated;
  GRANT SELECT ON leave_types TO anon;
  GRANT ALL ON notification_recipients TO service_role, authenticated;
  GRANT ALL ON announcements TO service_role, authenticated;
  GRANT SELECT ON announcements TO anon;
  GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated, anon;
  ```
- [ ] Clean up test data from prod Supabase:
  - Delete `test-debug` organization
  - Delete `playwright-test-clinic` organization
  - Delete associated test users

## License

MIT
