# Clinic Employee Portal

A modern, mobile-first employee time-off request and management portal built with **Next.js 16**, Supabase, and shadcn/ui.

## Features

- **Public Features (No Login)**:
  - **Quick Forms**: Submit single day off, time clock adjustment, and overtime requests without an account.
  - **Anonymous Submissions**: Requests are emailed directly to admin; no database record is created for privacy/simplicity.
  - **Information Access**: View clinic protocols, handbook chapters, and announcements.
- **Staff Dashboard (Logged In)**:
  - **Pre-filled Forms**: Name and email auto-populated from profile.
  - **Database Tracking**: Requests are saved and trackable.
  - **Team Calendar**: View approved time-off across the organization to coordinate schedules.
- **Admin Dashboard**: Review, approve, or deny pending requests with one-click actions.
- **Email Notifications & Logging**:
  - **Resilient Logging**: All requests logged to Google Sheets independently of email status.
  - **Timezone Intelligence**: Timestamps automatically converted to Pacific Time (PST/PDT) handling DST correctly.
  - **Admin Control**: Disabling emails in dashboard stops all notifications (no unexpected fallbacks).
  - Admins notified immediately upon any request submission.
  - Employees notified when requests are approved/denied.
- **Role-based Access**: Staff and Admin roles with appropriate permissions.
- **Mobile-First Design**: Responsive design that works beautifully on phones, tablets, and desktops.
- **Dark/Light Mode**: Toggle between themes based on preference.

## Tech Stack

### Core
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components

### Database & Authentication
- **Supabase**: PostgreSQL database with Row Level Security (RLS)
- **Auth**: Supabase Auth with Google OAuth integration
- **Session Management**: Server-side session validation via middleware

### Data Pipeline & Integrations
- **Google Sheets API**: Real-time form submission logging via Service Account authentication
- **Gmail SMTP**: Transactional emails via Nodemailer with React Email templates
- **Timezone Handling**: Pacific Time (PST/PDT) with automatic DST conversion using date-fns-tz

### Deployment & Infrastructure
- **Hosting**: Vercel with automatic preview deployments per branch
- **Environment Management**: Separate env configs for development, preview, and production
- **Edge Middleware**: Auth protection and route handling at the edge

### CI/CD Pipeline (GitHub Actions)
- **Unit Tests**: Vitest with coverage reporting
- **E2E Tests**: Playwright running against Chromium
- **Lint & Type Check**: ESLint + TypeScript strict mode verification
- **Build Verification**: Production build validation before merge
- **Artifact Storage**: Test reports and coverage data retained for 7 days

### Libraries
- **Calendar**: react-big-calendar for team scheduling views
- **Date Handling**: date-fns + date-fns-tz

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Gmail account (for email notifications)

### 1. Clone and Install

```bash
cd hr-employee-portal
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. This creates all tables, types, indexes, RLS policies, and seeds leave types + pay periods

### 3. Configure Authentication

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Email** provider.
3. For Google OAuth:
   - Enable **Google** provider
   - Set up OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 4. Set Up Gmail for Notifications

1. Create a Gmail account for sending notifications (e.g., `yourcompany.hr@gmail.com`)
2. Enable 2-Factor Authentication on the account
3. Generate an App Password:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and generate a password
   - Copy the 16-character password

### 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
# Supabase (from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gmail SMTP
GMAIL_USER=yourcompany.hr@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx


# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Fallback Notification Email
# Only used if database connection fails. 
# If Admin disables all recipients in DB, this is IGNORED (no email sent).
NOTIFY_EMAILS=fallback@company.com
```

### 6. Create Demo Users (Optional)

To seed demo data:

1. In Supabase Dashboard, go to **Authentication > Users**
2. Click "Add user" > "Create new user" for each (matches `supabase/seed.sql`):
   - `admin@test.com` (will be admin)
   - `sarah.johnson@test.com` (staff)
   - `michael.chen@test.com` (staff)
   - `emily.davis@test.com` (staff)
   - `james.wilson@test.com` (staff)

3. Run the seed script in SQL Editor: `supabase/seed.sql`

### 7. Run Development Server

```bash
npm run dev
```


Open [http://localhost:3000](http://localhost:3000)

## Testing

The project includes a comprehensive test suite using **Vitest** (Unit) and **Playwright** (E2E).

- **Unit Tests**: Cover timezone logic (PST/DST), API resilience, and data validation.
- **E2E Tests**: Verify critical user flows like form submission and navigation.

Run tests:
```bash
npm run test:unit
npx playwright test
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

3. **Configure notification recipients** in the Admin Dashboard → Email Notifications section

### 3. Update OAuth Callback URLs

After deployment, update Google OAuth settings:
- Add your Vercel URL to authorized redirect URIs in Google Cloud Console
- Update Supabase Auth redirect URLs

## Project Structure

```
src/
├── app/
│   ├── (public)/        # Public routes (Home, Announcements)
│   ├── (app)/           # Authenticated app routes
│   │   ├── admin/       # Admin dashboard & employee management
│   │   ├── calendar/    # Team calendar
│   │   └── dashboard/   # Employee dashboard (My Workspace)
│   ├── (auth)/          # Login & register pages
│   ├── api/             # API routes (notifications)
│   └── auth/            # OAuth callback
├── components/
│   ├── single-day-off-form.tsx  # Dynamic form used in public/private
│   ├── time-clock-form.tsx
│   ├── overtime-form.tsx
│   ├── admin/           # Admin-specific components
│   ├── emails/          # React Email templates
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/        # Supabase client utilities
│   ├── types/           # TypeScript types
│   └── utils.ts         # Utility functions
└── middleware.ts        # Auth middleware
```

## Pay Periods

The system includes pre-seeded pay periods following a semi-monthly schedule:
- 24 periods per year
- T4 year runs Dec 16 - Dec 15
- Periods end on the 15th and last day of each month

Pay periods for 2025 and 2026 T4 years are included in the schema.

## Customization

### Leave Types

Modify leave types in `supabase/schema.sql` or via Supabase Dashboard.
**Note**: The "Vacation" type is currently present in the database but filtered out from the UI forms by default.

```sql
INSERT INTO leave_types (name, color, is_single_day) VALUES
  ('Vacation', '#10b981', false),
  ('Single Day Off', '#f59e0b', true),
  ('Sick Leave', '#ef4444', true);  -- Add more as needed
```

### Theme Colors

Customize the color palette in `src/app/globals.css`. It uses Tailwind v4 CSS variables.

## License

MIT

## Professional Development Workflow

To ensure stability and reliability in a production environment, we follow a professional development workflow.

### 1. Feature Branch Workflow

**Never work directly on the `main` branch.** Always isolate your changes in a dedicated branch.

1.  **Create a Branch**:
    ```bash
    git checkout -b feature/add-overtime-calculator
    # or
    git checkout -b fix/login-redirect-issue
    ```
    *Naming Convention*: `feature/`, `fix/`, `chore/` followed by a descriptive name.

2.  **Develop & Commit**:
    Make frequent, small commits.
    ```bash
    git commit -m "feat: add initial calculator layout"
    ```

3.  **Push to Remote**:
    ```bash
    git push origin feature/add-overtime-calculator
    ```

### 2. Vercel Preview Deployments (CI/CD)

Vercel is configured to **automatically build and deploy** every branch you push.

- **Unique Preview URL**: Vercel generates a unique URL for your branch (e.g., `project-name-git-feature-branch.vercel.app`).
- **Live Testing**: You can click this link on GitHub (in the PR or branch view) or Vercel dashboard to see your feature running in a live production-like environment.
- **No Impact on Production**: You can break things here safely without affecting the main site users.

### 3. Pull Requests (PR) & Merging

1.  **Open a Pull Request**: On GitHub, open a PR from your feature branch to `main`.
2.  **Vercel Checks**: Vercel automatically runs a build check on your PR. You'll see a ✅ or ❌ status indicating if the build succeeds. This catches errors before merging.
3.  **Review**: Check the "Files changed" tab to self-review your code.
4.  **Merge**: Once satisfied (and Vercel build passes), merge the PR.

### 4. Automatic Production Deployment

Merging code into the `main` branch **automatically triggers a deployment to Production**.
- The main site (`clinic-portal-three.vercel.app`) will update within minutes.
- If a build fails, the extensive logs in Vercel will help diagnose the issue.

### 5. Database Migrations

If your feature requires Database changes (Supabase):

1.  Create a local migration or use the Supabase Dashboard.
2.  **Important**: Since we are in production, apply schema changes carefully on the minimal downtime or backward-compatible manner.
3.  Update type definitions:
    ```bash
    npx supabase gen types typescript --project-id "your-project-id" > src/lib/types/database.types.ts
    ```
