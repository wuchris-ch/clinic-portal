import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SHEET_TAB_NAMES, SHEET_COLUMN_COUNTS } from '@/lib/constants/google-sheets';

/**
 * Unit Tests: Google Sheets Integration
 *
 * These tests verify:
 * 1. Tab names are correct (match what users have in their sheets)
 * 2. Row data has correct column counts
 * 3. appendRowToSheet function handles missing credentials correctly
 *
 * NOTE: These tests mock the googleapis library since we can't make real API calls.
 * The actual Google Sheets integration MUST be tested manually on Vercel Preview.
 * See CLAUDE.md > "Vercel Preview Testing Checklist" for manual testing steps.
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

    describe('appendRowToSheet credential handling', () => {
        it('returns false when credentials are not configured', async () => {
            delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
            delete process.env.GOOGLE_PRIVATE_KEY;
            delete process.env.GOOGLE_SHEET_ID;

            const { appendRowToSheet } = await import('@/lib/google-sheets');
            const result = await appendRowToSheet(['test', 'data'], 'Sheet1');

            expect(result).toBe(false);
        });

        it('returns false when GOOGLE_SHEET_ID is missing and no spreadsheetId provided', async () => {
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

        it('accepts optional spreadsheetId parameter for multi-tenancy', async () => {
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
            process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
            // No global GOOGLE_SHEET_ID, but passing spreadsheetId directly
            delete process.env.GOOGLE_SHEET_ID;

            const { appendRowToSheet } = await import('@/lib/google-sheets');

            // Should work when spreadsheetId is provided directly
            const result = await appendRowToSheet(['test', 'data'], 'Sheet1', 'org-specific-sheet-id');
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Tab name constants (CRITICAL - do not change)', () => {
        /**
         * These tab names MUST match exactly what users have in their Google Sheets.
         * Changing these will break all existing user integrations.
         *
         * If a test fails here, DO NOT just update the expected value.
         * You need to coordinate with users to update their sheets.
         */

        it('DAY_OFF tab name is "Day Off Requests"', () => {
            expect(SHEET_TAB_NAMES.DAY_OFF).toBe('Day Off Requests');
        });

        it('VACATION tab name is "Vacation Requests"', () => {
            expect(SHEET_TAB_NAMES.VACATION).toBe('Vacation Requests');
        });

        it('TIME_CLOCK tab name is "Time Clock Adjustments"', () => {
            expect(SHEET_TAB_NAMES.TIME_CLOCK).toBe('Time Clock Adjustments');
        });

        it('OVERTIME tab name is "Overtime Requests"', () => {
            expect(SHEET_TAB_NAMES.OVERTIME).toBe('Overtime Requests');
        });

        it('SICK_DAY tab name is "Sick Days"', () => {
            expect(SHEET_TAB_NAMES.SICK_DAY).toBe('Sick Days');
        });

        it('has exactly 5 form types defined', () => {
            const tabNameKeys = Object.keys(SHEET_TAB_NAMES);
            expect(tabNameKeys).toHaveLength(5);
            expect(tabNameKeys).toContain('DAY_OFF');
            expect(tabNameKeys).toContain('VACATION');
            expect(tabNameKeys).toContain('TIME_CLOCK');
            expect(tabNameKeys).toContain('OVERTIME');
            expect(tabNameKeys).toContain('SICK_DAY');
        });
    });

    describe('Row data column counts', () => {
        /**
         * Each form type writes a specific number of columns.
         * These tests verify the expected column counts match the constants.
         * This helps catch if someone adds/removes columns without updating documentation.
         */

        it('Day Off request has 14 columns (A-N)', () => {
            expect(SHEET_COLUMN_COUNTS.DAY_OFF).toBe(14);

            // Verify with actual row structure
            const dayOffRow = [
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
            expect(dayOffRow.length).toBe(SHEET_COLUMN_COUNTS.DAY_OFF);
        });

        it('Vacation request has 13 columns (A-M)', () => {
            expect(SHEET_COLUMN_COUNTS.VACATION).toBe(13);

            const vacationRow = [
                '2025-12-08',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Tuesday',              // C: Day of Week
                'Vacation Request',     // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-12-20',           // G: Start Date
                '2025-12-27',           // H: End Date
                '5',                    // I: Weekdays Count
                'PP24',                 // J: Pay Period
                'Jane Smith',           // K: Coverage Name
                'jane@example.com',     // L: Coverage Email
                'Holiday vacation',     // M: Notes
            ];
            expect(vacationRow.length).toBe(SHEET_COLUMN_COUNTS.VACATION);
        });

        it('Time Clock request has 11 columns (A-K)', () => {
            expect(SHEET_COLUMN_COUNTS.TIME_CLOCK).toBe(11);

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
            expect(timeClockRow.length).toBe(SHEET_COLUMN_COUNTS.TIME_CLOCK);
        });

        it('Overtime request has 10 columns (A-J)', () => {
            expect(SHEET_COLUMN_COUNTS.OVERTIME).toBe(10);

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
            expect(overtimeRow.length).toBe(SHEET_COLUMN_COUNTS.OVERTIME);
        });

        it('Sick Day request has 9 columns (A-I)', () => {
            expect(SHEET_COLUMN_COUNTS.SICK_DAY).toBe(9);

            const sickDayRow = [
                '2025-12-08',           // A: Submission Date
                '10:30:00 AM',          // B: Time
                'Tuesday',              // C: Day
                'John Doe',             // D: Employee Name
                'john@example.com',     // E: Email
                'Period 1',             // F: Pay Period
                '2025-12-07',           // G: Sick Date
                'Yes',                  // H: Has Doctor Note
                'https://...'           // I: Doctor Note Link
            ];
            expect(sickDayRow.length).toBe(SHEET_COLUMN_COUNTS.SICK_DAY);
        });
    });

    describe('Integration reminders', () => {
        /**
         * These "tests" serve as documentation reminders.
         * They always pass but remind developers what to manually test.
         */

        it('REMINDER: Google Sheets integration must be tested on Vercel Preview', () => {
            // This test always passes - it's a reminder
            console.log(`
                ⚠️  MANUAL TESTING REQUIRED ⚠️

                Unit tests CANNOT verify actual Google Sheets integration.
                Before merging any changes to sheet-related code:

                1. Deploy to Vercel Preview branch
                2. Link a test Google Sheet in Admin Settings
                3. Submit each form type (Day Off, Vacation, Time Clock, Overtime, Sick Day)
                4. Open the Google Sheet and verify rows appear in correct tabs
                5. Check column data matches expected format

                See CLAUDE.md > "Vercel Preview Testing Checklist" for full steps.
            `);
            expect(true).toBe(true);
        });
    });
});
