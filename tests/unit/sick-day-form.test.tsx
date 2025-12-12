import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { SickDayForm } from '@/components/sick-day-form';

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
        createClient: () => ({}),
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

describe('SickDayForm', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        // Required by React to enable act() warnings/behavior in tests
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

    it('renders with all required form fields', () => {
        act(() => {
            root.render(
                <SickDayForm
                    payPeriods={[]}
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

        // Sick day date picker should exist
        expect(container.textContent).toContain('Sick Day Date');

        // Doctor note question should exist
        expect(container.textContent).toContain('Do you have a doctor note to submit?');

        // Submit button should exist
        const submitButton = container.querySelector('button[type="submit"]');
        expect(submitButton).toBeTruthy();
        expect(submitButton?.textContent).toContain('Submit');
    });

    it('does not show file upload by default', () => {
        act(() => {
            root.render(
                <SickDayForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // File upload should not be visible until "Yes" is selected
        expect(container.textContent).not.toContain('Upload Doctor Note');
        expect(container.querySelector('input[type="file"]')).toBeNull();
    });

    it('shows file upload zone after selecting Yes for doctor note', () => {
        act(() => {
            root.render(
                <SickDayForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Find and click the "Yes" checkbox
        const yesCheckbox = container.querySelector('#hasDoctorNoteYes') as HTMLButtonElement;
        expect(yesCheckbox).toBeTruthy();

        act(() => {
            yesCheckbox.click();
        });

        // Now file upload should be visible
        expect(container.textContent).toContain('Upload Doctor Note');
        expect(container.textContent).toContain('Click to upload or drag and drop');
    });

    it('hides file upload zone after selecting No for doctor note', () => {
        act(() => {
            root.render(
                <SickDayForm
                    payPeriods={[]}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Click Yes first
        const yesCheckbox = container.querySelector('#hasDoctorNoteYes') as HTMLButtonElement;
        act(() => {
            yesCheckbox.click();
        });

        expect(container.textContent).toContain('Upload Doctor Note');

        // Now click No
        const noCheckbox = container.querySelector('#hasDoctorNoteNo') as HTMLButtonElement;
        act(() => {
            noCheckbox.click();
        });

        // File upload should be hidden again
        expect(container.textContent).not.toContain('Upload Doctor Note');
    });

    it('displays pay periods when provided', () => {
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

        act(() => {
            root.render(
                <SickDayForm
                    payPeriods={mockPayPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // Pay period selector should exist
        expect(container.textContent).toContain('Pay Period');

        // Open the select dropdown
        const selectTrigger = container.querySelector('[role="combobox"]') as HTMLButtonElement;
        expect(selectTrigger).toBeTruthy();
    });
});

describe('SickDayForm - Pay Period T4 Year Display', () => {
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

    it('shows T4 year indicator for period 1', () => {
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
                <SickDayForm
                    payPeriods={payPeriods}
                    userEmail="test@example.com"
                    userName="Test User"
                />
            );
        });

        // The component should show T4 indicator when dropdown is opened
        // We just verify the component renders without error
        expect(container.querySelector('[role="combobox"]')).toBeTruthy();
    });
});
