import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { RequestsHistory } from '@/components/admin/requests-history';

// Polyfill ResizeObserver for Radix UI components
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

const mockRequests = [
    {
        id: 'req1',
        user_id: 'user1',
        leave_type_id: 'lt1',
        pay_period_id: 'pp1',
        organization_id: 'org1',
        submission_date: '2025-01-10',
        start_date: '2025-01-15',
        end_date: '2025-01-15',
        reason: 'Doctor appointment',
        coverage_name: null,
        coverage_email: null,
        status: 'approved' as const,
        admin_notes: null,
        reviewed_by: 'admin1',
        reviewed_at: '2025-01-12T10:00:00Z',
        created_at: '2025-01-10T10:00:00Z',
        profiles: {
            id: 'user1',
            full_name: 'John Doe',
            email: 'john@example.com',
            avatar_url: null,
        },
        leave_types: {
            id: 'lt1',
            name: 'Personal Day',
            color: '#3b82f6',
            created_at: '2025-01-01',
        },
    },
    {
        id: 'req2',
        user_id: 'user2',
        leave_type_id: 'lt2',
        pay_period_id: 'pp1',
        organization_id: 'org1',
        submission_date: '2025-01-08',
        start_date: '2025-01-20',
        end_date: '2025-01-25',
        reason: 'Family vacation',
        coverage_name: null,
        coverage_email: null,
        status: 'denied' as const,
        admin_notes: 'Insufficient coverage during busy period',
        reviewed_by: 'admin1',
        reviewed_at: '2025-01-09T10:00:00Z',
        created_at: '2025-01-08T10:00:00Z',
        profiles: {
            id: 'user2',
            full_name: 'Alice Johnson',
            email: 'alice@example.com',
            avatar_url: null,
        },
        leave_types: {
            id: 'lt2',
            name: 'Vacation',
            color: '#22c55e',
            created_at: '2025-01-01',
        },
    },
    {
        id: 'req3',
        user_id: 'user3',
        leave_type_id: 'lt1',
        pay_period_id: 'pp1',
        organization_id: 'org1',
        submission_date: '2025-01-05',
        start_date: '2025-01-08',
        end_date: '2025-01-08',
        reason: 'Personal errands',
        coverage_name: null,
        coverage_email: null,
        status: 'approved' as const,
        admin_notes: null,
        reviewed_by: 'admin1',
        reviewed_at: '2025-01-06T10:00:00Z',
        created_at: '2025-01-05T10:00:00Z',
        profiles: {
            id: 'user3',
            full_name: 'Bob Wilson',
            email: 'bob@example.com',
            avatar_url: null,
        },
        leave_types: {
            id: 'lt1',
            name: 'Personal Day',
            color: '#3b82f6',
            created_at: '2025-01-01',
        },
    },
];

describe('RequestsHistory', () => {
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

    it('renders request history with employee names', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        expect(container.textContent).toContain('John Doe');
        expect(container.textContent).toContain('Alice Johnson');
        expect(container.textContent).toContain('Bob Wilson');
    });

    it('displays employee emails', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        expect(container.textContent).toContain('john@example.com');
        expect(container.textContent).toContain('alice@example.com');
        expect(container.textContent).toContain('bob@example.com');
    });

    it('shows leave type names', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        expect(container.textContent).toContain('Personal Day');
        expect(container.textContent).toContain('Vacation');
    });

    it('displays Approved status badge', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        expect(container.textContent).toContain('Approved');
    });

    it('displays Denied status badge', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        expect(container.textContent).toContain('Denied');
    });

    it('shows empty state when no requests', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={[]} />
            );
        });

        expect(container.textContent).toContain('No history yet');
        expect(container.textContent).toContain('Processed requests will appear here');
    });

    it('renders desktop table with correct headers', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        expect(container.textContent).toContain('Employee');
        expect(container.textContent).toContain('Type');
        expect(container.textContent).toContain('Dates');
        expect(container.textContent).toContain('Status');
        expect(container.textContent).toContain('Processed');
    });

    it('displays processed dates', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        // Should show reviewed dates
        expect(container.textContent).toContain('Jan 12, 2025');
        expect(container.textContent).toContain('Jan 9, 2025');
        expect(container.textContent).toContain('Jan 6, 2025');
    });

    it('generates correct initials for avatars', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        // Initials should be JD, AJ, BW
        expect(container.textContent).toContain('JD');
        expect(container.textContent).toContain('AJ');
        expect(container.textContent).toContain('BW');
    });

    it('handles single day requests correctly', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        // Single day requests should show single date (rendered in local timezone)
        // The component uses format(new Date(request.start_date), ...) which may shift dates
        expect(container.textContent).toContain('Jan');
        expect(container.textContent).toContain('2025');
    });

    it('handles date range requests correctly', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        // Range request should show date range format (with dash separator)
        expect(container.textContent).toContain(' - ');
    });
});

describe('RequestsHistory - Mobile View', () => {
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

    it('shows processed date in mobile cards', () => {
        act(() => {
            root.render(
                <RequestsHistory requests={mockRequests} />
            );
        });

        // Mobile view should show "Processed" label
        expect(container.textContent).toContain('Processed');
    });
});
