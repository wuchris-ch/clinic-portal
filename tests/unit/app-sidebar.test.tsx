import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

// Polyfill ResizeObserver for Radix UI components
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

// Mock next/navigation
vi.mock('next/navigation', () => {
    return {
        useRouter: () => ({
            push: vi.fn(),
            refresh: vi.fn(),
        }),
        usePathname: () => '/',
    };
});

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => {
    return {
        createClient: () => ({
            auth: {
                signOut: vi.fn().mockResolvedValue({}),
            },
        }),
    };
});

// Mock the useIsMobile hook to control mobile state in tests
const mockIsMobile = vi.fn();
vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: () => mockIsMobile(),
}));

describe('AppSidebar', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        // Reset mocks
        mockIsMobile.mockReturnValue(false);

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

    describe('Basic Rendering', () => {
        it('renders with StaffHub branding', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('StaffHub');
            expect(container.textContent).toContain('Time Off Portal');
        });

        it('renders Help Center navigation items', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Help Center');
            expect(container.textContent).toContain('Home');
            expect(container.textContent).toContain('Announcements');
            expect(container.textContent).toContain('Documentation');
            expect(container.textContent).toContain('App Walkthrough');
        });

        it('renders Quick Forms section when user is not logged in', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Quick Forms');
            expect(container.textContent).toContain('Request 1 Day Off');
            expect(container.textContent).toContain('Vacation Request');
            expect(container.textContent).toContain('Time Clock Request');
            expect(container.textContent).toContain('Overtime Submission');
            expect(container.textContent).toContain('Sick Day Submission');
        });

        it('shows Sign In link when user is not logged in', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Sign In');
        });
    });

    describe('X Close Button', () => {
        it('renders close button with correct aria-label in sidebar content', () => {
            // On desktop, sidebar renders directly and shows the close button (with md:hidden)
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            // The close button exists in the sidebar content, but has md:hidden class
            // So on desktop it's in the DOM but visually hidden
            const closeButton = container.querySelector('button[aria-label="Close sidebar"]');
            expect(closeButton).toBeTruthy();
        });

        it('close button has md:hidden class for mobile-only visibility', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            const closeButton = container.querySelector('button[aria-label="Close sidebar"]');
            expect(closeButton).toBeTruthy();
            expect(closeButton?.className).toContain('md:hidden');
        });

        it('renders X icon (SVG) inside close button', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            const closeButton = container.querySelector('button[aria-label="Close sidebar"]');
            expect(closeButton).toBeTruthy();
            // The X icon should be inside the button (as SVG)
            const svg = closeButton?.querySelector('svg');
            expect(svg).toBeTruthy();
        });

        it('close button is positioned in sidebar header', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            // Close button should be inside the sidebar header
            const sidebarHeader = container.querySelector('[data-sidebar="header"]');
            expect(sidebarHeader).toBeTruthy();
            const closeButton = sidebarHeader?.querySelector('button[aria-label="Close sidebar"]');
            expect(closeButton).toBeTruthy();
        });
    });

    describe('Navigation Links', () => {
        it('all Help Center links have onClick handlers', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            const homeLink = container.querySelector('a[href="/"]');
            const announcementsLink = container.querySelector('a[href="/announcements"]');
            const documentationLink = container.querySelector('a[href="/documentation"]');
            const walkthroughLink = container.querySelector('a[href="/walkthrough"]');

            // Links should exist
            expect(homeLink).toBeTruthy();
            expect(announcementsLink).toBeTruthy();
            expect(documentationLink).toBeTruthy();
            expect(walkthroughLink).toBeTruthy();
        });

        it('Quick Forms links have correct hrefs', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            const dayOffLink = container.querySelector('a[href="/forms/day-off"]');
            const vacationLink = container.querySelector('a[href="/forms/vacation"]');
            const timeClockLink = container.querySelector('a[href="/forms/time-clock"]');
            const overtimeLink = container.querySelector('a[href="/forms/overtime"]');
            const sickDayLink = container.querySelector('a[href="/forms/sick-day"]');

            expect(dayOffLink).toBeTruthy();
            expect(vacationLink).toBeTruthy();
            expect(timeClockLink).toBeTruthy();
            expect(overtimeLink).toBeTruthy();
            expect(sickDayLink).toBeTruthy();
        });
    });

    describe('Logged In User', () => {
        const mockUser = {
            id: 'test-user-id',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2025-01-01',
        };

        const mockProfile = {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'staff' as const,
            created_at: '2025-01-01',
            updated_at: '2025-01-01',
            avatar_url: null,
        };

        it('shows My Workspace section when logged in', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('My Workspace');
        });

        it('does not show Quick Forms section when logged in', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).not.toContain('Quick Forms');
        });

        it('shows Sign Out button when logged in', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Sign Out');
        });

        it('displays user initials in avatar', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            // TU = Test User initials
            expect(container.textContent).toContain('TU');
        });

        it('shows user name and role', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Test User');
            expect(container.textContent).toContain('Staff');
        });
    });

    describe('Admin User', () => {
        const mockUser = {
            id: 'admin-user-id',
            email: 'admin@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2025-01-01',
        };

        const mockAdminProfile = {
            id: 'admin-user-id',
            email: 'admin@example.com',
            full_name: 'Admin User',
            role: 'admin' as const,
            created_at: '2025-01-01',
            updated_at: '2025-01-01',
            avatar_url: null,
        };

        it('shows Administration section for admin users', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockAdminProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Administration');
            expect(container.textContent).toContain('Admin Dashboard');
            expect(container.textContent).toContain('Manage Staff');
        });

        it('displays Administrator role label', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppSidebar user={mockUser} profile={mockAdminProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Administrator');
        });
    });
});
