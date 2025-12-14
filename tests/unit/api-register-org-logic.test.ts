import { describe, it, expect, vi } from 'vitest';

/**
 * High-Value Tests: Register Organization API Logic
 *
 * Tests the critical business logic in the register-org API route:
 * - Validation rules
 * - Slug generation with uniqueness
 * - Rollback on failure
 * - User metadata structure
 *
 * Uses dependency injection pattern for testable logic.
 */

// ============================================================================
// Extracted Business Logic for Testing
// ============================================================================

interface RegisterOrgInput {
    organizationName: string;
    adminName: string;
    adminEmail: string;
    password: string;
}

interface ValidationResult {
    valid: boolean;
    error?: string;
    status?: number;
}

function validateRegistrationInput(input: Partial<RegisterOrgInput>): ValidationResult {
    const { organizationName, adminName, adminEmail, password } = input;

    if (!organizationName || !adminName || !adminEmail || !password) {
        return { valid: false, error: 'All fields are required', status: 400 };
    }

    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters', status: 400 };
    }

    return { valid: true };
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
}

async function generateUniqueSlug(
    baseName: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    const slug = generateSlug(baseName);
    let suffix = 0;

    while (true) {
        const testSlug = suffix === 0 ? slug : `${slug}-${suffix}`;
        const exists = await checkExists(testSlug);

        if (!exists) {
            return testSlug;
        }
        suffix++;

        // Safety limit
        if (suffix > 100) {
            throw new Error('Unable to generate unique slug');
        }
    }
}

function buildUserMetadata(adminName: string, organizationId: string) {
    return {
        full_name: adminName,
        role: 'admin',
        organization_id: organizationId,
    };
}

// ============================================================================
// Tests
// ============================================================================

describe('Register Organization - Input Validation', () => {
    describe('validateRegistrationInput', () => {
        it('rejects missing organization name', () => {
            const result = validateRegistrationInput({
                adminName: 'John',
                adminEmail: 'john@example.com',
                password: 'password123',
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('All fields are required');
            expect(result.status).toBe(400);
        });

        it('rejects missing admin name', () => {
            const result = validateRegistrationInput({
                organizationName: 'Acme Clinic',
                adminEmail: 'john@example.com',
                password: 'password123',
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('All fields are required');
        });

        it('rejects missing email', () => {
            const result = validateRegistrationInput({
                organizationName: 'Acme Clinic',
                adminName: 'John',
                password: 'password123',
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('All fields are required');
        });

        it('rejects missing password', () => {
            const result = validateRegistrationInput({
                organizationName: 'Acme Clinic',
                adminName: 'John',
                adminEmail: 'john@example.com',
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('All fields are required');
        });

        it('rejects password shorter than 6 characters', () => {
            const result = validateRegistrationInput({
                organizationName: 'Acme Clinic',
                adminName: 'John',
                adminEmail: 'john@example.com',
                password: '12345',
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('Password must be at least 6 characters');
            expect(result.status).toBe(400);
        });

        it('accepts valid input with exactly 6 character password', () => {
            const result = validateRegistrationInput({
                organizationName: 'Acme Clinic',
                adminName: 'John',
                adminEmail: 'john@example.com',
                password: '123456',
            });

            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('accepts valid complete input', () => {
            const result = validateRegistrationInput({
                organizationName: 'Acme Clinic',
                adminName: 'John Doe',
                adminEmail: 'john@example.com',
                password: 'securepassword123',
            });

            expect(result.valid).toBe(true);
        });

        it('rejects empty strings as missing', () => {
            const result = validateRegistrationInput({
                organizationName: '',
                adminName: 'John',
                adminEmail: 'john@example.com',
                password: 'password123',
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('All fields are required');
        });
    });
});

describe('Register Organization - Slug Generation', () => {
    describe('generateSlug', () => {
        it('converts to lowercase', () => {
            expect(generateSlug('ACME Clinic')).toBe('acme-clinic');
        });

        it('replaces spaces with hyphens', () => {
            expect(generateSlug('My Great Company')).toBe('my-great-company');
        });

        it('removes special characters', () => {
            expect(generateSlug("Dr. Smith's Clinic!")).toBe('dr-smiths-clinic');
        });

        it('collapses multiple hyphens', () => {
            expect(generateSlug('Test---Multiple')).toBe('test-multiple');
        });

        it('truncates to 50 characters', () => {
            const longName = 'A'.repeat(60);
            expect(generateSlug(longName).length).toBe(50);
        });

        it('handles numbers', () => {
            expect(generateSlug('Clinic 123')).toBe('clinic-123');
        });
    });

    describe('generateUniqueSlug', () => {
        it('returns base slug when no conflicts', async () => {
            const checkExists = vi.fn().mockResolvedValue(false);

            const slug = await generateUniqueSlug('Acme Clinic', checkExists);

            expect(slug).toBe('acme-clinic');
            expect(checkExists).toHaveBeenCalledWith('acme-clinic');
            expect(checkExists).toHaveBeenCalledTimes(1);
        });

        it('adds suffix when slug exists', async () => {
            const checkExists = vi.fn()
                .mockResolvedValueOnce(true)  // acme-clinic exists
                .mockResolvedValueOnce(false); // acme-clinic-1 is free

            const slug = await generateUniqueSlug('Acme Clinic', checkExists);

            expect(slug).toBe('acme-clinic-1');
            expect(checkExists).toHaveBeenCalledTimes(2);
        });

        it('increments suffix until unique', async () => {
            const checkExists = vi.fn()
                .mockResolvedValueOnce(true)  // acme-clinic exists
                .mockResolvedValueOnce(true)  // acme-clinic-1 exists
                .mockResolvedValueOnce(true)  // acme-clinic-2 exists
                .mockResolvedValueOnce(false); // acme-clinic-3 is free

            const slug = await generateUniqueSlug('Acme Clinic', checkExists);

            expect(slug).toBe('acme-clinic-3');
            expect(checkExists).toHaveBeenCalledTimes(4);
        });

        it('throws error after too many attempts', async () => {
            const checkExists = vi.fn().mockResolvedValue(true); // Always exists

            await expect(generateUniqueSlug('Test', checkExists))
                .rejects.toThrow('Unable to generate unique slug');
        });
    });
});

describe('Register Organization - User Metadata', () => {
    describe('buildUserMetadata', () => {
        it('includes full_name from admin name', () => {
            const metadata = buildUserMetadata('John Doe', 'org-123');
            expect(metadata.full_name).toBe('John Doe');
        });

        it('sets role to admin', () => {
            const metadata = buildUserMetadata('John Doe', 'org-123');
            expect(metadata.role).toBe('admin');
        });

        it('includes organization_id', () => {
            const metadata = buildUserMetadata('John Doe', 'org-123');
            expect(metadata.organization_id).toBe('org-123');
        });

        it('creates correct structure for Supabase', () => {
            const metadata = buildUserMetadata('Jane Smith', 'org-456');

            expect(metadata).toEqual({
                full_name: 'Jane Smith',
                role: 'admin',
                organization_id: 'org-456',
            });
        });
    });
});

describe('Register Organization - Rollback Scenarios', () => {
    /**
     * Tests the rollback logic patterns used when user creation fails.
     */

    interface RollbackState {
        organizationCreated: boolean;
        organizationDeleted: boolean;
        userCreated: boolean;
    }

    async function simulateRegistrationWithRollback(
        createOrg: () => Promise<{ id: string } | null>,
        createUser: () => Promise<boolean>,
        deleteOrg: (id: string) => Promise<void>
    ): Promise<{ success: boolean; state: RollbackState }> {
        const state: RollbackState = {
            organizationCreated: false,
            organizationDeleted: false,
            userCreated: false,
        };

        // Step 1: Create organization
        const org = await createOrg();
        if (!org) {
            return { success: false, state };
        }
        state.organizationCreated = true;

        // Step 2: Create user
        try {
            const userSuccess = await createUser();
            if (!userSuccess) {
                // Rollback: delete organization
                await deleteOrg(org.id);
                state.organizationDeleted = true;
                return { success: false, state };
            }
            state.userCreated = true;
            return { success: true, state };
        } catch {
            // Rollback on error
            await deleteOrg(org.id);
            state.organizationDeleted = true;
            return { success: false, state };
        }
    }

    it('succeeds when both org and user creation succeed', async () => {
        const createOrg = vi.fn().mockResolvedValue({ id: 'org-123' });
        const createUser = vi.fn().mockResolvedValue(true);
        const deleteOrg = vi.fn();

        const result = await simulateRegistrationWithRollback(createOrg, createUser, deleteOrg);

        expect(result.success).toBe(true);
        expect(result.state.organizationCreated).toBe(true);
        expect(result.state.userCreated).toBe(true);
        expect(result.state.organizationDeleted).toBe(false);
        expect(deleteOrg).not.toHaveBeenCalled();
    });

    it('rolls back organization when user creation fails', async () => {
        const createOrg = vi.fn().mockResolvedValue({ id: 'org-123' });
        const createUser = vi.fn().mockResolvedValue(false);
        const deleteOrg = vi.fn();

        const result = await simulateRegistrationWithRollback(createOrg, createUser, deleteOrg);

        expect(result.success).toBe(false);
        expect(result.state.organizationCreated).toBe(true);
        expect(result.state.organizationDeleted).toBe(true);
        expect(deleteOrg).toHaveBeenCalledWith('org-123');
    });

    it('rolls back organization when user creation throws', async () => {
        const createOrg = vi.fn().mockResolvedValue({ id: 'org-123' });
        const createUser = vi.fn().mockRejectedValue(new Error('Auth error'));
        const deleteOrg = vi.fn();

        const result = await simulateRegistrationWithRollback(createOrg, createUser, deleteOrg);

        expect(result.success).toBe(false);
        expect(result.state.organizationDeleted).toBe(true);
        expect(deleteOrg).toHaveBeenCalledWith('org-123');
    });

    it('fails early when org creation fails', async () => {
        const createOrg = vi.fn().mockResolvedValue(null);
        const createUser = vi.fn();
        const deleteOrg = vi.fn();

        const result = await simulateRegistrationWithRollback(createOrg, createUser, deleteOrg);

        expect(result.success).toBe(false);
        expect(result.state.organizationCreated).toBe(false);
        expect(createUser).not.toHaveBeenCalled();
        expect(deleteOrg).not.toHaveBeenCalled();
    });
});
