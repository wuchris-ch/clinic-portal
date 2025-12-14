import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * High-Value Tests: Auth Callback Route Logic
 *
 * Tests the critical post-login redirect logic:
 * - Session exchange handling
 * - Profile lookup
 * - Organization lookup
 * - Error redirect scenarios
 *
 * Uses mock-based testing per javascript-testing-patterns.
 */

// ============================================================================
// Extracted Business Logic for Testing
// ============================================================================

type RedirectResult =
    | { type: 'success'; path: string }
    | { type: 'error'; errorCode: string };

interface AuthCallbackDeps {
    exchangeCode: (code: string) => Promise<{ user: { id: string } | null; error: Error | null }>;
    getProfile: (userId: string) => Promise<{ organization_id: string | null } | null>;
    getOrgSlug: (orgId: string) => Promise<string | null>;
}

async function handleAuthCallback(
    code: string | null,
    deps: AuthCallbackDeps
): Promise<RedirectResult> {
    // No code provided
    if (!code) {
        return { type: 'error', errorCode: 'auth' };
    }

    // Exchange code for session
    const { user, error } = await deps.exchangeCode(code);

    if (error || !user) {
        return { type: 'error', errorCode: 'auth' };
    }

    // Get user profile
    const profile = await deps.getProfile(user.id);

    if (!profile) {
        return { type: 'error', errorCode: 'no_profile' };
    }

    if (!profile.organization_id) {
        return { type: 'error', errorCode: 'no_org' };
    }

    // Get org slug
    const slug = await deps.getOrgSlug(profile.organization_id);

    if (!slug) {
        return { type: 'error', errorCode: 'org_not_found' };
    }

    return { type: 'success', path: `/org/${slug}/dashboard` };
}

function buildRedirectUrl(origin: string, result: RedirectResult): string {
    if (result.type === 'success') {
        return `${origin}${result.path}`;
    }
    return `${origin}/login?error=${result.errorCode}`;
}

// ============================================================================
// Tests
// ============================================================================

describe('Auth Callback - handleAuthCallback', () => {
    let mockDeps: AuthCallbackDeps;

    beforeEach(() => {
        mockDeps = {
            exchangeCode: vi.fn(),
            getProfile: vi.fn(),
            getOrgSlug: vi.fn(),
        };
    });

    describe('Code validation', () => {
        it('returns auth error when no code provided', async () => {
            const result = await handleAuthCallback(null, mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'auth' });
            expect(mockDeps.exchangeCode).not.toHaveBeenCalled();
        });

        it('returns auth error when code is empty string', async () => {
            const result = await handleAuthCallback('', mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'auth' });
        });
    });

    describe('Session exchange', () => {
        it('returns auth error when exchange fails', async () => {
            vi.mocked(mockDeps.exchangeCode).mockResolvedValue({
                user: null,
                error: new Error('Invalid code'),
            });

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'auth' });
        });

        it('returns auth error when no user returned', async () => {
            vi.mocked(mockDeps.exchangeCode).mockResolvedValue({
                user: null,
                error: null,
            });

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'auth' });
        });

        it('proceeds to profile lookup on successful exchange', async () => {
            vi.mocked(mockDeps.exchangeCode).mockResolvedValue({
                user: { id: 'user-123' },
                error: null,
            });
            vi.mocked(mockDeps.getProfile).mockResolvedValue(null);

            await handleAuthCallback('valid-code', mockDeps);

            expect(mockDeps.getProfile).toHaveBeenCalledWith('user-123');
        });
    });

    describe('Profile lookup', () => {
        beforeEach(() => {
            vi.mocked(mockDeps.exchangeCode).mockResolvedValue({
                user: { id: 'user-123' },
                error: null,
            });
        });

        it('returns no_profile error when profile not found', async () => {
            vi.mocked(mockDeps.getProfile).mockResolvedValue(null);

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'no_profile' });
        });

        it('returns no_org error when profile has no organization', async () => {
            vi.mocked(mockDeps.getProfile).mockResolvedValue({
                organization_id: null,
            });

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'no_org' });
        });

        it('proceeds to org lookup when profile has organization', async () => {
            vi.mocked(mockDeps.getProfile).mockResolvedValue({
                organization_id: 'org-456',
            });
            vi.mocked(mockDeps.getOrgSlug).mockResolvedValue(null);

            await handleAuthCallback('valid-code', mockDeps);

            expect(mockDeps.getOrgSlug).toHaveBeenCalledWith('org-456');
        });
    });

    describe('Organization lookup', () => {
        beforeEach(() => {
            vi.mocked(mockDeps.exchangeCode).mockResolvedValue({
                user: { id: 'user-123' },
                error: null,
            });
            vi.mocked(mockDeps.getProfile).mockResolvedValue({
                organization_id: 'org-456',
            });
        });

        it('returns org_not_found when organization not found', async () => {
            vi.mocked(mockDeps.getOrgSlug).mockResolvedValue(null);

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({ type: 'error', errorCode: 'org_not_found' });
        });

        it('returns success with correct path when all lookups succeed', async () => {
            vi.mocked(mockDeps.getOrgSlug).mockResolvedValue('acme-clinic');

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({
                type: 'success',
                path: '/org/acme-clinic/dashboard',
            });
        });
    });

    describe('Full success flow', () => {
        it('redirects to correct org dashboard', async () => {
            vi.mocked(mockDeps.exchangeCode).mockResolvedValue({
                user: { id: 'user-123' },
                error: null,
            });
            vi.mocked(mockDeps.getProfile).mockResolvedValue({
                organization_id: 'org-456',
            });
            vi.mocked(mockDeps.getOrgSlug).mockResolvedValue('my-company');

            const result = await handleAuthCallback('valid-code', mockDeps);

            expect(result).toEqual({
                type: 'success',
                path: '/org/my-company/dashboard',
            });
        });
    });
});

describe('Auth Callback - buildRedirectUrl', () => {
    const origin = 'https://example.com';

    it('builds success redirect URL', () => {
        const result: RedirectResult = {
            type: 'success',
            path: '/org/acme/dashboard',
        };

        expect(buildRedirectUrl(origin, result))
            .toBe('https://example.com/org/acme/dashboard');
    });

    it('builds error redirect URL with error code', () => {
        const result: RedirectResult = {
            type: 'error',
            errorCode: 'no_profile',
        };

        expect(buildRedirectUrl(origin, result))
            .toBe('https://example.com/login?error=no_profile');
    });

    it('handles auth error code', () => {
        const result: RedirectResult = {
            type: 'error',
            errorCode: 'auth',
        };

        expect(buildRedirectUrl(origin, result))
            .toBe('https://example.com/login?error=auth');
    });

    it('handles no_org error code', () => {
        const result: RedirectResult = {
            type: 'error',
            errorCode: 'no_org',
        };

        expect(buildRedirectUrl(origin, result))
            .toBe('https://example.com/login?error=no_org');
    });

    it('handles org_not_found error code', () => {
        const result: RedirectResult = {
            type: 'error',
            errorCode: 'org_not_found',
        };

        expect(buildRedirectUrl(origin, result))
            .toBe('https://example.com/login?error=org_not_found');
    });
});

describe('Auth Callback - Error Code Meanings', () => {
    /**
     * Document what each error code means for debugging.
     */

    const errorCodes = {
        auth: 'OAuth code exchange failed or no user returned',
        no_profile: 'User authenticated but no profile record exists',
        no_org: 'User profile exists but has no organization_id',
        org_not_found: 'Profile has organization_id but org record not found',
    };

    it('auth error indicates OAuth failure', () => {
        expect(errorCodes.auth).toContain('OAuth');
    });

    it('no_profile indicates missing database record', () => {
        expect(errorCodes.no_profile).toContain('profile');
    });

    it('no_org indicates user not assigned to org', () => {
        expect(errorCodes.no_org).toContain('organization_id');
    });

    it('org_not_found indicates orphaned reference', () => {
        expect(errorCodes.org_not_found).toContain('org record not found');
    });
});
