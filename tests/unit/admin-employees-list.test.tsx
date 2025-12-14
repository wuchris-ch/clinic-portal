import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { EmployeesList } from '@/components/admin/employees-list';

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

const mockEmployees = [
    {
        id: 'user1',
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'admin' as const,
        avatar_url: null,
        created_at: '2025-01-01',
        organization_id: 'org1',
        pendingCount: 3,
        approvedCount: 10,
    },
    {
        id: 'user2',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'staff' as const,
        avatar_url: null,
        created_at: '2025-01-01',
        organization_id: 'org1',
        pendingCount: 1,
        approvedCount: 5,
    },
    {
        id: 'user3',
        full_name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'staff' as const,
        avatar_url: null,
        created_at: '2025-01-01',
        organization_id: 'org1',
        pendingCount: 0,
        approvedCount: 2,
    },
];

describe('EmployeesList', () => {
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

    it('renders employee list with names and emails', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        expect(container.textContent).toContain('John Doe');
        expect(container.textContent).toContain('john@example.com');
        expect(container.textContent).toContain('Jane Smith');
        expect(container.textContent).toContain('jane@example.com');
        expect(container.textContent).toContain('Bob Wilson');
        expect(container.textContent).toContain('bob@example.com');
    });

    it('displays admin badge for admin users', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user2"
                />
            );
        });

        // Should contain "Admin" badge for John Doe
        expect(container.textContent).toContain('Admin');
        // Should contain "Staff" badge for other users
        expect(container.textContent).toContain('Staff');
    });

    it('shows "(You)" indicator for current user', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        expect(container.textContent).toContain('(You)');
    });

    it('displays pending and approved counts', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        // Check for pending counts (3, 1, 0)
        expect(container.textContent).toContain('3');
        expect(container.textContent).toContain('1');
        expect(container.textContent).toContain('0');

        // Check for approved counts (10, 5, 2)
        expect(container.textContent).toContain('10');
        expect(container.textContent).toContain('5');
        expect(container.textContent).toContain('2');
    });

    it('renders desktop table with correct headers', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        expect(container.textContent).toContain('Employee');
        expect(container.textContent).toContain('Role');
        expect(container.textContent).toContain('Pending');
        expect(container.textContent).toContain('Approved');
    });

    it('generates correct initials for avatars', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        // Check avatar fallbacks contain initials
        const avatarFallbacks = container.querySelectorAll('[class*="AvatarFallback"], span.bg-primary\\/10');
        // Initials should be JD, JS, BW
        expect(container.textContent).toContain('JD');
        expect(container.textContent).toContain('JS');
        expect(container.textContent).toContain('BW');
    });

    it('disables action button for current user', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        // The action button for the current user should be disabled
        const buttons = container.querySelectorAll('button[disabled]');
        expect(buttons.length).toBeGreaterThan(0);
    });
});

describe('EmployeesList - Mobile View', () => {
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

    it('renders mobile cards with pending/approved labels', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        // Mobile view should show "pending" and "approved" text
        expect(container.textContent).toContain('pending');
        expect(container.textContent).toContain('approved');
    });

    it('shows role change button for non-current users in mobile view', () => {
        act(() => {
            root.render(
                <EmployeesList
                    employees={mockEmployees}
                    currentUserId="user1"
                />
            );
        });

        // Should have "Make Admin" buttons for staff users
        expect(container.textContent).toContain('Make Admin');
    });
});
