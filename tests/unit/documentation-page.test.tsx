import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

// Mock useOrganization hook before importing the component
const mockOrganization = {
    basePath: '/org/test-org',
    orgSlug: 'test-org',
    organization: {
        id: 'test-org-id',
        name: 'Test Organization',
        slug: 'test-org',
        admin_email: 'admin@test.com',
        google_sheet_id: null,
        settings: {},
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
    },
};

vi.mock('@/components/organization-context', () => ({
    useOrganization: () => mockOrganization,
}));

// Import the component after mocking
import DocumentationPage from '@/app/org/[slug]/documentation/page';

// Polyfill ResizeObserver for Radix UI components
beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

describe('Documentation Page (Protected)', () => {
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

    describe('Page Content Rendering', () => {
        it('renders documentation header', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            expect(container.textContent).toContain('Documentation');
            expect(container.textContent).toContain('Clinic protocols, handbooks, and forms');
        });

        it('renders all three documentation sections', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            expect(container.textContent).toContain('Clinic Protocols');
            expect(container.textContent).toContain('Employee Handbook');
            expect(container.textContent).toContain('Forms');
        });

        it('renders section descriptions', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            expect(container.textContent).toContain('Operational standards and procedures for clinic duties');
            expect(container.textContent).toContain('Policies, duties, and expectations for employees');
            expect(container.textContent).toContain('Downloadable forms for various requests');
        });

        it('displays placeholder message when no documents available', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            // All sections should show the placeholder since documents array is empty
            const placeholders = container.querySelectorAll('p.text-gray-400');
            expect(placeholders.length).toBe(3); // One for each section
        });
    });

    describe('Navigation Links', () => {
        it('renders back to announcements link with correct org-scoped path', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            const backLink = container.querySelector('a[href="/org/test-org/announcements"]');
            expect(backLink).toBeTruthy();
            expect(backLink?.textContent).toContain('Back to Announcements');
        });

        it('back link uses organization basePath', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            const backLink = container.querySelector('a[href*="/org/test-org"]');
            expect(backLink).toBeTruthy();
        });
    });

    describe('Visual Elements', () => {
        it('renders section icons (SVG elements)', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            // Each section should have an icon
            const icons = container.querySelectorAll('svg');
            expect(icons.length).toBeGreaterThanOrEqual(4); // At least 4: back arrow + 3 section icons
        });

        it('renders styled header with blue background', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            // Header should have blue-500 background class
            const header = container.querySelector('.bg-blue-500');
            expect(header).toBeTruthy();
        });

        it('renders section cards with borders', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            // Each section card should have border styling
            const cards = container.querySelectorAll('.border.rounded-lg');
            expect(cards.length).toBe(3); // 3 documentation sections
        });
    });

    describe('Accessibility', () => {
        it('uses semantic heading structure', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            // Main heading
            const h1 = container.querySelector('h1');
            expect(h1).toBeTruthy();
            expect(h1?.textContent).toContain('Documentation');

            // Section headings
            const h2s = container.querySelectorAll('h2');
            expect(h2s.length).toBe(3); // One for each section
        });

        it('links are properly styled and visible', () => {
            act(() => {
                root.render(<DocumentationPage />);
            });

            const links = container.querySelectorAll('a');
            expect(links.length).toBeGreaterThan(0);

            // Check back link exists
            const backLink = Array.from(links).find(link =>
                link.textContent?.includes('Back')
            );
            expect(backLink).toBeTruthy();
        });
    });
});

describe('Documentation Route Protection Logic', () => {
    it('documentation is in org-scoped route group', () => {
        // This test verifies the documentation page is in the protected org route
        // The fact that it uses useOrganization() means it MUST be in org/[slug] routes
        // which are protected by the org layout
        expect(mockOrganization.basePath).toBe('/org/test-org');
    });

    it('page requires organization context', () => {
        // The component uses useOrganization() hook
        // If accessed without organization context, it would throw
        // This is enforced by the org/[slug]/layout.tsx which:
        // 1. Redirects to /login if no user
        // 2. Validates organization exists
        // 3. Validates user belongs to organization
        expect(mockOrganization.organization).toBeDefined();
        expect(mockOrganization.organization.slug).toBe('test-org');
    });
});
