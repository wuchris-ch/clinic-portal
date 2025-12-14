import React from 'react';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { OrganizationProvider, useOrganization } from '@/components/organization-context';
import type { Organization } from '@/lib/types/database';

/**
 * High-Value Tests: Organization Context
 *
 * Tests the multi-tenancy context provider:
 * - Provider renders children correctly
 * - Context provides correct organization data
 * - useOrganization hook throws outside provider
 * - basePath is correctly computed
 */

// Mock organization data
const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Acme Clinic',
    slug: 'acme-clinic',
    admin_email: 'admin@acme.com',
    google_sheet_id: 'sheet-123',
    settings: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
};

describe('OrganizationProvider', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeAll(() => {
        // Suppress React error boundary warnings in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    });

    beforeEach(() => {
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

    it('renders children correctly', () => {
        act(() => {
            root.render(
                <OrganizationProvider organization={mockOrganization}>
                    <div data-testid="child">Child Content</div>
                </OrganizationProvider>
            );
        });

        expect(container.textContent).toContain('Child Content');
    });

    it('provides organization data via context', () => {
        function TestConsumer() {
            const { organization } = useOrganization();
            return <div data-testid="org-name">{organization.name}</div>;
        }

        act(() => {
            root.render(
                <OrganizationProvider organization={mockOrganization}>
                    <TestConsumer />
                </OrganizationProvider>
            );
        });

        expect(container.textContent).toContain('Acme Clinic');
    });

    it('provides orgSlug via context', () => {
        function TestConsumer() {
            const { orgSlug } = useOrganization();
            return <div>{orgSlug}</div>;
        }

        act(() => {
            root.render(
                <OrganizationProvider organization={mockOrganization}>
                    <TestConsumer />
                </OrganizationProvider>
            );
        });

        expect(container.textContent).toContain('acme-clinic');
    });

    it('provides correct basePath', () => {
        function TestConsumer() {
            const { basePath } = useOrganization();
            return <div>{basePath}</div>;
        }

        act(() => {
            root.render(
                <OrganizationProvider organization={mockOrganization}>
                    <TestConsumer />
                </OrganizationProvider>
            );
        });

        expect(container.textContent).toContain('/org/acme-clinic');
    });

    it('computes basePath from organization slug', () => {
        const orgWithDifferentSlug: Organization = {
            ...mockOrganization,
            slug: 'metro-health',
        };

        function TestConsumer() {
            const { basePath } = useOrganization();
            return <div>{basePath}</div>;
        }

        act(() => {
            root.render(
                <OrganizationProvider organization={orgWithDifferentSlug}>
                    <TestConsumer />
                </OrganizationProvider>
            );
        });

        expect(container.textContent).toContain('/org/metro-health');
    });

    it('provides all organization fields', () => {
        function TestConsumer() {
            const { organization } = useOrganization();
            return (
                <div>
                    <span data-testid="id">{organization.id}</span>
                    <span data-testid="name">{organization.name}</span>
                    <span data-testid="slug">{organization.slug}</span>
                    <span data-testid="email">{organization.admin_email}</span>
                    <span data-testid="sheet">{organization.google_sheet_id}</span>
                </div>
            );
        }

        act(() => {
            root.render(
                <OrganizationProvider organization={mockOrganization}>
                    <TestConsumer />
                </OrganizationProvider>
            );
        });

        expect(container.textContent).toContain('org-123');
        expect(container.textContent).toContain('Acme Clinic');
        expect(container.textContent).toContain('acme-clinic');
        expect(container.textContent).toContain('admin@acme.com');
        expect(container.textContent).toContain('sheet-123');
    });
});

describe('useOrganization hook', () => {
    let container: HTMLDivElement;
    let root: Root;
    let consoleError: typeof console.error;

    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    });

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        // Suppress React error boundary console output
        consoleError = console.error;
        console.error = () => { };
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        console.error = consoleError;
    });

    it('throws error when used outside provider', () => {
        function TestComponent() {
            try {
                useOrganization();
                return <div>No error</div>;
            } catch (e) {
                return <div>Error: {(e as Error).message}</div>;
            }
        }

        act(() => {
            root.render(<TestComponent />);
        });

        expect(container.textContent).toContain('useOrganization must be used within an OrganizationProvider');
    });
});

describe('Organization Context - Value Computation', () => {
    /**
     * Tests for the context value computation logic in isolation.
     */

    function computeContextValue(organization: Organization) {
        return {
            organization,
            orgSlug: organization.slug,
            basePath: `/org/${organization.slug}`,
        };
    }

    it('computes correct context value', () => {
        const value = computeContextValue(mockOrganization);

        expect(value.organization).toBe(mockOrganization);
        expect(value.orgSlug).toBe('acme-clinic');
        expect(value.basePath).toBe('/org/acme-clinic');
    });

    it('handles slug with numbers', () => {
        const org: Organization = {
            ...mockOrganization,
            slug: 'clinic-123',
        };

        const value = computeContextValue(org);

        expect(value.basePath).toBe('/org/clinic-123');
    });

    it('handles slug with hyphens', () => {
        const org: Organization = {
            ...mockOrganization,
            slug: 'st-marys-hospital',
        };

        const value = computeContextValue(org);

        expect(value.basePath).toBe('/org/st-marys-hospital');
    });
});

describe('Organization Context - Type Safety', () => {
    /**
     * Verify the context type structure.
     */

    interface OrganizationContextValue {
        organization: Organization;
        orgSlug: string;
        basePath: string;
    }

    it('has correct type structure', () => {
        const value: OrganizationContextValue = {
            organization: mockOrganization,
            orgSlug: mockOrganization.slug,
            basePath: `/org/${mockOrganization.slug}`,
        };

        expect(value.organization.id).toBeDefined();
        expect(value.organization.name).toBeDefined();
        expect(value.organization.slug).toBeDefined();
        expect(typeof value.orgSlug).toBe('string');
        expect(typeof value.basePath).toBe('string');
    });
});
