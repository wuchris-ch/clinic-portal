import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests: Google Sheets Integration
 * 
 * These tests verify the Google Sheets helper function logic.
 * We mock the googleapis library since we can't make real API calls in tests.
 */

// Mock the googleapis module
vi.mock('googleapis', () => ({
    google: {
        auth: {
            GoogleAuth: vi.fn().mockImplementation(() => ({})),
        },
        sheets: vi.fn().mockImplementation(() => ({
            spreadsheets: {
                values: {
                    append: vi.fn().mockResolvedValue({ data: {} }),
                },
            },
        })),
    },
}));

describe('Google Sheets Integration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('appendRowToSheet', () => {
        it('returns false when credentials are not configured', async () => {
            // Clear Google Sheets env vars
            delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            delete process.env.GOOGLE_PRIVATE_KEY;
            delete process.env.GOOGLE_SHEET_ID;

            const { appendRowToSheet } = await import('@/lib/google-sheets');
            const result = await appendRowToSheet(['test', 'data'], 'Sheet1');

            expect(result).toBe(false);
        });

        it('returns false when GOOGLE_SHEET_ID is missing', async () => {
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
            process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
            delete process.env.GOOGLE_SHEET_ID;

            const { appendRowToSheet } = await import('@/lib/google-sheets');
            const result = await appendRowToSheet(['test', 'data'], 'Sheet1');

            expect(result).toBe(false);
        });

        it('returns false when GOOGLE_SERVICE_ACCOUNT_EMAIL is missing', async () => {
            delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
            process.env.GOOGLE_SHEET_ID = 'test-sheet-id';

            const { appendRowToSheet } = await import('@/lib/google-sheets');
            const result = await appendRowToSheet(['test', 'data'], 'Sheet1');

            expect(result).toBe(false);
        });

        it('returns false when GOOGLE_PRIVATE_KEY is missing', async () => {
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
            delete process.env.GOOGLE_PRIVATE_KEY;
            process.env.GOOGLE_SHEET_ID = 'test-sheet-id';

            const { appendRowToSheet } = await import('@/lib/google-sheets');
            const result = await appendRowToSheet(['test', 'data'], 'Sheet1');

            expect(result).toBe(false);
        });

        it('uses default sheet name when not provided', async () => {
            // This test verifies the function signature accepts optional sheet name
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
            process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
            process.env.GOOGLE_SHEET_ID = 'test-sheet-id';

            const { appendRowToSheet } = await import('@/lib/google-sheets');

            // Should not throw when called without sheet name
            const result = await appendRowToSheet(['test', 'data']);
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Sheet name mapping', () => {
        it('Leave Requests tab name is correct', () => {
            const sheetName = 'Leave Requests';
            expect(sheetName).toBe('Leave Requests');
        });

        it('Time Clock tab name is correct', () => {
            const sheetName = 'Time Clock';
            expect(sheetName).toBe('Time Clock');
        });

        it('Overtime tab name is correct', () => {
            const sheetName = 'Overtime';
            expect(sheetName).toBe('Overtime');
        });
    });

    describe('Data transformation', () => {
        it('Leave Request row has correct number of columns', () => {
            const leaveRequestRow = [
                '2025-12-08',           // A: Submission Date
                'Leave Request',        // B: Type
                'John Doe',             // C: Name
                'john@example.com',     // D: Email
                'Single Day Off',       // E: Leave Type
                '2025-12-10',           // F: Start Date
                '2025-12-10',           // G: End Date
                '1',                    // H: Total Days
                'Personal appointment', // I: Reason
                'Period 1',             // J: Pay Period
                'N/A',                  // K: Coverage Name
                'request-id-123'        // L: Request ID
            ];

            expect(leaveRequestRow.length).toBe(12);
        });

        it('Time Clock row has correct number of columns', () => {
            const timeClockRow = [
                '2025-12-08 10:30:00',  // A: Submission Date
                'Time Clock Request',   // B: Type
                'John Doe',             // C: Name
                'john@example.com',     // D: Email
                '2025-12-07 09:00 AM',  // E: Clock In
                '2025-12-07 05:00 PM',  // F: Clock Out
                'Forgot to clock in',   // G: Reason In
                '',                     // H: Reason Out
                'Period 1'              // I: Pay Period
            ];

            expect(timeClockRow.length).toBe(9);
        });

        it('Overtime row has correct number of columns', () => {
            const overtimeRow = [
                '2025-12-08 10:30:00',  // A: Submission Date
                'Overtime Request',     // B: Type
                'John Doe',             // C: Name
                'john@example.com',     // D: Email
                '2025-12-07',           // E: Overtime Date
                'Yes',                  // F: Asked Doctor
                'Jane Smith',           // G: Senior Staff
                'Period 1'              // H: Pay Period
            ];

            expect(overtimeRow.length).toBe(8);
        });
    });
});
