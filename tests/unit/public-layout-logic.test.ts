import { describe, it, expect } from 'vitest';

/**
 * Tests for public layout rendering logic.
 *
 * The public layout (src/app/(public)/layout.tsx) handles three scenarios:
 * 1. Non-signed-in users → Show landing page (children)
 * 2. Signed-in users WITH an org → Redirect to /org/{slug}/dashboard
 * 3. Signed-in users WITHOUT an org → Show landing page (children)
 *
 * This is a logic test that verifies the decision tree.
 * E2E tests (homepage-redirect.auth.spec.ts) verify the actual redirect behavior.
 */

type User = { id: string } | null;
type Profile = { organization_id: string | null } | null;
type Organization = { slug: string } | null;

interface LayoutDecision {
    action: 'show_landing' | 'redirect_to_dashboard';
    redirectPath?: string;
}

/**
 * Simulates the layout's conditional rendering/redirect logic.
 * This mirrors the actual implementation in layout.tsx.
 */
function determineLayoutAction(
    user: User,
    profile: Profile,
    organization: Organization
): LayoutDecision {
    // Non-signed-in users see the landing page
    if (!user) {
        return { action: 'show_landing' };
    }

    // Signed-in user with org → redirect to dashboard
    if (profile?.organization_id && organization?.slug) {
        return {
            action: 'redirect_to_dashboard',
            redirectPath: `/org/${organization.slug}/dashboard`,
        };
    }

    // Signed-in user without org → show landing page
    return { action: 'show_landing' };
}

describe('Public Layout Decision Logic', () => {

    describe('Non-signed-in users', () => {
        it('should show landing page when user is null', () => {
            const result = determineLayoutAction(null, null, null);

            expect(result.action).toBe('show_landing');
            expect(result.redirectPath).toBeUndefined();
        });
    });

    describe('Signed-in users WITH organization', () => {
        it('should redirect to org dashboard', () => {
            const user = { id: 'user-123' };
            const profile = { organization_id: 'org-456' };
            const organization = { slug: 'sunrise-clinic' };

            const result = determineLayoutAction(user, profile, organization);

            expect(result.action).toBe('redirect_to_dashboard');
            expect(result.redirectPath).toBe('/org/sunrise-clinic/dashboard');
        });

        it('should include correct org slug in redirect path', () => {
            const user = { id: 'user-789' };
            const profile = { organization_id: 'org-abc' };
            const organization = { slug: 'testorg' };

            const result = determineLayoutAction(user, profile, organization);

            expect(result.redirectPath).toBe('/org/testorg/dashboard');
        });
    });

    describe('Signed-in users WITHOUT organization', () => {
        it('should show landing page when profile has no org', () => {
            const user = { id: 'user-123' };
            const profile = { organization_id: null };
            const organization = null;

            const result = determineLayoutAction(user, profile, organization);

            expect(result.action).toBe('show_landing');
            expect(result.redirectPath).toBeUndefined();
        });

        it('should show landing page when profile is null', () => {
            const user = { id: 'user-123' };
            const profile = null;
            const organization = null;

            const result = determineLayoutAction(user, profile, organization);

            expect(result.action).toBe('show_landing');
        });

        it('should show landing page when org lookup returns null', () => {
            const user = { id: 'user-123' };
            const profile = { organization_id: 'org-456' };
            const organization = null; // org lookup failed

            const result = determineLayoutAction(user, profile, organization);

            expect(result.action).toBe('show_landing');
        });

        it('should show landing page when org has no slug', () => {
            const user = { id: 'user-123' };
            const profile = { organization_id: 'org-456' };
            const organization = { slug: '' }; // empty slug

            const result = determineLayoutAction(user, profile, organization);

            // Empty string is falsy, so should show landing
            expect(result.action).toBe('show_landing');
        });
    });

});
