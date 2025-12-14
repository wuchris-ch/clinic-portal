import { describe, it, expect, vi, afterEach } from 'vitest';
import { getPSTDateTime, cn } from '@/lib/utils';

/**
 * High-Value Tests: Timezone Logic
 *
 * getPSTDateTime is CRITICAL - it determines timestamps for all form submissions.
 * If this breaks, data in Google Sheets will have wrong dates/times.
 *
 * These tests actually execute the function and verify correct behavior.
 */

describe('getPSTDateTime', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Date formatting', () => {
        it('returns date in yyyy-MM-dd format', () => {
            // Use a known date
            const testDate = new Date('2025-06-15T10:30:00Z');
            const result = getPSTDateTime(testDate);

            // Should be ISO date format
            expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('returns time in 12-hour format with AM/PM', () => {
            const testDate = new Date('2025-06-15T10:30:00Z');
            const result = getPSTDateTime(testDate);

            // Should have AM or PM
            expect(result.time).toMatch(/\d{2}:\d{2}:\d{2} (AM|PM)/);
        });

        it('returns full day name for dayOfWeek', () => {
            const testDate = new Date('2025-06-15T10:30:00Z'); // June 15, 2025 is a Sunday
            const result = getPSTDateTime(testDate);

            // Should be a full day name
            expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
                .toContain(result.dayOfWeek);
        });
    });

    describe('Default behavior', () => {
        it('uses current date when no argument provided', () => {
            const result = getPSTDateTime();

            // Result should be a valid date string
            expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(result.time).toBeTruthy();
            expect(result.dayOfWeek).toBeTruthy();
        });
    });

    describe('Pacific timezone conversion', () => {
        it('converts UTC midnight to previous day in PST during standard time', () => {
            // January 1, 2025 00:00:00 UTC is December 31, 2024 in PST (UTC-8)
            const utcMidnight = new Date('2025-01-01T00:00:00Z');
            const result = getPSTDateTime(utcMidnight);

            // In PST (UTC-8), this should be Dec 31, 2024
            expect(result.date).toBe('2024-12-31');
        });

        it('converts UTC noon to same day in PST', () => {
            // January 15, 2025 18:00:00 UTC = January 15, 2025 10:00 AM PST
            const utcNoon = new Date('2025-01-15T18:00:00Z');
            const result = getPSTDateTime(utcNoon);

            expect(result.date).toBe('2025-01-15');
        });
    });

    describe('Edge cases that could break production', () => {
        it('handles year boundary correctly', () => {
            // December 31, 2024 23:00:00 PST = January 1, 2025 07:00:00 UTC
            const newYearsEve = new Date('2025-01-01T07:00:00Z');
            const result = getPSTDateTime(newYearsEve);

            // Should still be Dec 31 in PST
            expect(result.date).toBe('2024-12-31');
        });

        it('handles month boundary correctly', () => {
            // February 1, 2025 05:00:00 UTC = January 31, 2025 21:00:00 PST
            const monthBoundary = new Date('2025-02-01T05:00:00Z');
            const result = getPSTDateTime(monthBoundary);

            expect(result.date).toBe('2025-01-31');
        });

        it('handles daylight saving time transition (spring forward)', () => {
            // March 9, 2025 10:00 UTC - after DST starts
            const afterDST = new Date('2025-03-09T10:00:00Z');
            const result = getPSTDateTime(afterDST);

            // Should return valid result (PDT is UTC-7)
            expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(result.time).toMatch(/\d{2}:\d{2}:\d{2} (AM|PM)/);
        });

        it('handles daylight saving time transition (fall back)', () => {
            // November 2, 2025 09:00 UTC - after DST ends
            const afterDSTEnd = new Date('2025-11-02T09:00:00Z');
            const result = getPSTDateTime(afterDSTEnd);

            // Should return valid result (PST is UTC-8)
            expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('returns consistent format regardless of input time', () => {
            const dates = [
                new Date('2025-01-01T00:00:00Z'),
                new Date('2025-06-15T12:00:00Z'),
                new Date('2025-12-31T23:59:59Z'),
            ];

            for (const date of dates) {
                const result = getPSTDateTime(date);

                // All should have same format
                expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
                expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
                    .toContain(result.dayOfWeek);
            }
        });
    });

    describe('Day of week accuracy', () => {
        it('correctly identifies Monday', () => {
            // January 6, 2025 is a Monday (use noon PST to avoid timezone edge)
            const monday = new Date('2025-01-06T20:00:00Z'); // Noon PST
            const result = getPSTDateTime(monday);

            expect(result.dayOfWeek).toBe('Monday');
        });

        it('correctly identifies Friday', () => {
            // January 10, 2025 is a Friday
            const friday = new Date('2025-01-10T20:00:00Z'); // Noon PST
            const result = getPSTDateTime(friday);

            expect(result.dayOfWeek).toBe('Friday');
        });

        it('correctly identifies weekend days', () => {
            // January 11, 2025 is a Saturday
            const saturday = new Date('2025-01-11T20:00:00Z');
            const result = getPSTDateTime(saturday);
            expect(result.dayOfWeek).toBe('Saturday');

            // January 12, 2025 is a Sunday
            const sunday = new Date('2025-01-12T20:00:00Z');
            const result2 = getPSTDateTime(sunday);
            expect(result2.dayOfWeek).toBe('Sunday');
        });
    });
});

describe('cn utility', () => {
    it('merges class names', () => {
        const result = cn('foo', 'bar');
        expect(result).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        const result = cn('base', true && 'active', false && 'disabled');
        expect(result).toBe('base active');
    });

    it('handles tailwind merge conflicts', () => {
        // twMerge should resolve p-4 vs p-2 conflict
        const result = cn('p-4', 'p-2');
        expect(result).toBe('p-2');
    });

    it('handles empty inputs', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('handles undefined and null', () => {
        const result = cn('foo', undefined, null, 'bar');
        expect(result).toBe('foo bar');
    });

    it('handles array inputs via clsx', () => {
        const result = cn(['foo', 'bar']);
        expect(result).toBe('foo bar');
    });

    it('handles object inputs via clsx', () => {
        const result = cn({ foo: true, bar: false, baz: true });
        expect(result).toBe('foo baz');
    });
});
