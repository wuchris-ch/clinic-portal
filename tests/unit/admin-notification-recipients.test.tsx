import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { NotificationRecipients } from '@/components/admin/notification-recipients';

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
                insert: vi.fn(() => Promise.resolve({ error: null })),
                update: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ error: null })),
                })),
                delete: vi.fn(() => ({
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

const mockRecipients = [
    {
        id: 'rec1',
        email: 'manager@company.com',
        name: 'Manager One',
        is_active: true,
        added_by: 'admin1',
        organization_id: 'org1',
        created_at: '2025-01-15T10:00:00Z',
    },
    {
        id: 'rec2',
        email: 'hr@company.com',
        name: 'HR Department',
        is_active: true,
        added_by: 'admin1',
        organization_id: 'org1',
        created_at: '2025-01-10T10:00:00Z',
    },
    {
        id: 'rec3',
        email: 'supervisor@company.com',
        name: null,
        is_active: false,
        added_by: 'admin1',
        organization_id: 'org1',
        created_at: '2025-01-05T10:00:00Z',
    },
];

describe('NotificationRecipients', () => {
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

    it('renders recipient list with emails', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        expect(container.textContent).toContain('manager@company.com');
        expect(container.textContent).toContain('hr@company.com');
        expect(container.textContent).toContain('supervisor@company.com');
    });

    it('displays recipient names when available', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        expect(container.textContent).toContain('Manager One');
        expect(container.textContent).toContain('HR Department');
    });

    it('shows active recipient count', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        // 2 active recipients
        expect(container.textContent).toContain('2 active recipients');
    });

    it('shows "Add Recipient" button', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        expect(container.textContent).toContain('Add Recipient');
    });

    it('shows empty state when no recipients', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={[]}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        expect(container.textContent).toContain('No notification recipients');
        expect(container.textContent).toContain('Add First Recipient');
    });

    it('displays toggle switches for each recipient', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        // Should have toggle switches (role="switch")
        const switches = container.querySelectorAll('[role="switch"]');
        expect(switches.length).toBe(3);
    });

    it('shows Active/Paused status for recipients', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        expect(container.textContent).toContain('Active');
        expect(container.textContent).toContain('Paused');
    });

    it('shows tip about toggling notifications', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        expect(container.textContent).toContain('Tip:');
        expect(container.textContent).toContain('Toggle the switch to temporarily pause notifications');
    });

    it('displays added date for recipients', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        // Should show "Added Jan 15, 2025" etc.
        expect(container.textContent).toContain('Added');
        expect(container.textContent).toContain('Jan');
    });

    it('has delete buttons for each recipient', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        // Should have delete buttons with sr-only text
        expect(container.textContent).toContain('Delete recipient');
    });
});

describe('NotificationRecipients - Add Dialog', () => {
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

    it('has clickable Add Recipient button', () => {
        act(() => {
            root.render(
                <NotificationRecipients
                    recipients={mockRecipients}
                    adminId="admin1"
                    organizationId="org1"
                />
            );
        });

        // Find the Add Recipient button
        const addButton = Array.from(container.querySelectorAll('button')).find(
            btn => btn.textContent?.includes('Add Recipient')
        );

        expect(addButton).toBeTruthy();
        expect(addButton?.disabled).toBe(false);
    });
});
