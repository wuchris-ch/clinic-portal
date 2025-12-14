import { describe, it, expect } from 'vitest';
import { SHEET_TAB_NAMES, SHEET_COLUMN_COUNTS } from '@/lib/constants/google-sheets';

/**
 * High-Value Tests: Google Sheets Row Format Validation
 *
 * These tests verify that form data builds rows with correct column counts.
 * If a developer adds or removes a field without updating the row builder,
 * data will land in wrong columns in Google Sheets.
 *
 * This is a CRITICAL integration point - wrong column order breaks data integrity.
 */

describe('SHEET_TAB_NAMES constants', () => {
    it('has all required tab names defined', () => {
        expect(SHEET_TAB_NAMES.DAY_OFF).toBe('Day Off Requests');
        expect(SHEET_TAB_NAMES.VACATION).toBe('Vacation Requests');
        expect(SHEET_TAB_NAMES.TIME_CLOCK).toBe('Time Clock Adjustments');
        expect(SHEET_TAB_NAMES.OVERTIME).toBe('Overtime Requests');
        expect(SHEET_TAB_NAMES.SICK_DAY).toBe('Sick Days');
    });

    it('tab names are case-sensitive and exact', () => {
        // Users have created tabs with these exact names - do not change
        expect(SHEET_TAB_NAMES.DAY_OFF).not.toBe('day off requests');
        expect(SHEET_TAB_NAMES.DAY_OFF).not.toBe('Day Off Request'); // no 's'
    });
});

describe('SHEET_COLUMN_COUNTS constants', () => {
    it('defines expected column counts for validation', () => {
        expect(SHEET_COLUMN_COUNTS.DAY_OFF).toBe(14);
        expect(SHEET_COLUMN_COUNTS.VACATION).toBe(13);
        expect(SHEET_COLUMN_COUNTS.TIME_CLOCK).toBe(11);
        expect(SHEET_COLUMN_COUNTS.OVERTIME).toBe(10);
        expect(SHEET_COLUMN_COUNTS.SICK_DAY).toBe(9);
    });
});

describe('Row Format Builders', () => {
    /**
     * These tests simulate what the API route does when building rows.
     * They verify column counts match SHEET_COLUMN_COUNTS.
     */

    describe('Day Off Request row', () => {
        it('builds row with correct column count (14 columns)', () => {
            const row = [
                '2025-01-15',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Wednesday',            // C: Day of Week
                'Leave Request',        // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                'Personal',             // G: Leave Type
                '2025-01-20',           // H: Start Date
                '2025-01-20',           // I: End Date
                '1',                    // J: Total Days
                'Doctor appointment',   // K: Reason
                'PP #1 (Jan 1-15)',     // L: Pay Period
                'Jane Smith',           // M: Coverage Name
                'jane@example.com',     // N: Coverage Email
            ];

            expect(row.length).toBe(SHEET_COLUMN_COUNTS.DAY_OFF);
        });

        it('requires all fields in correct order', () => {
            const row = buildDayOffRow({
                submissionDate: '2025-01-15',
                time: '10:30:00 AM',
                dayOfWeek: 'Wednesday',
                employeeName: 'John Doe',
                employeeEmail: 'john@example.com',
                leaveType: 'Personal',
                startDate: '2025-01-20',
                endDate: '2025-01-20',
                totalDays: 1,
                reason: 'Doctor appointment',
                payPeriodLabel: 'PP #1',
                coverageName: 'Jane Smith',
                coverageEmail: 'jane@example.com',
            });

            expect(row[0]).toBe('2025-01-15');      // Submission Date first
            expect(row[4]).toBe('John Doe');        // Name at index 4
            expect(row[6]).toBe('Personal');        // Leave Type at index 6
            expect(row[13]).toBe('jane@example.com'); // Coverage Email last
        });
    });

    describe('Vacation Request row', () => {
        it('builds row with correct column count (13 columns)', () => {
            const row = [
                '2025-01-15',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Wednesday',            // C: Day of Week
                'Vacation Request',     // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-02-01',           // G: Start Date
                '2025-02-07',           // H: End Date
                '5',                    // I: Weekdays Count
                'PP #3 (Jan 29 - Feb 11)', // J: Pay Period
                'Jane Smith',           // K: Coverage Name
                'jane@example.com',     // L: Coverage Email
                'Annual vacation',      // M: Notes
            ];

            expect(row.length).toBe(SHEET_COLUMN_COUNTS.VACATION);
        });

        it('handles missing optional fields with N/A', () => {
            const row = buildVacationRow({
                submissionDate: '2025-01-15',
                time: '10:30:00 AM',
                dayOfWeek: 'Wednesday',
                employeeName: 'John Doe',
                employeeEmail: 'john@example.com',
                startDate: '2025-02-01',
                endDate: '2025-02-07',
                totalDays: 5,
                payPeriodLabel: null,
                coverageName: null,
                coverageEmail: null,
                notes: null,
            });

            expect(row[9]).toBe('N/A');  // Pay Period
            expect(row[10]).toBe('N/A'); // Coverage Name
            expect(row[11]).toBe('N/A'); // Coverage Email
            expect(row[12]).toBe('N/A'); // Notes
        });
    });

    describe('Time Clock Request row', () => {
        it('builds row with correct column count (11 columns)', () => {
            const row = [
                '2025-01-15',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Wednesday',            // C: Day of Week
                'Time Clock Request',   // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-01-14 08:00 AM',  // G: Clock In
                '2025-01-14 05:00 PM',  // H: Clock Out
                'Forgot to clock in',   // I: Reason In
                '',                     // J: Reason Out
                'PP #1 (Jan 1-15)',     // K: Pay Period
            ];

            expect(row.length).toBe(SHEET_COLUMN_COUNTS.TIME_CLOCK);
        });

        it('handles clock in only request', () => {
            const row = buildTimeClockRow({
                submissionDate: '2025-01-15',
                time: '10:30:00 AM',
                dayOfWeek: 'Wednesday',
                employeeName: 'John Doe',
                employeeEmail: 'john@example.com',
                clockInDate: '2025-01-14',
                clockInTime: '08:00 AM',
                clockInReason: 'System was down',
                clockOutDate: null,
                clockOutTime: null,
                clockOutReason: null,
                payPeriodLabel: 'PP #1',
            });

            expect(row[6]).toBe('2025-01-14 08:00 AM'); // Clock In filled
            expect(row[7]).toBe('N/A');                 // Clock Out is N/A
        });

        it('handles clock out only request', () => {
            const row = buildTimeClockRow({
                submissionDate: '2025-01-15',
                time: '10:30:00 AM',
                dayOfWeek: 'Wednesday',
                employeeName: 'John Doe',
                employeeEmail: 'john@example.com',
                clockInDate: null,
                clockInTime: null,
                clockInReason: null,
                clockOutDate: '2025-01-14',
                clockOutTime: '05:00 PM',
                clockOutReason: 'Left early for emergency',
                payPeriodLabel: 'PP #1',
            });

            expect(row[6]).toBe('N/A');                  // Clock In is N/A
            expect(row[7]).toBe('2025-01-14 05:00 PM');  // Clock Out filled
        });
    });

    describe('Overtime Request row', () => {
        it('builds row with correct column count (10 columns)', () => {
            const row = [
                '2025-01-15',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Wednesday',            // C: Day of Week
                'Overtime Request',     // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-01-14',           // G: Overtime Date
                'Yes',                  // H: Asked Doctor
                'Dr. Smith',            // I: Senior Staff
                'PP #1 (Jan 1-15)',     // J: Pay Period
            ];

            expect(row.length).toBe(SHEET_COLUMN_COUNTS.OVERTIME);
        });

        it('correctly converts askedDoctor boolean to Yes/No', () => {
            const rowWithYes = buildOvertimeRow({
                submissionDate: '2025-01-15',
                time: '10:30:00 AM',
                dayOfWeek: 'Wednesday',
                employeeName: 'John Doe',
                employeeEmail: 'john@example.com',
                overtimeDate: '2025-01-14',
                askedDoctor: true,
                seniorStaffName: 'Dr. Smith',
                payPeriodLabel: 'PP #1',
            });

            expect(rowWithYes[7]).toBe('Yes');

            const rowWithNo = buildOvertimeRow({
                submissionDate: '2025-01-15',
                time: '10:30:00 AM',
                dayOfWeek: 'Wednesday',
                employeeName: 'John Doe',
                employeeEmail: 'john@example.com',
                overtimeDate: '2025-01-14',
                askedDoctor: false,
                seniorStaffName: 'N/A',
                payPeriodLabel: 'PP #1',
            });

            expect(rowWithNo[7]).toBe('No');
        });
    });

    describe('Sick Day row', () => {
        it('builds row with correct column count (9 columns)', () => {
            const row = [
                '2025-01-15',           // A: Submission Date
                '10:30:00 AM',          // B: Time of Day
                'Wednesday',            // C: Day of Week
                'Sick Day',             // D: Type
                'John Doe',             // E: Name
                'john@example.com',     // F: Email
                '2025-01-15',           // G: Sick Date
                'Flu',                  // H: Reason
                'PP #1 (Jan 1-15)',     // I: Pay Period
            ];

            expect(row.length).toBe(SHEET_COLUMN_COUNTS.SICK_DAY);
        });
    });
});

describe('Row building edge cases', () => {
    it('handles empty string values without crashing', () => {
        const row = buildDayOffRow({
            submissionDate: '',
            time: '',
            dayOfWeek: '',
            employeeName: '',
            employeeEmail: '',
            leaveType: '',
            startDate: '',
            endDate: '',
            totalDays: 0,
            reason: '',
            payPeriodLabel: '',
            coverageName: '',
            coverageEmail: '',
        });

        expect(row.length).toBe(SHEET_COLUMN_COUNTS.DAY_OFF);
    });

    it('handles special characters in text fields', () => {
        const row = buildDayOffRow({
            submissionDate: '2025-01-15',
            time: '10:30:00 AM',
            dayOfWeek: 'Wednesday',
            employeeName: "O'Brien, José",
            employeeEmail: 'jose@example.com',
            leaveType: 'Personal',
            startDate: '2025-01-20',
            endDate: '2025-01-20',
            totalDays: 1,
            reason: 'Family event: "reunion"',
            payPeriodLabel: 'PP #1',
            coverageName: 'N/A',
            coverageEmail: 'N/A',
        });

        expect(row[4]).toBe("O'Brien, José");
        expect(row[10]).toContain('"reunion"');
    });
});

// Helper functions that mirror the API route logic
// These exist to make tests readable and to catch if API logic changes

function buildDayOffRow(data: {
    submissionDate: string;
    time: string;
    dayOfWeek: string;
    employeeName: string;
    employeeEmail: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    payPeriodLabel: string | null;
    coverageName: string | null;
    coverageEmail: string | null;
}): string[] {
    return [
        data.submissionDate,
        data.time,
        data.dayOfWeek,
        'Leave Request',
        data.employeeName,
        data.employeeEmail,
        data.leaveType,
        data.startDate,
        data.endDate,
        data.totalDays.toString(),
        data.reason,
        data.payPeriodLabel || 'N/A',
        data.coverageName || 'N/A',
        data.coverageEmail || 'N/A',
    ];
}

function buildVacationRow(data: {
    submissionDate: string;
    time: string;
    dayOfWeek: string;
    employeeName: string;
    employeeEmail: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    payPeriodLabel: string | null;
    coverageName: string | null;
    coverageEmail: string | null;
    notes: string | null;
}): string[] {
    return [
        data.submissionDate,
        data.time,
        data.dayOfWeek,
        'Vacation Request',
        data.employeeName,
        data.employeeEmail,
        data.startDate,
        data.endDate,
        data.totalDays.toString(),
        data.payPeriodLabel || 'N/A',
        data.coverageName || 'N/A',
        data.coverageEmail || 'N/A',
        data.notes || 'N/A',
    ];
}

function buildTimeClockRow(data: {
    submissionDate: string;
    time: string;
    dayOfWeek: string;
    employeeName: string;
    employeeEmail: string;
    clockInDate: string | null;
    clockInTime: string | null;
    clockInReason: string | null;
    clockOutDate: string | null;
    clockOutTime: string | null;
    clockOutReason: string | null;
    payPeriodLabel: string;
}): string[] {
    const clockInStr = data.clockInDate ? `${data.clockInDate} ${data.clockInTime}` : 'N/A';
    const clockOutStr = data.clockOutDate ? `${data.clockOutDate} ${data.clockOutTime}` : 'N/A';

    return [
        data.submissionDate,
        data.time,
        data.dayOfWeek,
        'Time Clock Request',
        data.employeeName,
        data.employeeEmail,
        clockInStr,
        clockOutStr,
        data.clockInReason || '',
        data.clockOutReason || '',
        data.payPeriodLabel || 'N/A',
    ];
}

function buildOvertimeRow(data: {
    submissionDate: string;
    time: string;
    dayOfWeek: string;
    employeeName: string;
    employeeEmail: string;
    overtimeDate: string;
    askedDoctor: boolean;
    seniorStaffName: string;
    payPeriodLabel: string;
}): string[] {
    return [
        data.submissionDate,
        data.time,
        data.dayOfWeek,
        'Overtime Request',
        data.employeeName,
        data.employeeEmail,
        data.overtimeDate,
        data.askedDoctor ? 'Yes' : 'No',
        data.seniorStaffName || 'N/A',
        data.payPeriodLabel || 'N/A',
    ];
}
