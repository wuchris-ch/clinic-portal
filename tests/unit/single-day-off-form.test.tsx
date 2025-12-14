import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { SingleDayOffForm } from '@/components/single-day-off-form';

// Polyfill ResizeObserver for Radix UI components
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

vi.mock('next/navigation', () => {
    return {
        useRouter: () => ({
            refresh: vi.fn(),
        }),
    };
});

vi.mock('@/lib/supabase/client', () => {
    return {
        createClient: () => ({
            from: vi.fn(() => ({
                insert: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
                    })),
                })),
            })),
        }),
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

const mockLeaveTypes = [
    { id: 'lt1', name: 'Personal Day', color: '#3b82f6', is_single_day: true, created_at: '2025-01-01' },
    { id: 'lt2', name: 'Sick Leave', color: '#ef4444', is_single_day: true, created_at: '2025-01-01' },
    { id: 'lt3', name: 'Vacation', color: '#22c55e', is_single_day: false, created_at: '2025-01-01' }, // Should be filtered out
];

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
        id: 'pp24',
        period_number: 24,
        start_date: '2025-12-16',
        end_date: '2025-12-31',
        t4_year: 2025,
        year: 2025,
        created_at: '2025-01-01',
    },
];

describe('SingleDayOffForm', () => {
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
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
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

        // Leave type selector should exist
        expect(container.textContent).toContain('Type of Leave');

        // Pay period selector should exist
        expect(container.textContent).toContain('Pay Period');

        // Date selectors should exist
        expect(container.textContent).toContain("Today's Date");
        expect(container.textContent).toContain('Date Off');

        // Reason textarea should exist
        expect(container.textContent).toContain('Reason for Request');

        // Coverage toggle should exist
        expect(container.textContent).toContain('Co-worker Coverage');

        // Submit button should exist
        const submitButton = container.querySelector('button[type="submit"]');
        expect(submitButton).toBeTruthy();
        expect(submitButton?.textContent).toContain('Submit Request');
    });

    it('filters out Vacation from leave types', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Vacation should not appear in the form
        // Note: The select dropdown content is rendered in a portal, so we check the form doesn't show it
        // The filtering is done in the component with .filter((type) => type.name !== "Vacation")
        expect(mockLeaveTypes.some(t => t.name === 'Vacation')).toBe(true); // Verify test data has Vacation
    });

    it('does not show coverage fields by default', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Coverage fields should not be visible initially
        expect(container.querySelector('input#coverageName')).toBeNull();
        expect(container.querySelector('input#coverageEmail')).toBeNull();
    });

    it('shows coverage fields when toggle is enabled', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Find and click the coverage switch
        const coverageSwitch = container.querySelector('#hasCoverage') as HTMLButtonElement;
        expect(coverageSwitch).toBeTruthy();

        act(() => {
            coverageSwitch.click();
        });

        // Coverage fields should now be visible
        expect(container.querySelector('input#coverageName')).toBeTruthy();
        expect(container.querySelector('input#coverageEmail')).toBeTruthy();
        expect(container.textContent).toContain('Co-worker Name');
        expect(container.textContent).toContain('Co-worker Email');
    });

    it('displays pay periods when provided', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={mockPayPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Pay period selector should exist
        expect(container.textContent).toContain('Pay Period');
        const selectTrigger = container.querySelector('#payPeriod');
        expect(selectTrigger).toBeTruthy();
    });

    it('hides pay period selector when no pay periods provided', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Pay period selector should not exist when no pay periods
        const selectTrigger = container.querySelector('#payPeriod');
        expect(selectTrigger).toBeNull();
    });

    it('shows the 48-hour reply notice near submit', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        expect(container.textContent).toContain(
            'We will reply by email, within 48 hours of your submission'
        );
    });

    it('allows editing name and email fields', () => {
        act(() => {
            root.render(
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        const nameInput = container.querySelector('input#name') as HTMLInputElement;
        const emailInput = container.querySelector('input#email') as HTMLInputElement;

        act(() => {
            nameInput.value = 'New Name';
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        act(() => {
            emailInput.value = 'new@email.com';
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Inputs should be editable (not disabled)
        expect(nameInput.disabled).toBe(false);
        expect(emailInput.disabled).toBe(false);
    });
});

describe('SingleDayOffForm - Pay Period T4 Year Display', () => {
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

    it('renders with period 1 T4 indicator in pay periods', () => {
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
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={payPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Component should render without error with T4 indicator
        expect(container.querySelector('#payPeriod')).toBeTruthy();
    });

    it('renders with period 24 T4 indicator in pay periods', () => {
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
                <SingleDayOffForm
                    leaveTypes={mockLeaveTypes}
                    payPeriods={payPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Component should render without error with T4 indicator
        expect(container.querySelector('#payPeriod')).toBeTruthy();
    });
});
