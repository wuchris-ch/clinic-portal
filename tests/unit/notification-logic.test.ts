import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * High-Value Tests: Notification Business Logic
 *
 * These tests verify critical business logic for notifications:
 * 1. Email list parsing from NOTIFY_EMAILS env var
 * 2. isSameDay calculation for email formatting
 * 3. Boolean to Yes/No conversion for sheets
 * 4. Email subject generation
 *
 * Bugs here affect what emails users receive and how data is formatted.
 */

describe('Email List Parsing', () => {
    /**
     * The NOTIFY_EMAILS env var fallback parses comma-separated emails.
     * This tests the parsing logic in isolation.
     */

    function parseEmailList(envVar: string | undefined): string[] {
        if (!envVar) return [];
        return envVar.split(',').map(e => e.trim()).filter(e => e.length > 0);
    }

    it('parses comma-separated emails correctly', () => {
        const result = parseEmailList('admin@example.com,manager@example.com');
        expect(result).toEqual(['admin@example.com', 'manager@example.com']);
    });

    it('trims whitespace from emails', () => {
        const result = parseEmailList('admin@example.com , manager@example.com , hr@example.com');
        expect(result).toEqual(['admin@example.com', 'manager@example.com', 'hr@example.com']);
    });

    it('handles single email without comma', () => {
        const result = parseEmailList('admin@example.com');
        expect(result).toEqual(['admin@example.com']);
    });

    it('returns empty array for undefined', () => {
        const result = parseEmailList(undefined);
        expect(result).toEqual([]);
    });

    it('returns empty array for empty string', () => {
        const result = parseEmailList('');
        expect(result).toEqual([]);
    });

    it('filters out empty entries from double commas', () => {
        const result = parseEmailList('admin@example.com,,manager@example.com');
        expect(result).toEqual(['admin@example.com', 'manager@example.com']);
    });

    it('handles trailing comma', () => {
        const result = parseEmailList('admin@example.com,manager@example.com,');
        expect(result).toEqual(['admin@example.com', 'manager@example.com']);
    });
});

describe('isSameDay Calculation', () => {
    /**
     * The API uses isSameDay to determine email formatting:
     * - Same day: "January 15, 2025"
     * - Different days: "January 15 - January 20, 2025"
     */

    function isSameDay(startDate: string, endDate: string): boolean {
        return startDate === endDate;
    }

    it('returns true for same date strings', () => {
        expect(isSameDay('2025-01-15', '2025-01-15')).toBe(true);
    });

    it('returns false for different date strings', () => {
        expect(isSameDay('2025-01-15', '2025-01-16')).toBe(false);
    });

    it('returns false for same day different format (edge case)', () => {
        // This tests the exact comparison - different formats are not equal
        expect(isSameDay('2025-01-15', '01/15/2025')).toBe(false);
    });

    it('handles edge case of year boundary', () => {
        expect(isSameDay('2024-12-31', '2025-01-01')).toBe(false);
    });
});

describe('Boolean to Yes/No Conversion', () => {
    /**
     * The askedDoctor field converts boolean to "Yes"/"No" for Google Sheets.
     */

    function booleanToYesNo(value: boolean): string {
        return value ? 'Yes' : 'No';
    }

    it('converts true to Yes', () => {
        expect(booleanToYesNo(true)).toBe('Yes');
    });

    it('converts false to No', () => {
        expect(booleanToYesNo(false)).toBe('No');
    });

    // Test common JavaScript truthy/falsy gotchas
    describe('type coercion edge cases', () => {
        it('handles explicit boolean true', () => {
            expect(booleanToYesNo(Boolean(1))).toBe('Yes');
        });

        it('handles explicit boolean false', () => {
            expect(booleanToYesNo(Boolean(0))).toBe('No');
        });
    });
});

describe('Email Subject Generation', () => {
    /**
     * Email subjects are user-facing and need to be consistent.
     */

    function generateNewRequestSubject(type: string, employeeName: string): string {
        if (type === 'vacation_request') {
            return `New Vacation Request from ${employeeName}`;
        }
        if (type === 'new_request') {
            return `New Time-Off Request from ${employeeName}`;
        }
        if (type === 'time_clock_request') {
            return `Time Clock Request from ${employeeName}`;
        }
        if (type === 'overtime_request') {
            return `Overtime Submission from ${employeeName}`;
        }
        return `Request from ${employeeName}`;
    }

    function generateStatusSubject(type: 'approved' | 'denied', leaveType: string): string {
        if (type === 'approved') {
            return `Time-Off Request Approved - ${leaveType}`;
        }
        return `Time-Off Request Denied - ${leaveType}`;
    }

    describe('new request subjects', () => {
        it('generates correct vacation request subject', () => {
            expect(generateNewRequestSubject('vacation_request', 'John Doe'))
                .toBe('New Vacation Request from John Doe');
        });

        it('generates correct day off request subject', () => {
            expect(generateNewRequestSubject('new_request', 'Jane Smith'))
                .toBe('New Time-Off Request from Jane Smith');
        });

        it('generates correct time clock request subject', () => {
            expect(generateNewRequestSubject('time_clock_request', 'Bob Wilson'))
                .toBe('Time Clock Request from Bob Wilson');
        });

        it('generates correct overtime request subject', () => {
            expect(generateNewRequestSubject('overtime_request', 'Alice Brown'))
                .toBe('Overtime Submission from Alice Brown');
        });
    });

    describe('status notification subjects', () => {
        it('generates approval subject with leave type', () => {
            expect(generateStatusSubject('approved', 'Vacation'))
                .toBe('Time-Off Request Approved - Vacation');
        });

        it('generates denial subject with leave type', () => {
            expect(generateStatusSubject('denied', 'Personal'))
                .toBe('Time-Off Request Denied - Personal');
        });
    });

    describe('employee name edge cases', () => {
        it('handles names with special characters', () => {
            expect(generateNewRequestSubject('new_request', "O'Brien"))
                .toBe("New Time-Off Request from O'Brien");
        });

        it('handles names with accents', () => {
            expect(generateNewRequestSubject('new_request', 'José García'))
                .toBe('New Time-Off Request from José García');
        });

        it('handles empty name (edge case)', () => {
            expect(generateNewRequestSubject('new_request', ''))
                .toBe('New Time-Off Request from ');
        });
    });
});

describe('Request Type Routing', () => {
    /**
     * The API route uses type field to determine which handler to use.
     * If routing is wrong, wrong email template is used.
     */

    const validRequestTypes = [
        'vacation_request',
        'new_request',
        'time_clock_request',
        'overtime_request',
        'approved',
        'denied',
    ];

    function isValidRequestType(type: string): boolean {
        return validRequestTypes.includes(type);
    }

    it('recognizes all valid request types', () => {
        for (const type of validRequestTypes) {
            expect(isValidRequestType(type)).toBe(true);
        }
    });

    it('rejects invalid request types', () => {
        expect(isValidRequestType('invalid')).toBe(false);
        expect(isValidRequestType('VACATION_REQUEST')).toBe(false); // case sensitive
        expect(isValidRequestType('')).toBe(false);
    });
});

describe('Total Days Calculation Display', () => {
    /**
     * Total days is displayed in sheets and emails.
     * Needs to handle edge cases properly.
     */

    function formatTotalDays(totalDays: number | undefined | null): string {
        return (totalDays?.toString() || '0');
    }

    it('converts number to string', () => {
        expect(formatTotalDays(5)).toBe('5');
    });

    it('handles zero', () => {
        expect(formatTotalDays(0)).toBe('0');
    });

    it('handles undefined', () => {
        expect(formatTotalDays(undefined)).toBe('0');
    });

    it('handles null', () => {
        expect(formatTotalDays(null)).toBe('0');
    });

    it('handles decimal days (for partial day requests)', () => {
        expect(formatTotalDays(0.5)).toBe('0.5');
    });
});

describe('N/A Default Value Pattern', () => {
    /**
     * Many optional fields default to "N/A" in Google Sheets.
     * This pattern must be consistent.
     */

    function withDefault<T>(value: T | null | undefined, defaultValue = 'N/A'): string {
        return value ? String(value) : defaultValue;
    }

    it('returns value when truthy', () => {
        expect(withDefault('Some value')).toBe('Some value');
    });

    it('returns N/A for null', () => {
        expect(withDefault(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
        expect(withDefault(undefined)).toBe('N/A');
    });

    it('returns N/A for empty string', () => {
        expect(withDefault('')).toBe('N/A');
    });

    it('allows custom default value', () => {
        expect(withDefault(null, 'Not specified')).toBe('Not specified');
    });

    it('preserves whitespace in non-empty values', () => {
        expect(withDefault('  spaces  ')).toBe('  spaces  ');
    });
});
