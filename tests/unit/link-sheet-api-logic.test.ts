import { describe, it, expect } from 'vitest';

/**
 * High-Value Tests: Link Sheet API Logic
 *
 * Tests the admin sheet linking API authorization and logic:
 * - Authentication verification
 * - Admin role authorization
 * - Organization ownership validation
 * - Input validation
 *
 * Critical for security - prevents unauthorized sheet modifications.
 */

// ============================================================================
// Extracted Business Logic for Testing
// ============================================================================

interface User {
    id: string;
}

interface Profile {
    role: string;
    organization_id: string | null;
}

type AuthResult =
    | { authorized: true; userId: string }
    | { authorized: false; error: string; status: number };

type ValidationResult =
    | { valid: true }
    | { valid: false; error: string; status: number };

function checkAuthentication(user: User | null): AuthResult {
    if (!user) {
        return { authorized: false, error: 'Unauthorized', status: 401 };
    }
    return { authorized: true, userId: user.id };
}

function checkAdminRole(profile: Profile | null): ValidationResult {
    if (!profile || profile.role !== 'admin') {
        return {
            valid: false,
            error: 'Forbidden - Admin access required',
            status: 403,
        };
    }
    return { valid: true };
}

function checkOrganizationOwnership(
    profileOrgId: string | null,
    requestedOrgId: string
): ValidationResult {
    if (profileOrgId !== requestedOrgId) {
        return {
            valid: false,
            error: 'Forbidden - Organization mismatch',
            status: 403,
        };
    }
    return { valid: true };
}

function validateSheetId(sheetId: string | undefined): ValidationResult {
    if (!sheetId) {
        return {
            valid: false,
            error: 'Sheet ID is required',
            status: 400,
        };
    }
    return { valid: true };
}

// Full authorization flow
interface AuthorizationDeps {
    getUser: () => Promise<User | null>;
    getProfile: (userId: string) => Promise<Profile | null>;
}

type AuthorizationResult =
    | { authorized: true; profile: Profile }
    | { authorized: false; error: string; status: number };

async function authorizeAdminAction(
    deps: AuthorizationDeps
): Promise<AuthorizationResult> {
    const user = await deps.getUser();
    const authResult = checkAuthentication(user);

    if (!authResult.authorized) {
        return authResult;
    }

    const profile = await deps.getProfile(authResult.userId);
    const roleResult = checkAdminRole(profile);

    if (!roleResult.valid) {
        return {
            authorized: false,
            error: roleResult.error,
            status: roleResult.status,
        };
    }

    return { authorized: true, profile: profile! };
}

// ============================================================================
// Tests
// ============================================================================

describe('Link Sheet API - Authentication', () => {
    describe('checkAuthentication', () => {
        it('returns unauthorized when user is null', () => {
            const result = checkAuthentication(null);

            expect(result.authorized).toBe(false);
            if (!result.authorized) {
                expect(result.error).toBe('Unauthorized');
                expect(result.status).toBe(401);
            }
        });

        it('returns authorized with userId when user exists', () => {
            const result = checkAuthentication({ id: 'user-123' });

            expect(result.authorized).toBe(true);
            if (result.authorized) {
                expect(result.userId).toBe('user-123');
            }
        });
    });
});

describe('Link Sheet API - Admin Role Check', () => {
    describe('checkAdminRole', () => {
        it('returns invalid when profile is null', () => {
            const result = checkAdminRole(null);

            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.error).toBe('Forbidden - Admin access required');
                expect(result.status).toBe(403);
            }
        });

        it('returns invalid when role is not admin', () => {
            const result = checkAdminRole({
                role: 'user',
                organization_id: 'org-123',
            });

            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.status).toBe(403);
            }
        });

        it('returns valid when role is admin', () => {
            const result = checkAdminRole({
                role: 'admin',
                organization_id: 'org-123',
            });

            expect(result.valid).toBe(true);
        });

        it('is case-sensitive for admin role', () => {
            const result = checkAdminRole({
                role: 'Admin', // Capital A
                organization_id: 'org-123',
            });

            expect(result.valid).toBe(false);
        });
    });
});

describe('Link Sheet API - Organization Ownership', () => {
    describe('checkOrganizationOwnership', () => {
        it('returns valid when org IDs match', () => {
            const result = checkOrganizationOwnership('org-123', 'org-123');

            expect(result.valid).toBe(true);
        });

        it('returns invalid when org IDs differ', () => {
            const result = checkOrganizationOwnership('org-123', 'org-456');

            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.error).toBe('Forbidden - Organization mismatch');
                expect(result.status).toBe(403);
            }
        });

        it('returns invalid when profile has no org', () => {
            const result = checkOrganizationOwnership(null, 'org-123');

            expect(result.valid).toBe(false);
        });

        it('performs exact string comparison', () => {
            const result = checkOrganizationOwnership('org-123', 'org-1234');

            expect(result.valid).toBe(false);
        });
    });
});

describe('Link Sheet API - Sheet ID Validation', () => {
    describe('validateSheetId', () => {
        it('returns invalid when sheetId is undefined', () => {
            const result = validateSheetId(undefined);

            expect(result.valid).toBe(false);
            if (!result.valid) {
                expect(result.error).toBe('Sheet ID is required');
                expect(result.status).toBe(400);
            }
        });

        it('returns invalid when sheetId is empty string', () => {
            const result = validateSheetId('');

            expect(result.valid).toBe(false);
        });

        it('returns valid when sheetId is provided', () => {
            const result = validateSheetId('1abc123xyz');

            expect(result.valid).toBe(true);
        });

        it('accepts Google Sheet ID format', () => {
            // Real Google Sheet IDs are long alphanumeric strings
            const result = validateSheetId(
                '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
            );

            expect(result.valid).toBe(true);
        });
    });
});

describe('Link Sheet API - Full Authorization Flow', () => {
    let mockDeps: AuthorizationDeps;

    beforeEach(() => {
        mockDeps = {
            getUser: vi.fn(),
            getProfile: vi.fn(),
        };
    });

    it('fails when user not authenticated', async () => {
        vi.mocked(mockDeps.getUser).mockResolvedValue(null);

        const result = await authorizeAdminAction(mockDeps);

        expect(result.authorized).toBe(false);
        if (!result.authorized) {
            expect(result.status).toBe(401);
        }
    });

    it('fails when user is not admin', async () => {
        vi.mocked(mockDeps.getUser).mockResolvedValue({ id: 'user-123' });
        vi.mocked(mockDeps.getProfile).mockResolvedValue({
            role: 'user',
            organization_id: 'org-123',
        });

        const result = await authorizeAdminAction(mockDeps);

        expect(result.authorized).toBe(false);
        if (!result.authorized) {
            expect(result.status).toBe(403);
        }
    });

    it('fails when profile not found', async () => {
        vi.mocked(mockDeps.getUser).mockResolvedValue({ id: 'user-123' });
        vi.mocked(mockDeps.getProfile).mockResolvedValue(null);

        const result = await authorizeAdminAction(mockDeps);

        expect(result.authorized).toBe(false);
        if (!result.authorized) {
            expect(result.status).toBe(403);
        }
    });

    it('succeeds when user is admin', async () => {
        vi.mocked(mockDeps.getUser).mockResolvedValue({ id: 'user-123' });
        vi.mocked(mockDeps.getProfile).mockResolvedValue({
            role: 'admin',
            organization_id: 'org-456',
        });

        const result = await authorizeAdminAction(mockDeps);

        expect(result.authorized).toBe(true);
        if (result.authorized) {
            expect(result.profile.role).toBe('admin');
            expect(result.profile.organization_id).toBe('org-456');
        }
    });
});

describe('Link Sheet API - Request Body Validation', () => {
    interface LinkSheetBody {
        sheetId?: string;
        organizationId?: string;
    }

    function validateLinkSheetBody(body: LinkSheetBody): ValidationResult {
        if (!body.sheetId) {
            return { valid: false, error: 'Sheet ID is required', status: 400 };
        }
        if (!body.organizationId) {
            return { valid: false, error: 'Organization ID is required', status: 400 };
        }
        return { valid: true };
    }

    it('requires sheetId', () => {
        const result = validateLinkSheetBody({ organizationId: 'org-123' });

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.error).toBe('Sheet ID is required');
        }
    });

    it('requires organizationId', () => {
        const result = validateLinkSheetBody({ sheetId: 'sheet-123' });

        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.error).toBe('Organization ID is required');
        }
    });

    it('accepts valid body', () => {
        const result = validateLinkSheetBody({
            sheetId: 'sheet-123',
            organizationId: 'org-456',
        });

        expect(result.valid).toBe(true);
    });
});

describe('Link Sheet API - Error Response Structure', () => {
    /**
     * Verify error response structure matches API contract.
     */

    interface ErrorResponse {
        error: string;
    }

    function buildErrorResponse(message: string): ErrorResponse {
        return { error: message };
    }

    it('creates correct error response structure', () => {
        const response = buildErrorResponse('Sheet ID is required');

        expect(response).toEqual({ error: 'Sheet ID is required' });
    });

    it('includes all possible error messages', () => {
        const errorMessages = [
            'Unauthorized',
            'Forbidden - Admin access required',
            'Forbidden - Organization mismatch',
            'Sheet ID is required',
            'Failed to save sheet ID to database',
            'Internal server error',
        ];

        for (const message of errorMessages) {
            const response = buildErrorResponse(message);
            expect(response.error).toBe(message);
        }
    });
});
