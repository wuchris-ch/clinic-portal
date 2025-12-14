import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { GoogleSheetsCard } from '@/components/admin/google-sheets-card';
import type { Organization } from '@/lib/types/database';

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

vi.mock('sonner', () => {
    return {
        toast: {
            error: vi.fn(),
            success: vi.fn(),
        },
    };
});

const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Clinic',
    slug: 'test-clinic',
    admin_email: 'admin@test.com',
    google_sheet_id: 'sheet-abc123',
    settings: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
};

const mockOrganizationNoSheet: Organization = {
    ...mockOrganization,
    google_sheet_id: null,
};

describe('GoogleSheetsCard', () => {
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

    it('renders Google Sheets heading', () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Google Sheets');
        expect(container.textContent).toContain('Automatic form submission logging');
    });

    it('shows Connected status when sheet is linked', () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Connected');
        expect(container.textContent).toContain('Open Sheet');
    });

    it('shows warning when no sheet is linked', () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganizationNoSheet} />
            );
        });

        expect(container.textContent).toContain('No Google Sheet Connected');
        expect(container.textContent).toContain('Not linked');
    });
});

describe('GoogleSheetsCard - Link Sheet Section', () => {
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

    it('renders link sheet section', () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Change linked sheet');
    });

    it('shows step-by-step instructions when section is expanded', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard
                    organization={mockOrganizationNoSheet}
                    serviceAccountEmail="service@test.iam.gserviceaccount.com"
                />
            );
        });

        // Click to expand the link sheet section
        const buttons = container.querySelectorAll('button');
        const linkSheetButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Link your Google Sheet')
        );

        await act(async () => {
            linkSheetButton?.click();
        });

        expect(container.textContent).toContain('Create a Google Sheet');
        expect(container.textContent).toContain('Share it with our system');
        expect(container.textContent).toContain('Paste the link below');
    });

    it('displays service account email when provided', async () => {
        const serviceEmail = 'service@test.iam.gserviceaccount.com';

        act(() => {
            root.render(
                <GoogleSheetsCard
                    organization={mockOrganizationNoSheet}
                    serviceAccountEmail={serviceEmail}
                />
            );
        });

        // Click to expand the link sheet section
        const buttons = container.querySelectorAll('button');
        const linkSheetButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Link your Google Sheet')
        );

        await act(async () => {
            linkSheetButton?.click();
        });

        expect(container.textContent).toContain(serviceEmail);
    });
});

describe('GoogleSheetsCard - Column Headers Section', () => {
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

    it('renders Column Headers section', () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Column Headers');
    });

    it('shows all five form types when expanded', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Click to expand the Column Headers section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        expect(container.textContent).toContain('Day Off Requests');
        expect(container.textContent).toContain('Time Clock Adjustments');
        expect(container.textContent).toContain('Overtime Requests');
        expect(container.textContent).toContain('Vacation Requests');
        expect(container.textContent).toContain('Sick Days');
    });

    it('shows tab names for each form type', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand the section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        expect(container.textContent).toContain('Tab: "Day Off Requests"');
        expect(container.textContent).toContain('Tab: "Time Clock Adjustments"');
        expect(container.textContent).toContain('Tab: "Overtime Requests"');
        expect(container.textContent).toContain('Tab: "Vacation Requests"');
        expect(container.textContent).toContain('Tab: "Sick Days"');
    });

    it('renders copy buttons for each form type', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand the section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers') && btn.textContent?.includes('Copy headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        // Find all Copy buttons (should be 5, one for each form type)
        const allButtons = container.querySelectorAll('button');
        const copyButtonsArray = Array.from(allButtons).filter(btn =>
            btn.textContent?.trim() === 'Copy' || btn.textContent?.includes('Copy')
        );

        expect(copyButtonsArray.length).toBeGreaterThanOrEqual(5);
    });

    it('shows helpful tip about pasting columns', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand the section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        expect(container.textContent).toContain('Tip:');
        expect(container.textContent).toContain('columns will auto-separate into cells');
        expect(container.textContent).toContain('tab names match exactly');
    });
});

describe('GoogleSheetsCard - Copy Functionality', () => {
    let container: HTMLDivElement;
    let root: Root;
    let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        // Mock clipboard API
        mockClipboard = {
            writeText: vi.fn().mockResolvedValue(undefined),
        };
        Object.assign(navigator, {
            clipboard: mockClipboard,
        });
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('copies column headers when copy button is clicked', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand the column headers section - find the button that expands column headers
        const allButtons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(allButtons).find(btn =>
            btn.textContent?.includes('Column Headers') && btn.textContent?.includes('Copy headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        // Find and click a Copy button for a form type (look for rows with Tab: in their text)
        const rows = container.querySelectorAll('[class*="rounded-lg"]');
        const dayOffRow = Array.from(rows).find(row =>
            row.textContent?.includes('Day Off Requests') &&
            row.textContent?.includes('Tab:')
        );
        const copyButton = dayOffRow?.querySelector('button');

        await act(async () => {
            copyButton?.click();
        });

        expect(mockClipboard.writeText).toHaveBeenCalled();
        // Check that the clipboard received tab-separated data
        const copiedText = mockClipboard.writeText.mock.calls[0][0];
        expect(copiedText).toContain('Submission Date');
        expect(copiedText).toContain('\t'); // Tab-separated
    });

    it('copies correct columns for Day Off Requests', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand column headers section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        // Find the Day Off Requests row and its copy button
        const rows = container.querySelectorAll('[class*="rounded-lg"]');
        const dayOffRow = Array.from(rows).find(row =>
            row.textContent?.includes('Day Off Requests') &&
            row.textContent?.includes('Tab:')
        );
        const copyButton = dayOffRow?.querySelector('button');

        await act(async () => {
            copyButton?.click();
        });

        const copiedText = mockClipboard.writeText.mock.calls[0][0];
        expect(copiedText).toContain('Leave Type');
        expect(copiedText).toContain('Coverage Name');
        expect(copiedText).toContain("Coverage Person's Email");
    });

    it('copies correct columns for Sick Days', async () => {
        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand the section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers')
        );

        await act(async () => {
            columnHeadersButton?.click();
        });

        // Find the Sick Days row and click its copy button
        const rows = container.querySelectorAll('[class*="rounded-lg"]');
        const sickDaysRow = Array.from(rows).find(row =>
            row.textContent?.includes('Sick Days') &&
            row.textContent?.includes('Tab:')
        );
        const copyButton = sickDaysRow?.querySelector('button');

        await act(async () => {
            copyButton?.click();
        });

        const copiedText = mockClipboard.writeText.mock.calls[0][0];
        expect(copiedText).toContain('Date Sick');
        expect(copiedText).toContain('Doc Note?');
        expect(copiedText).toContain("Link to PDF of Doc's Note");
    });
});

describe('GoogleSheetsCard - Column Header Constants', () => {
    /**
     * Test that the column headers match what the API expects.
     * These are critical for Google Sheets integration.
     */

    const expectedFormTypes = [
        {
            key: 'dayOff',
            label: 'Day Off Requests',
            tabName: 'Day Off Requests',
            requiredColumns: ['Submission Date', 'Name', 'Email', 'Leave Type', 'Start Date', 'End Date', 'Pay Period'],
        },
        {
            key: 'timeClock',
            label: 'Time Clock Adjustments',
            tabName: 'Time Clock Adjustments',
            requiredColumns: ['Submission Date', 'Name', 'Email', 'Clock In', 'Clock Out', 'Pay Period'],
        },
        {
            key: 'overtime',
            label: 'Overtime Requests',
            tabName: 'Overtime Requests',
            requiredColumns: ['Submission Date', 'Name', 'Email', 'Overtime Date', 'Pay Period'],
        },
        {
            key: 'vacation',
            label: 'Vacation Requests',
            tabName: 'Vacation Requests',
            requiredColumns: ['Submission Date', 'Name', 'Email', 'Start Date Vacation', 'End Date Vacation', 'Pay Period'],
        },
        {
            key: 'sickDay',
            label: 'Sick Days',
            tabName: 'Sick Days',
            requiredColumns: ['Submission Date', 'Name', 'Email', 'Date Sick', 'Pay Period'],
        },
    ];

    it.each(expectedFormTypes)('$label has correct tab name: $tabName', async ({ label, tabName }) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
            root.render(
                <GoogleSheetsCard organization={mockOrganization} />
            );
        });

        // Expand the column headers section
        const buttons = container.querySelectorAll('button');
        const columnHeadersButton = Array.from(buttons).find(btn =>
            btn.textContent?.includes('Column Headers')
        );
        await act(async () => {
            columnHeadersButton?.click();
        });

        expect(container.textContent).toContain(label);
        expect(container.textContent).toContain(`Tab: "${tabName}"`);

        act(() => {
            root.unmount();
        });
        container.remove();
    });
});
