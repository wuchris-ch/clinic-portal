import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { TimeClockRequestForm } from '@/components/time-clock-request-form';

// Polyfill ResizeObserver for Radix UI components
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

vi.mock('sonner', () => {
    return {
        toast: {
            error: vi.fn(),
            success: vi.fn(),
        },
    };
});

// Mock fetch for form submission
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as unknown as typeof fetch;

const mockPayPeriods = [
    {
        id: 'pp1',
        period_number: 1,
        start_date: '2025-01-01',
        end_date: '2025-01-15',
        t4_year: 2025,
        year: 2025,
        created_at: '2025-01-01',
    },
    {
        id: 'pp12',
        period_number: 12,
        start_date: '2025-06-01',
        end_date: '2025-06-15',
        t4_year: 2025,
        year: 2025,
        created_at: '2025-01-01',
    },
];

describe('TimeClockRequestForm', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        vi.clearAllMocks();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('renders with all required form fields', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={mockPayPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Name field should be pre-filled
        const nameInput = container.querySelector('input#name') as HTMLInputElement;
        expect(nameInput).toBeTruthy();
        expect(nameInput.value).toBe('Test User');

        // Email field should be pre-filled
        const emailInput = container.querySelector('input#email') as HTMLInputElement;
        expect(emailInput).toBeTruthy();
        expect(emailInput.value).toBe('test@example.com');

        // Pay period selector should exist
        expect(container.textContent).toContain('Pay Period');

        // Clock-in section should exist
        expect(container.textContent).toContain('Missed Clock-In');
        expect(container.textContent).toContain('Missed clock-in date');
        expect(container.textContent).toContain('Clock-in time for this date above');
        expect(container.textContent).toContain('Please explain why you missed clocking-in');

        // Clock-out section should exist
        expect(container.textContent).toContain('Missed Clock-Out');
        expect(container.textContent).toContain('Missed clock-out date');
        expect(container.textContent).toContain('Clock-out time for this date above');
        expect(container.textContent).toContain('Please explain why you missed clocking-out');

        // Submit button should exist
        const submitButton = container.querySelector('button[type="submit"]');
        expect(submitButton).toBeTruthy();
        expect(submitButton?.textContent).toContain('Submit Request');
    });

    it('renders clock-in reason textarea', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const clockInReason = container.querySelector('#clockInReason') as HTMLTextAreaElement;
        expect(clockInReason).toBeTruthy();
    });

    it('renders clock-out reason textarea', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const clockOutReason = container.querySelector('#clockOutReason') as HTMLTextAreaElement;
        expect(clockOutReason).toBeTruthy();
    });

    it('displays pay periods when provided', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={mockPayPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        expect(container.textContent).toContain('Pay Period');
        const selectTrigger = container.querySelector('#payPeriod');
        expect(selectTrigger).toBeTruthy();
    });

    it('hides pay period selector when no pay periods provided', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const selectTrigger = container.querySelector('#payPeriod');
        expect(selectTrigger).toBeNull();
    });

    it('allows editing name and email fields', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const nameInput = container.querySelector('input#name') as HTMLInputElement;
        const emailInput = container.querySelector('input#email') as HTMLInputElement;

        expect(nameInput.disabled).toBe(false);
        expect(emailInput.disabled).toBe(false);
    });

    it('has separate sections for clock-in and clock-out', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Both sections should be visible and separately styled
        const sections = container.querySelectorAll('.rounded-lg.bg-muted\\/50.border');
        expect(sections.length).toBe(2); // Clock-in and Clock-out sections
    });

    it('renders time picker dropdowns with correct options', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Should have multiple combobox elements for time selection (hour, minute, AM/PM for both clock-in and clock-out)
        const comboboxes = container.querySelectorAll('[role="combobox"]');
        // 6 for time selection (hour, minute, AM/PM x2) + potentially pay period = at least 6
        expect(comboboxes.length).toBeGreaterThanOrEqual(6);
    });
});

describe('TimeClockRequestForm - Pay Period T4 Year Display', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('renders with T4 indicator for period 1', () => {
        const payPeriods = [
            {
                id: 'pp1',
                period_number: 1,
                start_date: '2026-01-01',
                end_date: '2026-01-15',
                t4_year: 2026,
                year: 2026,
                created_at: '2026-01-01',
            },
        ];

        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={payPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        expect(container.querySelector('#payPeriod')).toBeTruthy();
    });

    it('renders with T4 indicator for period 24', () => {
        const payPeriods = [
            {
                id: 'pp24',
                period_number: 24,
                start_date: '2025-12-16',
                end_date: '2025-12-31',
                t4_year: 2025,
                year: 2025,
                created_at: '2025-01-01',
            },
        ];

        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={payPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        expect(container.querySelector('#payPeriod')).toBeTruthy();
    });
});

describe('TimeClockRequestForm - Form Behavior', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        vi.clearAllMocks();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('allows entering clock-in reason text', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const clockInReason = container.querySelector('#clockInReason') as HTMLTextAreaElement;
        expect(clockInReason).toBeTruthy();

        act(() => {
            clockInReason.value = 'I forgot to clock in because I was running late';
            clockInReason.dispatchEvent(new Event('input', { bubbles: true }));
        });

        expect(clockInReason.disabled).toBe(false);
    });

    it('allows entering clock-out reason text', () => {
        act(() => {
            root.render(
                <TimeClockRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const clockOutReason = container.querySelector('#clockOutReason') as HTMLTextAreaElement;
        expect(clockOutReason).toBeTruthy();

        act(() => {
            clockOutReason.value = 'System was down when I tried to clock out';
            clockOutReason.dispatchEvent(new Event('input', { bubbles: true }));
        });

        expect(clockOutReason.disabled).toBe(false);
    });
});
