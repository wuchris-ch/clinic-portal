import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit Tests: Register Organization API Route
 *
 * These tests verify the structure and logic of the register-org API route.
 * Integration testing is done via E2E tests.
 */

const projectRoot = join(__dirname, '../..');
const registerOrgRoutePath = join(projectRoot, 'src/app/api/register-org/route.ts');

describe('Register Org API Route', () => {
    it('route file exists', () => {
        expect(existsSync(registerOrgRoutePath)).toBe(true);
    });

    const routeContent = readFileSync(registerOrgRoutePath, 'utf-8');

    describe('Request Handling', () => {
        it('exports POST handler', () => {
            expect(routeContent).toContain('export async function POST');
        });

        it('parses JSON body', () => {
            expect(routeContent).toContain('request.json()');
        });

        it('extracts required fields from body', () => {
            expect(routeContent).toContain('organizationName');
            expect(routeContent).toContain('adminName');
            expect(routeContent).toContain('adminEmail');
            expect(routeContent).toContain('password');
        });
    });

    describe('Validation', () => {
        it('validates required fields', () => {
            expect(routeContent).toContain('All fields are required');
            expect(routeContent).toContain('status: 400');
        });

        it('validates password length', () => {
            expect(routeContent).toContain('Password must be at least 6 characters');
            expect(routeContent).toContain('password.length < 6');
        });
    });

    describe('Slug Generation', () => {
        it('has generateSlug function', () => {
            expect(routeContent).toContain('function generateSlug');
        });

        it('converts name to lowercase', () => {
            expect(routeContent).toContain('.toLowerCase()');
        });

        it('removes special characters', () => {
            expect(routeContent).toContain('/[^a-z0-9\\s-]/g');
        });

        it('replaces spaces with hyphens', () => {
            expect(routeContent).toContain('/\\s+/g');
        });

        it('limits slug length', () => {
            expect(routeContent).toContain('.substring(0, 50)');
        });

        it('ensures slug uniqueness', () => {
            expect(routeContent).toContain('slugSuffix');
            expect(routeContent).toContain('existingOrg');
        });
    });

    describe('Database Operations', () => {
        it('creates organization first', () => {
            expect(routeContent).toContain(".from('organizations')");
            expect(routeContent).toContain('.insert({');
            expect(routeContent).toContain('name: organizationName');
            expect(routeContent).toContain('slug');
            expect(routeContent).toContain('admin_email: adminEmail');
        });

        it('creates admin user with auth', () => {
            expect(routeContent).toContain('auth.admin.createUser');
            expect(routeContent).toContain('email_confirm: true');
            expect(routeContent).toContain('user_metadata');
        });

        it('includes role in user metadata', () => {
            expect(routeContent).toContain("role: 'admin'");
            expect(routeContent).toContain('organization_id: organization.id');
        });

        it('updates profile with organization_id', () => {
            expect(routeContent).toContain(".from('profiles')");
            expect(routeContent).toContain('.update({');
            expect(routeContent).toContain('organization_id: organization.id');
        });

        it('adds admin as notification recipient', () => {
            expect(routeContent).toContain(".from('notification_recipients')");
            expect(routeContent).toContain('is_active: true');
        });
    });

    describe('Error Handling', () => {
        it('handles organization creation error', () => {
            expect(routeContent).toContain('Failed to create organization');
            expect(routeContent).toContain('status: 500');
        });

        it('rolls back organization on auth error', () => {
            expect(routeContent).toContain('Rollback organization creation');
            expect(routeContent).toContain('.delete()');
        });

        it('handles auth error with message', () => {
            expect(routeContent).toContain('authError.message');
        });

        it('has catch block for unexpected errors', () => {
            expect(routeContent).toContain('catch (error)');
            expect(routeContent).toContain('Internal server error');
        });

        it('logs errors for debugging', () => {
            expect(routeContent).toContain('console.error');
        });
    });

    describe('Response', () => {
        it('returns success response with organization data', () => {
            expect(routeContent).toContain('success: true');
            expect(routeContent).toContain('organization: {');
            expect(routeContent).toContain('organization.id');
            expect(routeContent).toContain('organization.name');
            expect(routeContent).toContain('organization.slug');
        });
    });

    describe('Supabase Client', () => {
        it('uses service role key for admin operations', () => {
            expect(routeContent).toContain('SUPABASE_SERVICE_ROLE_KEY');
        });

        it('disables auto refresh for server-side client', () => {
            expect(routeContent).toContain('autoRefreshToken: false');
            expect(routeContent).toContain('persistSession: false');
        });
    });
});

describe('Slug Generation Logic', () => {
    // Test the slug generation algorithm independently
    function generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    it('converts to lowercase', () => {
        expect(generateSlug('ACME Clinic')).toBe('acme-clinic');
    });

    it('replaces spaces with hyphens', () => {
        expect(generateSlug('My Great Company')).toBe('my-great-company');
    });

    it('removes special characters', () => {
        expect(generateSlug("Dr. Smith's Clinic!")).toBe('dr-smiths-clinic');
    });

    it('handles multiple spaces', () => {
        expect(generateSlug('Test    Multiple   Spaces')).toBe('test-multiple-spaces');
    });

    it('handles multiple hyphens', () => {
        expect(generateSlug('Test---Multiple---Hyphens')).toBe('test-multiple-hyphens');
    });

    it('truncates long names to 50 characters', () => {
        const longName = 'This Is A Very Long Organization Name That Should Be Truncated';
        expect(generateSlug(longName).length).toBeLessThanOrEqual(50);
    });

    it('handles empty string', () => {
        expect(generateSlug('')).toBe('');
    });

    it('handles numbers in name', () => {
        expect(generateSlug('Clinic 123')).toBe('clinic-123');
    });
});
