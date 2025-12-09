import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

/**
 * Unit Tests: Utility Functions
 * 
 * These tests verify that utility functions work correctly.
 */

describe('cn utility function', () => {
    it('merges class names correctly', () => {
        const result = cn('foo', 'bar');
        expect(result).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        const isActive = true;
        const result = cn('base', isActive && 'active');
        expect(result).toBe('base active');
    });

    it('filters out falsy values', () => {
        const result = cn('base', false && 'hidden', null, undefined, 'visible');
        expect(result).toBe('base visible');
    });

    it('handles empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('handles single class', () => {
        const result = cn('single');
        expect(result).toBe('single');
    });

    it('merges tailwind classes correctly with tailwind-merge', () => {
        // tailwind-merge should handle conflicting classes
        const result = cn('px-4', 'px-6');
        expect(result).toBe('px-6');
    });

    it('handles array of classes', () => {
        const result = cn(['foo', 'bar']);
        expect(result).toContain('foo');
        expect(result).toContain('bar');
    });

    it('handles object syntax from clsx', () => {
        const result = cn({
            'active': true,
            'disabled': false,
        });
        expect(result).toBe('active');
    });
});

describe('Date formatting utilities', () => {
    it('date-fns format function is available', async () => {
        const { format } = await import('date-fns');
        expect(typeof format).toBe('function');
    });

    it('can format dates correctly', async () => {
        const { format } = await import('date-fns');
        // Use explicit UTC date to avoid timezone issues
        const date = new Date(2025, 11, 8); // Month is 0-indexed, so 11 = December
        const formatted = format(date, 'yyyy-MM-dd');
        expect(formatted).toBe('2025-12-08');
    });

    it('can format dates for display', async () => {
        const { format } = await import('date-fns');
        // Use explicit date constructor to avoid timezone issues
        const date = new Date(2025, 11, 8); // December 8, 2025
        const formatted = format(date, 'MMMM d, yyyy');
        expect(formatted).toBe('December 8, 2025');
    });
});
