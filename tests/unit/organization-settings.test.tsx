import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { OrganizationSettings } from '@/components/admin/organization-settings';
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

describe('OrganizationSettings', () => {
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

    it('renders organization name and slug', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Test Clinic');
        expect(container.textContent).toContain('/test-clinic');
    });

    it('shows Connected status when sheet is linked', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Connected');
        expect(container.textContent).toContain('Open in Google Sheets');
    });

    it('shows warning when no sheet is linked', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganizationNoSheet} />
            );
        });

        expect(container.textContent).toContain('No Google Sheet Connected');
    });
});

describe('OrganizationSettings - Link Your Google Sheet Section', () => {
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

    it('renders Link your Google Sheet section', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Link your Google Sheet');
    });

    it('has desktop-visible styling on Link your Google Sheet summary', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        const summaries = container.querySelectorAll('summary');
        const linkSheetSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Link your Google Sheet')
        );

        expect(linkSheetSummary).toBeTruthy();
        // Check for desktop visibility classes
        expect(linkSheetSummary?.className).toContain('md:text-foreground');
        expect(linkSheetSummary?.className).toContain('md:font-medium');
    });

    it('shows step-by-step instructions when expanded', () => {
        act(() => {
            root.render(
                <OrganizationSettings
                    organization={mockOrganizationNoSheet}
                    serviceAccountEmail="service@test.iam.gserviceaccount.com"
                />
            );
        });

        // When no sheet is linked, the details should be open by default
        expect(container.textContent).toContain('Create a Google Sheet');
        expect(container.textContent).toContain('Share it with our system');
        expect(container.textContent).toContain('Paste the link below');
    });

    it('displays service account email when provided', () => {
        const serviceEmail = 'service@test.iam.gserviceaccount.com';

        act(() => {
            root.render(
                <OrganizationSettings
                    organization={mockOrganizationNoSheet}
                    serviceAccountEmail={serviceEmail}
                />
            );
        });

        expect(container.textContent).toContain(serviceEmail);
    });
});

describe('OrganizationSettings - Google Sheet Column Headers Section', () => {
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

    it('renders Google Sheet Column Headers section', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        expect(container.textContent).toContain('Google Sheet Column Headers');
    });

    it('has desktop-visible styling on Column Headers summary', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        expect(columnHeadersSummary).toBeTruthy();
        expect(columnHeadersSummary?.className).toContain('md:text-foreground');
        expect(columnHeadersSummary?.className).toContain('md:font-medium');
    });

    it('shows all five form types when expanded', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Click to expand the details
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        expect(container.textContent).toContain('Day Off Requests');
        expect(container.textContent).toContain('Time Clock Adjustments');
        expect(container.textContent).toContain('Overtime Requests');
        expect(container.textContent).toContain('Vacation Requests');
        expect(container.textContent).toContain('Sick Days');
    });

    it('shows tab names for each form type', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand the section
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        expect(container.textContent).toContain('Tab name: "Day Off Requests"');
        expect(container.textContent).toContain('Tab name: "Time Clock Adjustments"');
        expect(container.textContent).toContain('Tab name: "Overtime Requests"');
        expect(container.textContent).toContain('Tab name: "Vacation Requests"');
        expect(container.textContent).toContain('Tab name: "Sick Days"');
    });

    it('renders copy buttons for each form type', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand the section
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        // Find all Copy buttons (should be 5, one for each form type)
        const copyButtons = container.querySelectorAll('button');
        const copyButtonsArray = Array.from(copyButtons).filter(btn =>
            btn.textContent?.includes('Copy')
        );

        expect(copyButtonsArray.length).toBe(5);
    });

    it('shows helpful tip about pasting columns', () => {
        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand the section
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        expect(container.textContent).toContain('Tip:');
        expect(container.textContent).toContain('columns will auto-separate into cells');
        expect(container.textContent).toContain('tab names match exactly');
    });
});

describe('OrganizationSettings - Copy Functionality', () => {
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
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand the column headers section
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        // Find and click the first Copy button (Day Off Requests)
        const copyButtons = Array.from(container.querySelectorAll('button')).filter(btn =>
            btn.textContent?.includes('Copy') && !btn.textContent?.includes('Copied')
        );

        await act(async () => {
            copyButtons[0]?.click();
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
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand and click copy for Day Off Requests
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        // Find the Day Off Requests row and its copy button
        const rows = container.querySelectorAll('[class*="rounded-lg"]');
        const dayOffRow = Array.from(rows).find(row =>
            row.textContent?.includes('Day Off Requests') &&
            row.textContent?.includes('Tab name')
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
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand the section
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );

        act(() => {
            columnHeadersSummary?.click();
        });

        // Find the Sick Days row and click its copy button
        const rows = container.querySelectorAll('[class*="rounded-lg"]');
        const sickDaysRow = Array.from(rows).find(row =>
            row.textContent?.includes('Sick Days') &&
            row.textContent?.includes('Tab name')
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

describe('OrganizationSettings - Column Header Constants', () => {
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

    it.each(expectedFormTypes)('$label has correct tab name: $tabName', ({ label, tabName }) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        act(() => {
            root.render(
                <OrganizationSettings organization={mockOrganization} />
            );
        });

        // Expand the column headers section
        const summaries = container.querySelectorAll('summary');
        const columnHeadersSummary = Array.from(summaries).find(s =>
            s.textContent?.includes('Google Sheet Column Headers')
        );
        act(() => {
            columnHeadersSummary?.click();
        });

        expect(container.textContent).toContain(label);
        expect(container.textContent).toContain(`Tab name: "${tabName}"`);

        act(() => {
            root.unmount();
        });
        container.remove();
    });
});
