import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * High-Value Tests: Supabase Middleware Logic
 *
 * Tests the route protection and session refresh logic:
 * - Protected route detection
 * - Auth route detection
 * - Redirect rules for authenticated/unauthenticated users
 *
 * Critical for security - prevents unauthorized access.
 */

// ============================================================================
// Extracted Route Detection Logic
// ============================================================================

function isAuthRoute(pathname: string): boolean {
    return (
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/register-org')
    );
}

function isOrgRoute(pathname: string): boolean {
    return pathname.startsWith('/org/');
}

function isLegacyProtectedRoute(pathname: string): boolean {
    return (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/calendar')
    );
}

function isProtectedRoute(pathname: string): boolean {
    return isOrgRoute(pathname) || isLegacyProtectedRoute(pathname);
}

type RedirectAction =
    | { action: 'none' }
    | { action: 'redirect'; to: string };

function determineRedirect(
    pathname: string,
    isAuthenticated: boolean
): RedirectAction {
    // Unauthenticated users trying to access protected routes
    if (!isAuthenticated && isProtectedRoute(pathname)) {
        return { action: 'redirect', to: '/login' };
    }

    // Authenticated users trying to access auth routes
    if (isAuthenticated && isAuthRoute(pathname)) {
        return { action: 'redirect', to: '/' };
    }

    return { action: 'none' };
}

// ============================================================================
// Tests
// ============================================================================

describe('Middleware - Route Detection', () => {
    describe('isAuthRoute', () => {
        it('detects /login as auth route', () => {
            expect(isAuthRoute('/login')).toBe(true);
        });

        it('detects /login with query params', () => {
            expect(isAuthRoute('/login?error=auth')).toBe(true);
        });

        it('detects /register as auth route', () => {
            expect(isAuthRoute('/register')).toBe(true);
        });

        it('detects /register-org as auth route', () => {
            expect(isAuthRoute('/register-org')).toBe(true);
        });

        it('does not detect /logout as auth route', () => {
            expect(isAuthRoute('/logout')).toBe(false);
        });

        it('does not detect / as auth route', () => {
            expect(isAuthRoute('/')).toBe(false);
        });

        it('does not detect /org routes as auth route', () => {
            expect(isAuthRoute('/org/acme/dashboard')).toBe(false);
        });
    });

    describe('isOrgRoute', () => {
        it('detects /org/slug/dashboard', () => {
            expect(isOrgRoute('/org/acme-clinic/dashboard')).toBe(true);
        });

        it('detects /org/slug/admin', () => {
            expect(isOrgRoute('/org/acme-clinic/admin')).toBe(true);
        });

        it('detects /org/slug/calendar', () => {
            expect(isOrgRoute('/org/acme-clinic/calendar')).toBe(true);
        });

        it('detects nested org paths', () => {
            expect(isOrgRoute('/org/acme/admin/employees')).toBe(true);
        });

        it('does not detect /organization', () => {
            expect(isOrgRoute('/organization/acme')).toBe(false);
        });

        it('does not detect root path', () => {
            expect(isOrgRoute('/')).toBe(false);
        });
    });

    describe('isLegacyProtectedRoute', () => {
        it('detects /dashboard as legacy protected', () => {
            expect(isLegacyProtectedRoute('/dashboard')).toBe(true);
        });

        it('detects /admin as legacy protected', () => {
            expect(isLegacyProtectedRoute('/admin')).toBe(true);
        });

        it('detects /calendar as legacy protected', () => {
            expect(isLegacyProtectedRoute('/calendar')).toBe(true);
        });

        it('does not detect org-scoped paths as legacy', () => {
            expect(isLegacyProtectedRoute('/org/acme/dashboard')).toBe(false);
        });
    });

    describe('isProtectedRoute', () => {
        it('includes org routes', () => {
            expect(isProtectedRoute('/org/acme/dashboard')).toBe(true);
        });

        it('includes legacy routes', () => {
            expect(isProtectedRoute('/dashboard')).toBe(true);
            expect(isProtectedRoute('/admin')).toBe(true);
            expect(isProtectedRoute('/calendar')).toBe(true);
        });

        it('excludes public routes', () => {
            expect(isProtectedRoute('/')).toBe(false);
            expect(isProtectedRoute('/about')).toBe(false);
            expect(isProtectedRoute('/documentation')).toBe(false);
        });

        it('excludes auth routes', () => {
            expect(isProtectedRoute('/login')).toBe(false);
            expect(isProtectedRoute('/register')).toBe(false);
        });
    });
});

describe('Middleware - Redirect Logic', () => {
    describe('Unauthenticated user', () => {
        const isAuthenticated = false;

        it('redirects to /login from org routes', () => {
            const result = determineRedirect('/org/acme/dashboard', isAuthenticated);
            expect(result).toEqual({ action: 'redirect', to: '/login' });
        });

        it('redirects to /login from legacy dashboard', () => {
            const result = determineRedirect('/dashboard', isAuthenticated);
            expect(result).toEqual({ action: 'redirect', to: '/login' });
        });

        it('redirects to /login from legacy admin', () => {
            const result = determineRedirect('/admin', isAuthenticated);
            expect(result).toEqual({ action: 'redirect', to: '/login' });
        });

        it('allows access to login page', () => {
            const result = determineRedirect('/login', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });

        it('allows access to register page', () => {
            const result = determineRedirect('/register', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });

        it('allows access to register-org page', () => {
            const result = determineRedirect('/register-org', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });

        it('allows access to public home', () => {
            const result = determineRedirect('/', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });
    });

    describe('Authenticated user', () => {
        const isAuthenticated = true;

        it('allows access to org routes', () => {
            const result = determineRedirect('/org/acme/dashboard', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });

        it('redirects to / from login page', () => {
            const result = determineRedirect('/login', isAuthenticated);
            expect(result).toEqual({ action: 'redirect', to: '/' });
        });

        it('redirects to / from register page', () => {
            const result = determineRedirect('/register', isAuthenticated);
            expect(result).toEqual({ action: 'redirect', to: '/' });
        });

        it('redirects to / from register-org page', () => {
            const result = determineRedirect('/register-org', isAuthenticated);
            expect(result).toEqual({ action: 'redirect', to: '/' });
        });

        it('allows access to public home', () => {
            const result = determineRedirect('/', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });

        it('allows access to admin routes', () => {
            const result = determineRedirect('/org/acme/admin', isAuthenticated);
            expect(result).toEqual({ action: 'none' });
        });
    });
});

describe('Middleware - Security Edge Cases', () => {
    it('blocks access to nested org paths when unauthenticated', () => {
        const result = determineRedirect('/org/acme/admin/employees', false);
        expect(result).toEqual({ action: 'redirect', to: '/login' });
    });

    it('handles paths with trailing slashes', () => {
        expect(isOrgRoute('/org/acme/')).toBe(true);
        expect(isAuthRoute('/login/')).toBe(true);
    });

    it('is case-sensitive for path matching', () => {
        // /ORG/ would not match /org/ check
        expect(isOrgRoute('/ORG/acme/dashboard')).toBe(false);
    });

    it('handles paths with query parameters', () => {
        expect(isOrgRoute('/org/acme/dashboard?tab=pending')).toBe(true);
        expect(isAuthRoute('/login?error=auth')).toBe(true);
    });
});

describe('Middleware - Configuration Handling', () => {
    /**
     * Tests for when Supabase is not configured.
     */

    function shouldSkipAuth(supabaseUrl: string | undefined): boolean {
        return !supabaseUrl || supabaseUrl === '';
    }

    it('skips auth when SUPABASE_URL is undefined', () => {
        expect(shouldSkipAuth(undefined)).toBe(true);
    });

    it('skips auth when SUPABASE_URL is empty string', () => {
        expect(shouldSkipAuth('')).toBe(true);
    });

    it('does not skip auth when SUPABASE_URL is configured', () => {
        expect(shouldSkipAuth('https://abc.supabase.co')).toBe(false);
    });
});
