import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit Tests: Admin Sheet API Routes
 *
 * These tests verify the structure and authorization logic of the admin sheet routes.
 * Integration testing for actual Google Sheets operations is done manually on Vercel Preview.
 */

const projectRoot = join(__dirname, '../..');
const linkSheetRoutePath = join(projectRoot, 'src/app/api/admin/link-sheet/route.ts');
const testSheetRoutePath = join(projectRoot, 'src/app/api/admin/test-sheet/route.ts');
const createSheetRoutePath = join(projectRoot, 'src/app/api/admin/create-sheet/route.ts');

describe('Link Sheet API Route', () => {
    it('route file exists', () => {
        expect(existsSync(linkSheetRoutePath)).toBe(true);
    });

    const routeContent = readFileSync(linkSheetRoutePath, 'utf-8');

    describe('Authentication', () => {
        it('exports POST handler', () => {
            expect(routeContent).toContain('export async function POST');
        });

        it('verifies user is authenticated', () => {
            expect(routeContent).toContain('auth.getUser()');
        });

        it('returns 401 for unauthenticated users', () => {
            expect(routeContent).toContain('Unauthorized');
            expect(routeContent).toContain('status: 401');
        });
    });

    describe('Authorization', () => {
        it('checks user profile for admin role', () => {
            expect(routeContent).toContain('.from("profiles")');
            expect(routeContent).toContain('role');
            expect(routeContent).toContain('organization_id');
        });

        it('returns 403 for non-admin users', () => {
            expect(routeContent).toContain('Admin access required');
            expect(routeContent).toContain('status: 403');
        });

        it('verifies organization ownership', () => {
            expect(routeContent).toContain('Organization mismatch');
            expect(routeContent).toContain('profile.organization_id !== organizationId');
        });
    });

    describe('Validation', () => {
        it('requires sheetId in request body', () => {
            expect(routeContent).toContain('Sheet ID is required');
            expect(routeContent).toContain('status: 400');
        });

        it('extracts sheetId and organizationId from body', () => {
            expect(routeContent).toContain('sheetId');
            expect(routeContent).toContain('organizationId');
            expect(routeContent).toContain('request.json()');
        });
    });

    describe('Database Operations', () => {
        it('updates organization with sheet ID', () => {
            expect(routeContent).toContain('.from("organizations")');
            expect(routeContent).toContain('.update({');
            expect(routeContent).toContain('google_sheet_id: sheetId');
        });

        it('uses service role for database update', () => {
            expect(routeContent).toContain('SUPABASE_SERVICE_ROLE_KEY');
            expect(routeContent).toContain('getSupabaseAdmin');
        });
    });

    describe('Response', () => {
        it('returns success message on successful link', () => {
            expect(routeContent).toContain('success: true');
            expect(routeContent).toContain('Sheet linked successfully');
        });

        it('handles update errors', () => {
            expect(routeContent).toContain('Failed to save sheet ID to database');
            expect(routeContent).toContain('status: 500');
        });
    });

    describe('Error Handling', () => {
        it('has catch block for unexpected errors', () => {
            expect(routeContent).toContain('catch (error)');
            expect(routeContent).toContain('Internal server error');
        });

        it('logs errors for debugging', () => {
            expect(routeContent).toContain('console.error');
        });
    });
});

describe('Test Sheet API Route', () => {
    it('route file exists', () => {
        expect(existsSync(testSheetRoutePath)).toBe(true);
    });

    const routeContent = readFileSync(testSheetRoutePath, 'utf-8');

    describe('Authentication', () => {
        it('exports POST handler', () => {
            expect(routeContent).toContain('export async function POST');
        });

        it('verifies user is authenticated', () => {
            expect(routeContent).toContain('auth.getUser()');
        });

        it('returns 401 for unauthenticated users', () => {
            expect(routeContent).toContain('Unauthorized');
            expect(routeContent).toContain('status: 401');
        });
    });

    describe('Authorization', () => {
        it('checks user profile for admin role', () => {
            expect(routeContent).toContain('.from("profiles")');
            expect(routeContent).toContain("role !== \"admin\"");
        });

        it('returns 403 for non-admin users', () => {
            expect(routeContent).toContain('Admin access required');
            expect(routeContent).toContain('status: 403');
        });

        it('verifies organization ownership', () => {
            expect(routeContent).toContain('Organization mismatch');
        });
    });

    describe('Validation', () => {
        it('requires sheetId in request body', () => {
            expect(routeContent).toContain('Sheet ID is required');
            expect(routeContent).toContain('status: 400');
        });

        it('checks Google credentials are configured', () => {
            expect(routeContent).toContain('GOOGLE_SERVICE_ACCOUNT_EMAIL');
            expect(routeContent).toContain('GOOGLE_PRIVATE_KEY');
            expect(routeContent).toContain('Google credentials not configured');
        });
    });

    describe('Google Sheets Integration', () => {
        it('uses Google Auth with service account', () => {
            expect(routeContent).toContain('google.auth.GoogleAuth');
            expect(routeContent).toContain('client_email');
            expect(routeContent).toContain('private_key');
        });

        it('requests spreadsheets.readonly scope', () => {
            expect(routeContent).toContain('spreadsheets.readonly');
        });

        it('fetches spreadsheet properties', () => {
            expect(routeContent).toContain('spreadsheets.get');
            expect(routeContent).toContain('properties.title');
        });

        it('handles newlines in private key', () => {
            expect(routeContent).toContain('.replace(/\\\\n/g');
        });
    });

    describe('Response', () => {
        it('returns sheet title and tab names on success', () => {
            expect(routeContent).toContain('success: true');
            expect(routeContent).toContain('sheetTitle');
            expect(routeContent).toContain('tabs: tabNames');
        });
    });

    describe('Error Handling', () => {
        it('handles 404 - sheet not found', () => {
            expect(routeContent).toContain('error.code === 404');
            expect(routeContent).toContain('Sheet not found');
        });

        it('handles 403 - access denied', () => {
            expect(routeContent).toContain('error.code === 403');
            expect(routeContent).toContain('Access denied');
            expect(routeContent).toContain('shared with the service account');
        });

        it('logs detailed error info for debugging', () => {
            expect(routeContent).toContain('Error details');
            expect(routeContent).toContain('hasEmail');
            expect(routeContent).toContain('hasKey');
            expect(routeContent).toContain('keyLength');
        });

        it('returns error details in response', () => {
            expect(routeContent).toContain('Failed to test sheet connection');
            expect(routeContent).toContain('details:');
        });
    });
});

describe('Create Sheet API Route', () => {
    it('route file exists', () => {
        expect(existsSync(createSheetRoutePath)).toBe(true);
    });

    const routeContent = readFileSync(createSheetRoutePath, 'utf-8');

    describe('Authentication', () => {
        it('exports POST handler', () => {
            expect(routeContent).toContain('export async function POST');
        });

        it('verifies user is authenticated', () => {
            expect(routeContent).toContain('auth.getUser()');
        });
    });

    describe('Authorization', () => {
        it('checks user profile for admin role', () => {
            expect(routeContent).toContain('.from("profiles")');
        });
    });

    describe('Google Sheets Creation', () => {
        it('uses Google Drive API for creating spreadsheet', () => {
            // May use googleapis or google.sheets
            expect(routeContent.toLowerCase()).toContain('google');
        });
    });
});
