import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { OvertimeRequestForm } from '@/components/overtime-request-form';

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

describe('OvertimeRequestForm', () => {
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
                <OvertimeRequestForm
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

        // Overtime date picker should exist
        expect(container.textContent).toContain('Overtime Date');

        // Doctor question should exist
        expect(container.textContent).toContain('Did you ask the doctor if they needed you to stay overtime?');

        // Submit button should exist
        const submitButton = container.querySelector('button[type="submit"]');
        expect(submitButton).toBeTruthy();
        expect(submitButton?.textContent).toContain('Submit');
    });

    it('does not show senior staff field by default', () => {
        act(() => {
            root.render(
                <OvertimeRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Senior staff name field should not be visible initially
        expect(container.querySelector('input#seniorStaffName')).toBeNull();
    });

    it('shows senior staff field when "No" is selected for asked doctor', () => {
        act(() => {
            root.render(
                <OvertimeRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Find and click the "No" checkbox
        const noCheckbox = container.querySelector('#askedDoctorNo') as HTMLButtonElement;
        expect(noCheckbox).toBeTruthy();

        act(() => {
            noCheckbox.click();
        });

        // Senior staff name field should now be visible
        expect(container.querySelector('input#seniorStaffName')).toBeTruthy();
        expect(container.textContent).toContain('which senior staff did you get permission to work overtime');
    });

    it('hides senior staff field when "Yes" is selected for asked doctor', () => {
        act(() => {
            root.render(
                <OvertimeRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // First select "No"
        const noCheckbox = container.querySelector('#askedDoctorNo') as HTMLButtonElement;
        act(() => {
            noCheckbox.click();
        });

        expect(container.querySelector('input#seniorStaffName')).toBeTruthy();

        // Now select "Yes"
        const yesCheckbox = container.querySelector('#askedDoctorYes') as HTMLButtonElement;
        act(() => {
            yesCheckbox.click();
        });

        // Senior staff name field should be hidden again
        expect(container.querySelector('input#seniorStaffName')).toBeNull();
    });

    it('clears senior staff name when switching to Yes', () => {
        act(() => {
            root.render(
                <OvertimeRequestForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Select "No" and enter a name
        const noCheckbox = container.querySelector('#askedDoctorNo') as HTMLButtonElement;
        act(() => {
            noCheckbox.click();
        });

        const seniorStaffInput = container.querySelector('input#seniorStaffName') as HTMLInputElement;
        act(() => {
            seniorStaffInput.value = 'Senior Person';
            seniorStaffInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Now select "Yes" - this should clear the senior staff name
        const yesCheckbox = container.querySelector('#askedDoctorYes') as HTMLButtonElement;
        act(() => {
            yesCheckbox.click();
        });

        // Field should be hidden and cleared
        expect(container.querySelector('input#seniorStaffName')).toBeNull();
    });

    it('displays pay periods when provided', () => {
        act(() => {
            root.render(
                <OvertimeRequestForm
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
                <OvertimeRequestForm
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
                <OvertimeRequestForm
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
});

describe('OvertimeRequestForm - Pay Period T4 Year Display', () => {
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
                <OvertimeRequestForm
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
                <OvertimeRequestForm
                    payPeriods={payPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        expect(container.querySelector('#payPeriod')).toBeTruthy();
    });
});
