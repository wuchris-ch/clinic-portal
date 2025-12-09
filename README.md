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
- **Email Notifications**:
  - Admins notified immediately upon any request submission (public or private).
  - Employees notified when requests are approved/denied.
- **Role-based Access**: Staff and Admin roles with appropriate permissions.
- **Mobile-First Design**: Responsive design that works beautifully on phones, tablets, and desktops.
- **Dark/Light Mode**: Toggle between themes based on preference.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Auth with Google OAuth)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Date Handling**: date-fns
- **Calendar**: react-big-calendar
- **Email**: Gmail SMTP via Nodemailer + React Email templates

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
