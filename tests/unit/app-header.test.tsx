import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { AppHeader } from '@/components/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

// Polyfill ResizeObserver for Radix UI components
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };

    // Mock matchMedia for useIsMobile hook
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

// Mock next/navigation - default to root, tests can override
let mockPathname = '/';
vi.mock('next/navigation', () => {
    return {
        usePathname: () => mockPathname,
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

describe('AppHeader', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        // Required by React to enable act() warnings/behavior in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

        // Reset mock pathname to default
        mockPathname = '/';

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

    describe('Home Button Removal', () => {
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
            organization_id: 'test-org-id',
        };

        it('does not render Home navigation link for signed-in users', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            // Home navigation link was removed - users access landing page via sidebar logo
            // Note: "Home" may still appear in breadcrumb as page title, but not as a navigation link
            const homeLinks = container.querySelectorAll('a[href="/"]');
            expect(homeLinks.length).toBe(0);
        });

        it('does not have a dedicated home link in header', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            // No home-specific links in the header (logo is in sidebar, not header)
            // The only "/" link would be in sidebar, not header
            const homeLinks = container.querySelectorAll('a[href="/"]');
            expect(homeLinks.length).toBe(0);
        });

        it('still shows Sign Out button for signed-in users', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Sign Out');
        });

        it('shows Admin badge for admin users', () => {
            const adminProfile = {
                ...mockProfile,
                role: 'admin' as const,
            };

            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={adminProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Admin');
        });
    });

    describe('Non-signed-in users', () => {
        it('shows Sign In button when not logged in', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Sign In');
        });

        it('does not show Home navigation link for non-signed-in users either', () => {
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={null} profile={null} />
                    </SidebarProvider>
                );
            });

            // Home navigation link removed for all users
            const homeLinks = container.querySelectorAll('a[href="/"]');
            expect(homeLinks.length).toBe(0);
        });
    });

    describe('Page Titles', () => {
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
            organization_id: 'test-org-id',
        };

        it('shows "About StaffHub" for /home route', () => {
            mockPathname = '/org/testorg/home';
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('About StaffHub');
        });

        it('shows "Dashboard" as default for unmatched routes', () => {
            mockPathname = '/org/testorg/dashboard';
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Dashboard');
        });

        it('shows "Announcements" for announcements route', () => {
            mockPathname = '/org/testorg/announcements';
            act(() => {
                root.render(
                    <SidebarProvider>
                        <AppHeader user={mockUser} profile={mockProfile} />
                    </SidebarProvider>
                );
            });

            expect(container.textContent).toContain('Announcements');
        });
    });
});
