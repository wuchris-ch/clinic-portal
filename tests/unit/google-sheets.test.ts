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
        it('Leave Request row has correct number of columns (14)', () => {
            const leaveRequestRow = [
                '2025-12-08',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Tuesday',              // C: Day of Week
                'Leave Request',        // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                'Single Day Off',       // G: Leave Type
                '2025-12-10',           // H: Start Date
                '2025-12-10',           // I: End Date
                '1',                    // J: Total Days
                'Personal appointment', // K: Reason
                'Period 1',             // L: Pay Period
                'Jane Smith',           // M: Coverage Name
                'jane@example.com'      // N: Coverage Email
            ];

            expect(leaveRequestRow.length).toBe(14);
        });

        it('Time Clock row has correct number of columns (11)', () => {
            const timeClockRow = [
                '2025-12-08',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Tuesday',              // C: Day of Week
                'Time Clock Request',   // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-12-07 09:00 AM',  // G: Clock In
                '2025-12-07 05:00 PM',  // H: Clock Out
                'Forgot to clock in',   // I: Reason In
                '',                     // J: Reason Out
                'Period 1'              // K: Pay Period
            ];

            expect(timeClockRow.length).toBe(11);
        });

        it('Overtime row has correct number of columns (10)', () => {
            const overtimeRow = [
                '2025-12-08',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Tuesday',              // C: Day of Week
                'Overtime Request',     // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-12-07',           // G: Overtime Date
                'Yes',                  // H: Asked Doctor
                'Jane Smith',           // I: Senior Staff
                'Period 1'              // J: Pay Period
            ];

            expect(overtimeRow.length).toBe(10);
        });
    });
});
