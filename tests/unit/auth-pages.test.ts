import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit Tests: Auth Pages
 *
 * These tests verify that the login, register, and register-org pages have consistent
 * navigation elements (clickable logo and "Go to Home" button), and that the auth
 * callback route handles various scenarios correctly.
 */

// Use __dirname to get the directory of this test file, then navigate to project root
const projectRoot = join(__dirname, '../..');
const loginPagePath = join(projectRoot, 'src/app/(auth)/login/page.tsx');
const registerPagePath = join(projectRoot, 'src/app/(auth)/register/page.tsx');
const registerOrgPagePath = join(projectRoot, 'src/app/(auth)/register-org/page.tsx');
const authCallbackPath = join(projectRoot, 'src/app/auth/callback/route.ts');

describe('Auth Pages Navigation Consistency', () => {
    it('login page file exists', () => {
        expect(existsSync(loginPagePath)).toBe(true);
    });

    it('register page file exists', () => {
        expect(existsSync(registerPagePath)).toBe(true);
    });

    describe('Login Page', () => {
        const loginContent = readFileSync(loginPagePath, 'utf-8');

        it('imports Home icon from lucide-react', () => {
            expect(loginContent).toContain("Home");
            expect(loginContent).toContain("lucide-react");
        });

        it('has clickable logo that links to home', () => {
            // Check for Link wrapping the logo section
            expect(loginContent).toContain('Link href="/"');
            expect(loginContent).toContain('CalendarDays');
        });

        it('has "Go to Home" button', () => {
            expect(loginContent).toContain('Go to Home');
            expect(loginContent).toContain('<Home');
        });
    });

    describe('Register Page', () => {
        const registerContent = readFileSync(registerPagePath, 'utf-8');

        it('imports Home icon from lucide-react', () => {
            expect(registerContent).toContain("Home");
            expect(registerContent).toContain("from \"lucide-react\"");
        });

        it('has clickable logo that links to home', () => {
            // Check for Link wrapping the logo section with cursor-pointer class
            expect(registerContent).toContain('Link href="/"');
            expect(registerContent).toContain('cursor-pointer');
            expect(registerContent).toContain('CalendarDays');
        });

        it('has "Go to Home" button', () => {
            expect(registerContent).toContain('Go to Home');
            expect(registerContent).toContain('<Home');
        });

        it('has consistent styling with login page for home button', () => {
            expect(registerContent).toContain('variant="outline"');
            expect(registerContent).toContain('mt-6 w-full h-11');
        });
    });

    describe('Navigation Element Consistency', () => {
        const loginContent = readFileSync(loginPagePath, 'utf-8');
        const registerContent = readFileSync(registerPagePath, 'utf-8');

        it('both pages have hover opacity transition on logo', () => {
            expect(loginContent).toContain('hover:opacity-80');
            expect(registerContent).toContain('hover:opacity-80');
        });

        it('both pages import Link from next/link', () => {
            expect(loginContent).toContain("import Link from \"next/link\"");
            expect(registerContent).toContain("import Link from \"next/link\"");
        });

        it('both pages have the StaffHub branding', () => {
            expect(loginContent).toContain('StaffHub');
            expect(registerContent).toContain('StaffHub');
        });

        it('both pages have the Time Off Portal subtitle', () => {
            expect(loginContent).toContain('Time Off Portal');
            expect(registerContent).toContain('Time Off Portal');
        });
    });
});

describe('Register Organization Page', () => {
    it('register-org page file exists', () => {
        expect(existsSync(registerOrgPagePath)).toBe(true);
    });

    const registerOrgContent = readFileSync(registerOrgPagePath, 'utf-8');

    it('imports Building2 icon for organization branding', () => {
        expect(registerOrgContent).toContain('Building2');
        expect(registerOrgContent).toContain('lucide-react');
    });

    it('has clickable logo that links to home', () => {
        expect(registerOrgContent).toContain('Link href="/"');
        expect(registerOrgContent).toContain('CalendarDays');
    });

    it('has "Go to Home" button', () => {
        expect(registerOrgContent).toContain('Go to Home');
        expect(registerOrgContent).toContain('<Home');
    });

    it('has organization name input field', () => {
        expect(registerOrgContent).toContain('organizationName');
        expect(registerOrgContent).toContain('Organization / Clinic Name');
    });

    it('has admin name input field', () => {
        expect(registerOrgContent).toContain('adminName');
        expect(registerOrgContent).toContain('Your Name (Admin)');
    });

    it('has admin email input field', () => {
        expect(registerOrgContent).toContain('adminEmail');
        expect(registerOrgContent).toContain('Email Address');
    });

    it('has password fields with show/hide toggle', () => {
        expect(registerOrgContent).toContain('showPassword');
        expect(registerOrgContent).toContain('showConfirmPassword');
        expect(registerOrgContent).toContain('Eye');
        expect(registerOrgContent).toContain('EyeOff');
    });

    it('validates password match', () => {
        expect(registerOrgContent).toContain('Passwords do not match');
    });

    it('validates password length', () => {
        expect(registerOrgContent).toContain('Password must be at least 6 characters');
    });

    it('has registration complete success view', () => {
        expect(registerOrgContent).toContain('registrationComplete');
        expect(registerOrgContent).toContain('Welcome to StaffHub');
        expect(registerOrgContent).toContain('Go to Dashboard');
    });

    it('shows next step about Google Sheet linking', () => {
        expect(registerOrgContent).toContain('Link your Google Sheet');
        expect(registerOrgContent).toContain('Admin Settings');
    });

    it('has links to login and staff registration', () => {
        expect(registerOrgContent).toContain('Already have an organization');
        expect(registerOrgContent).toContain('href="/login"');
        expect(registerOrgContent).toContain('Register as staff');
        expect(registerOrgContent).toContain('href="/register"');
    });

    it('has StaffHub branding', () => {
        expect(registerOrgContent).toContain('StaffHub');
        expect(registerOrgContent).toContain('Time Off Portal');
    });
});

describe('Auth Callback Route', () => {
    it('auth callback route file exists', () => {
        expect(existsSync(authCallbackPath)).toBe(true);
    });

    const authCallbackContent = readFileSync(authCallbackPath, 'utf-8');

    it('handles code exchange for session', () => {
        expect(authCallbackContent).toContain('exchangeCodeForSession');
    });

    it('fetches user profile after authentication', () => {
        expect(authCallbackContent).toContain('.from("profiles")');
        expect(authCallbackContent).toContain('organization_id');
    });

    it('fetches organization slug for redirect', () => {
        expect(authCallbackContent).toContain('.from("organizations")');
        expect(authCallbackContent).toContain('.select("slug")');
    });

    it('redirects to org dashboard on success', () => {
        expect(authCallbackContent).toContain('/org/${org.slug}/dashboard');
    });

    it('handles missing code error', () => {
        expect(authCallbackContent).toContain('error=auth');
    });

    it('handles profile fetch error', () => {
        expect(authCallbackContent).toContain('error=no_profile');
    });

    it('handles missing organization error', () => {
        expect(authCallbackContent).toContain('error=no_org');
    });

    it('handles organization not found error', () => {
        expect(authCallbackContent).toContain('error=org_not_found');
    });

    it('logs errors for debugging', () => {
        expect(authCallbackContent).toContain('console.error');
        expect(authCallbackContent).toContain('Auth callback');
    });
});
