import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { AnnouncementsList } from '@/components/announcements-list';

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
    };
});

// Mock Supabase client - capture insert calls to verify organizationId
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
});
const mockDelete = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
});

vi.mock('@/lib/supabase/client', () => {
    return {
        createClient: () => ({
            from: () => ({
                insert: mockInsert,
                update: mockUpdate,
                delete: mockDelete,
            }),
        }),
    };
});

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('AnnouncementsList', () => {
    let container: HTMLDivElement;
    let root: Root;

    const mockOrganizationId = 'test-org-uuid-12345';

    const mockAnnouncements = [
        {
            id: 'ann-1',
            title: 'First Announcement',
            content: 'This is the first announcement content.',
            pinned: true,
            image_url: null,
            organization_id: mockOrganizationId,
            created_at: '2025-01-15T10:00:00Z',
            updated_at: '2025-01-15T10:00:00Z',
        },
        {
            id: 'ann-2',
            title: 'Second Announcement',
            content: 'This is the second announcement content.',
            pinned: false,
            image_url: null,
            organization_id: mockOrganizationId,
            created_at: '2025-01-14T10:00:00Z',
            updated_at: '2025-01-14T10:00:00Z',
        },
    ];

    beforeEach(() => {
        // Required by React to enable act() warnings/behavior in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        // Reset mocks
        mockInsert.mockClear();
        mockUpdate.mockClear();
        mockDelete.mockClear();
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    describe('Rendering Announcements', () => {
        it('renders list of announcements', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            expect(container.textContent).toContain('First Announcement');
            expect(container.textContent).toContain('Second Announcement');
            expect(container.textContent).toContain('This is the first announcement content.');
            expect(container.textContent).toContain('This is the second announcement content.');
        });

        it('shows pinned indicator for pinned announcements', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            // The first announcement is pinned - check for visual indicator (pin icon SVG)
            const pinnedCard = container.querySelector('.border-blue-200, .border-blue-800');
            expect(pinnedCard || container.innerHTML.includes('Pin')).toBeTruthy();
        });

        it('shows empty state when no announcements exist', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={[]}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            expect(container.textContent).toContain('No announcements at this time');
            expect(container.textContent).toContain('Check back later');
        });

        it('shows different empty state for admin when no announcements', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={[]}
                        isAdmin={true}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            expect(container.textContent).toContain('No announcements yet');
            expect(container.textContent).toContain('New Announcement');
        });
    });

    describe('Admin Controls', () => {
        it('shows "New Announcement" button for admin users', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={true}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            const newButton = container.querySelector('button');
            expect(container.textContent).toContain('New Announcement');
            expect(newButton).toBeTruthy();
        });

        it('does NOT show "New Announcement" button for non-admin users', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            expect(container.textContent).not.toContain('New Announcement');
        });

        it('shows edit and delete buttons for admin users', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={true}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            // Admin should see edit buttons (there's one per announcement)
            const buttons = container.querySelectorAll('button');
            // Should have more than just the "New Announcement" button
            expect(buttons.length).toBeGreaterThan(1);
        });

        it('does NOT show edit/delete buttons for non-admin users', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            // Non-admin should not see any action buttons
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toBe(0);
        });
    });

    describe('Date Formatting', () => {
        it('formats announcement dates correctly', () => {
            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={mockAnnouncements}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            // Should show formatted date like "January 15, 2025"
            expect(container.textContent).toMatch(/January\s+15,\s+2025/);
        });

        it('shows edited indicator when updated_at differs from created_at', () => {
            const editedAnnouncement = [{
                ...mockAnnouncements[0],
                updated_at: '2025-01-16T10:00:00Z', // Different from created_at
            }];

            act(() => {
                root.render(
                    <AnnouncementsList
                        announcements={editedAnnouncement}
                        isAdmin={false}
                        organizationId={mockOrganizationId}
                    />
                );
            });

            expect(container.textContent).toContain('edited');
        });
    });
});
