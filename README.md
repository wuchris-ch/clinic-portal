# StaffHub - Time Off Portal

A multi-tenant employee time-off request and management portal built with **Next.js 16**, Supabase, and shadcn/ui.

## What This App Does

StaffHub lets organizations manage employee time-off requests:

1. **Admin registers an organization** → gets a unique URL like `/org/acme/dashboard`
2. **Staff register and join** → submit vacation, sick day, overtime requests
3. **Admins review and approve** → staff get notified, everything logs to Google Sheets

All forms require login. Each organization's data is isolated via Row Level Security.

## Features

### Multi-Tenancy
- **Organization isolation**: Each organization has its own data space
- **URL-based routing**: `/org/{slug}/dashboard` pattern
- **Self-service registration**: Organizations sign up and invite staff
- **Row Level Security**: Database-enforced data isolation

### Staff Dashboard
- **Time-off forms**: Vacation, sick day, single day off, overtime, time clock adjustments
- **Pre-filled forms**: Name and email auto-populated from profile
- **Request tracking**: View submitted requests and their status
- **Team calendar**: See approved time-off across the organization

### Admin Dashboard
- **Request queue**: Review, approve, or deny pending requests
- **Employee management**: View staff and manage roles
- **Organization settings**: Configure Google Sheet integration and notification recipients

### Integrations
- **Google Sheets**: All requests automatically logged to your spreadsheet
- **Email notifications**: Admins notified on submissions, staff notified on decisions
- **Pacific timezone**: All timestamps in PST/PDT with automatic DST handling

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) with React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase PostgreSQL with Row Level Security |
| Auth | Supabase Auth with Google OAuth |
| Email | Gmail SMTP via Nodemailer + React Email |
| Logging | Google Sheets API via Service Account |
| Testing | Vitest (unit) + Playwright (E2E) |
| CI/CD | GitHub Actions + Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for local Supabase)
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

# Update .env.local with credentials from `supabase start` output

# Start development server
npm run dev
```

### 4. Local Services

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit (email inbox) | http://127.0.0.1:54324 |

### 5. Test Accounts (Local Only)

| Role | Email | Password | Org Slug |
|------|-------|----------|----------|
| Admin | test@org.com | testadmin | testorg |
| Staff | test@staff.com | teststaff | testorg |

See `scripts/test-login-info.md` for setup details.

---

## Environments

This project uses three environments following professional best practices:

| Environment | Database | Auth | URL |
|-------------|----------|------|-----|
| **Local Dev** | Local Supabase (Docker) | Email/password only | `localhost:3000` |
| **Vercel Preview** | Production Supabase | Google OAuth + email | `*.vercel.app` |
| **Production** | Production Supabase | Google OAuth + email | Your domain |

### Why No Local OAuth?

Google OAuth requires HTTPS with registered redirect URIs. Rather than complex local configuration:

1. **Develop locally** with email/password auth (fast, no OAuth setup)
2. **Test OAuth on Vercel Preview** branches (automatic HTTPS)
3. **Deploy to Production** when ready

### Environment Files

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.local` | Your active config (should point to LOCAL DB) | Ignored |
| `.env.local.example` | Template for new developers | Committed |

**Rule:** `.env.local` should always point to local Supabase. Only temporarily switch to production if absolutely necessary.

---

## Testing

### Commands

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run test` | E2E + unit tests | Before creating PR |
| `npm run test:local` | Unit tests + lint only | Quick check (no DB needed) |
| `npm run test:e2e` | E2E tests only | Debug E2E failures |
| `npm run test:unit` | Unit tests only | Fast iteration |

### Production Database Protection

E2E tests are blocked if `.env.local` points to production:

| `NEXT_PUBLIC_SUPABASE_URL` | E2E Tests |
|---------------------------|-----------|
| `http://127.0.0.1:54321` | Allowed |
| `https://xxx.supabase.co` | Blocked |

### Test Structure

```
tests/
├── unit/                    # Vitest - fast, no DB needed
├── e2e/                     # Playwright - browser tests
│   ├── *.spec.ts            # Unauthenticated tests
│   └── *.auth.spec.ts       # Authenticated tests (use saved session)
├── .auth/                   # Saved auth state (gitignored)
├── auth.setup.ts            # Logs in and saves session
└── global-setup.ts          # Production database safeguard
```

### Authenticated E2E Tests

Tests ending in `.auth.spec.ts` run with a logged-in session:

```bash
npx playwright test --project=authenticated  # Auth tests only
npx playwright test --project=chromium       # Unauth tests only
npm run test:e2e                             # Everything
```

### Bug-Driven Testing

When a bug is reported, **write a failing test first** before fixing it:

```
BUG REPORTED: "Users can access other organizations' dashboards"
     │
     ▼
STEP 1: Write failing test
     │  npm run test:unit → ❌ FAILS (bug reproduced)
     ▼
STEP 2: Fix the bug in source code
     │
     ▼
STEP 3: Run test again
     │  npm run test:unit → ✅ PASSES (fixed!)
     ▼
STEP 4: Commit test + fix together
```

**Why this matters:**

| Without Test-First | With Test-First |
|-------------------|-----------------|
| "I think I fixed it" | Test proves it's fixed |
| Bug might return | Test prevents regression |
| No documentation | Test documents the issue |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Home page, documentation
│   ├── (auth)/             # Login, register pages
│   ├── org/[slug]/         # Multi-tenant org routes
│   │   ├── dashboard/      # Staff forms (vacation, sick day, etc.)
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

---

## Database

### Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant organizations (slug, name, sheet_id) |
| `profiles` | User profiles linked to organization |
| `leave_requests` | Time-off requests |
| `leave_request_dates` | Individual dates per request |
| `leave_types` | Request types (Vacation, Sick, etc.) |
| `pay_periods` | Pay period reference data |
| `announcements` | Org-scoped announcements |
| `notification_recipients` | Email notification settings |

### Type Generation

```bash
npx supabase gen types typescript --local > src/lib/types/database.types.ts
```

### Schema Consistency

> **Migrations are the single source of truth.** All environments get identical schemas by applying the same migration files.

```
supabase/migrations/
├── 000_initial_schema.sql
├── 001_add_leave_request_dates.sql
├── ...
└── 008_multi_tenancy.sql
```

### How Schemas Are Applied

| Environment | Method | When |
|-------------|--------|------|
| Local Dev | `supabase start` | Automatic |
| CI | `supabase start` in workflow | Fresh DB per run |
| Production | `supabase db push` or Dashboard | Manual after merge |

### Schema Change Workflow

```bash
# 1. Create migration file
touch supabase/migrations/009_add_feature_x.sql

# 2. Write your SQL changes

# 3. Test locally
supabase db reset && npm run test

# 4. Commit and push
git add supabase/migrations/
git commit -m "feat: add department field"

# 5. After PR merge, apply to production
supabase db push
```

### Verifying Schema Sync

```bash
supabase db push --dry-run
```

| Output | Meaning |
|--------|---------|
| `No changes to push` | Production = Local |
| `Would apply: 009_xxx.sql` | Production is behind |

---

## Development Workflow

### Protected Main Branch

All changes go through Pull Requests:

```bash
git checkout -b feature/my-feature
git add .
git commit -m "feat: add my feature"
git push -u origin feature/my-feature
# Create PR, tests run automatically, merge after passing
```

### CI Pipeline

GitHub Actions runs on every PR:
- Unit tests (Vitest)
- E2E tests (Playwright + ephemeral Supabase)
- Lint + Type check
- Build verification

### Pre-Merge Smoke Test (Vercel Preview)

Tests verify code logic but **cannot catch** infrastructure issues. Before merging, manually test on Vercel Preview:

| Check | What to Verify |
|-------|---------------|
| Login | Redirects to dashboard (not blank) |
| Dropdowns | Pay periods & leave types load |
| Form Submit | Success toast appears |
| Google Sheet | Row appears (if linked) |
| Cross-org | Can't access other orgs' URLs |
| Sick Day PDF | Doctor note generates PDF attachment |

---

## Production Deployment

### Vercel Setup

1. Connect repository to Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GMAIL_USER`, `GMAIL_APP_PASSWORD`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`
   - `NEXT_PUBLIC_APP_URL`
3. Merges to `main` auto-deploy

### Google OAuth Setup

1. **Google Cloud Console** → APIs & Services → Credentials
2. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. **Supabase Dashboard** → Authentication → Providers → Google
4. Add Client ID and Secret

---

## External Service Setup

### Gmail (for notifications)

1. Create Gmail account for notifications
2. Enable 2-Factor Authentication
3. Generate App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Use 16-character password in `GMAIL_APP_PASSWORD`

### Google Sheets (for logging)

1. Create Google Cloud project
2. Enable Google Sheets API
3. Create Service Account and download JSON key
4. Extract `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`
5. Share your Google Sheet with the service account email

---

## Troubleshooting

### Empty Dropdowns (GRANT vs RLS)

**Symptom:** Data exists in Supabase but dropdowns are empty in app.

**Cause:** Missing GRANT permissions. Supabase has two security layers:
1. **GRANT** - Can this role access this table at all?
2. **RLS** - Which rows can this role see?

**Fix:** Run in Supabase SQL Editor:

```sql
GRANT SELECT ON leave_types TO authenticated, anon;
GRANT SELECT ON pay_periods TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON leave_requests TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON leave_request_dates TO authenticated, anon;
GRANT SELECT ON organizations TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
```

### Google Sheets Not Logging

Check in order:
1. Tab names match exactly (case-sensitive)
2. Sheet shared with service account email
3. Correct Sheet ID in Admin Settings
4. `GOOGLE_PRIVATE_KEY` format: literal `\n` chars, include BEGIN/END markers

### Redirect Loop After Login

1. Check `profiles.organization_id` is set
2. Check middleware config in `src/lib/supabase/middleware.ts`
3. Clear browser cookies
4. Verify OAuth callback URLs in Supabase

### Works Locally, Fails on Vercel

Verify env vars are set in Vercel dashboard.

---

## TODO

- [ ] Create migration file for GRANT statements (currently manually applied):
  ```sql
  GRANT ALL ON organizations TO service_role, authenticated;
  GRANT SELECT ON organizations TO anon;
  -- etc.
  ```
- [ ] Clean up test data from prod Supabase (test organizations)

---

## License

MIT
