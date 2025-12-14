import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { PendingRequestsQueue } from '@/components/admin/pending-requests-queue';

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
                update: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ error: null })),
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

// Mock fetch for notifications
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as unknown as typeof fetch;

const mockRequests = [
    {
        id: 'req1',
        user_id: 'user1',
        leave_type_id: 'lt1',
        pay_period_id: 'pp1',
        organization_id: 'org1',
        submission_date: '2025-01-15',
        start_date: '2025-01-20',
        end_date: '2025-01-20',
        reason: 'Doctor appointment',
        coverage_name: 'Jane Smith',
        coverage_email: 'jane@example.com',
        status: 'pending' as const,
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
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
            is_single_day: true,
            created_at: '2025-01-01',
        },
    },
    {
        id: 'req2',
        user_id: 'user2',
        leave_type_id: 'lt2',
        pay_period_id: 'pp1',
        organization_id: 'org1',
        submission_date: '2025-01-14',
        start_date: '2025-02-01',
        end_date: '2025-02-05',
        reason: 'Family vacation',
        coverage_name: null,
        coverage_email: null,
        status: 'pending' as const,
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: '2025-01-14T10:00:00Z',
        updated_at: '2025-01-14T10:00:00Z',
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
            is_single_day: false,
            created_at: '2025-01-01',
        },
    },
];

describe('PendingRequestsQueue', () => {
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

    it('renders pending requests with employee names', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('John Doe');
        expect(container.textContent).toContain('Alice Johnson');
    });

    it('displays employee emails', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('john@example.com');
        expect(container.textContent).toContain('alice@example.com');
    });

    it('shows leave type names with colors', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('Personal Day');
        expect(container.textContent).toContain('Vacation');
    });

    it('displays request reasons', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('Doctor appointment');
        expect(container.textContent).toContain('Family vacation');
    });

    it('shows coverage information when available', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('Coverage: Jane Smith');
        expect(container.textContent).toContain('jane@example.com');
    });

    it('shows Pending badge for all requests', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        // Should have "Pending" badge for each request
        const pendingBadges = container.textContent?.match(/Pending/g);
        expect(pendingBadges?.length).toBeGreaterThanOrEqual(2);
    });

    it('displays Approve and Deny buttons for each request', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        // Should have Approve and Deny buttons
        expect(container.textContent).toContain('Approve');
        expect(container.textContent).toContain('Deny');
    });

    it('shows empty state when no requests', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={[]}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('All caught up!');
        expect(container.textContent).toContain('There are no pending requests to review');
    });

    it('shows submitted timestamp', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        expect(container.textContent).toContain('Submitted');
    });

    it('generates correct initials for avatars', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        // Initials should be JD (John Doe) and AJ (Alice Johnson)
        expect(container.textContent).toContain('JD');
        expect(container.textContent).toContain('AJ');
    });

    it('handles single day requests correctly', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        // First request is single day - should display with full date format
        // The component uses format(new Date(request.start_date), "EEEE, MMM d, yyyy")
        expect(container.textContent).toContain('Jan');
        expect(container.textContent).toContain('2025');
    });

    it('handles date range requests correctly', () => {
        act(() => {
            root.render(
                <PendingRequestsQueue
                    requests={mockRequests}
                    adminId="admin1"
                />
            );
        });

        // Second request is a range - should show date range format
        expect(container.textContent).toContain(' - ');
    });
});
