import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit Tests: Auth Pages
 * 
 * These tests verify that the login and register pages have consistent
 * navigation elements (clickable logo and "Go to Home" button).
 */

// When vitest runs from tests/, process.cwd() is tests/, so we go up one level
const projectRoot = join(process.cwd(), '..');
const loginPagePath = join(projectRoot, 'src/app/(auth)/login/page.tsx');
const registerPagePath = join(projectRoot, 'src/app/(auth)/register/page.tsx');

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
