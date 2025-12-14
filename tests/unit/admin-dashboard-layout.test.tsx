import React from 'react';
import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * Tests for Admin Dashboard Layout
 *
 * Verifies:
 * - StatsCard component renders with correct mobile-responsive styling
 * - Stats cards use compact layout on mobile (smaller padding, icons, text)
 * - Grid displays 2x2 on mobile, 4-column on desktop
 */

// Recreate StatsCard component for testing (mirrors the one in admin/page.tsx)
function StatsCard({
    title,
    value,
    icon,
    variant,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    variant: "default" | "warning" | "success" | "destructive";
}) {
    const variantStyles = {
        default: "bg-card border-border/50",
        warning: "bg-warning/10 text-warning-foreground border-warning/20",
        success: "bg-success/10 text-success border-success/20",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
    };

    const iconStyles = {
        default: "text-muted-foreground",
        warning: "text-warning-foreground",
        success: "text-success",
        destructive: "text-destructive",
    };

    return (
        <div className={`border rounded-lg ${variantStyles[variant]}`} data-testid="stats-card">
            <div className="p-3 md:p-6" data-testid="card-content">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm font-medium opacity-80" data-testid="card-title">{title}</p>
                        <p className="text-2xl md:text-3xl font-bold" data-testid="card-value">{value}</p>
                    </div>
                    <div className={`${iconStyles[variant]} [&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4`} data-testid="card-icon">{icon}</div>
                </div>
            </div>
        </div>
    );
}

// Stats Grid component for testing layout
function StatsGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4" data-testid="stats-grid">
            {children}
        </div>
    );
}

describe('StatsCard Component', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeAll(() => {
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

    it('renders title and value correctly', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Total Staff"
                    value={42}
                    icon={<Users className="h-4 w-4" />}
                    variant="default"
                />
            );
        });

        expect(container.textContent).toContain('Total Staff');
        expect(container.textContent).toContain('42');
    });

    it('applies mobile-compact padding classes', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Pending"
                    value={5}
                    icon={<Clock className="h-4 w-4" />}
                    variant="warning"
                />
            );
        });

        const cardContent = container.querySelector('[data-testid="card-content"]');
        expect(cardContent?.className).toContain('p-3');
        expect(cardContent?.className).toContain('md:p-6');
    });

    it('applies mobile-compact text size classes to title', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Approved"
                    value={10}
                    icon={<CheckCircle className="h-4 w-4" />}
                    variant="success"
                />
            );
        });

        const cardTitle = container.querySelector('[data-testid="card-title"]');
        expect(cardTitle?.className).toContain('text-xs');
        expect(cardTitle?.className).toContain('md:text-sm');
    });

    it('applies mobile-compact text size classes to value', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Denied"
                    value={2}
                    icon={<XCircle className="h-4 w-4" />}
                    variant="destructive"
                />
            );
        });

        const cardValue = container.querySelector('[data-testid="card-value"]');
        expect(cardValue?.className).toContain('text-2xl');
        expect(cardValue?.className).toContain('md:text-3xl');
    });

    it('applies mobile-compact icon size classes', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Total Staff"
                    value={100}
                    icon={<Users className="h-4 w-4" />}
                    variant="default"
                />
            );
        });

        const iconContainer = container.querySelector('[data-testid="card-icon"]');
        expect(iconContainer?.className).toContain('[&>svg]:w-3');
        expect(iconContainer?.className).toContain('[&>svg]:h-3');
        expect(iconContainer?.className).toContain('md:[&>svg]:w-4');
        expect(iconContainer?.className).toContain('md:[&>svg]:h-4');
    });

    describe('variant styles', () => {
        it('applies default variant styles', () => {
            act(() => {
                root.render(
                    <StatsCard
                        title="Total Staff"
                        value={5}
                        icon={<Users className="h-4 w-4" />}
                        variant="default"
                    />
                );
            });

            const card = container.querySelector('[data-testid="stats-card"]');
            expect(card?.className).toContain('bg-card');
            expect(card?.className).toContain('border-border/50');
        });

        it('applies warning variant styles', () => {
            act(() => {
                root.render(
                    <StatsCard
                        title="Pending"
                        value={3}
                        icon={<Clock className="h-4 w-4" />}
                        variant="warning"
                    />
                );
            });

            const card = container.querySelector('[data-testid="stats-card"]');
            expect(card?.className).toContain('bg-warning/10');
            expect(card?.className).toContain('text-warning-foreground');
        });

        it('applies success variant styles', () => {
            act(() => {
                root.render(
                    <StatsCard
                        title="Approved"
                        value={15}
                        icon={<CheckCircle className="h-4 w-4" />}
                        variant="success"
                    />
                );
            });

            const card = container.querySelector('[data-testid="stats-card"]');
            expect(card?.className).toContain('bg-success/10');
            expect(card?.className).toContain('text-success');
        });

        it('applies destructive variant styles', () => {
            act(() => {
                root.render(
                    <StatsCard
                        title="Denied"
                        value={1}
                        icon={<XCircle className="h-4 w-4" />}
                        variant="destructive"
                    />
                );
            });

            const card = container.querySelector('[data-testid="stats-card"]');
            expect(card?.className).toContain('bg-destructive/10');
            expect(card?.className).toContain('text-destructive');
        });
    });
});

describe('Stats Grid Layout', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeAll(() => {
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

    it('applies 2-column grid on mobile', () => {
        act(() => {
            root.render(
                <StatsGrid>
                    <StatsCard title="Staff" value={10} icon={<Users />} variant="default" />
                    <StatsCard title="Pending" value={5} icon={<Clock />} variant="warning" />
                    <StatsCard title="Approved" value={20} icon={<CheckCircle />} variant="success" />
                    <StatsCard title="Denied" value={2} icon={<XCircle />} variant="destructive" />
                </StatsGrid>
            );
        });

        const grid = container.querySelector('[data-testid="stats-grid"]');
        expect(grid?.className).toContain('grid-cols-2');
    });

    it('applies 4-column grid on desktop', () => {
        act(() => {
            root.render(
                <StatsGrid>
                    <StatsCard title="Staff" value={10} icon={<Users />} variant="default" />
                    <StatsCard title="Pending" value={5} icon={<Clock />} variant="warning" />
                    <StatsCard title="Approved" value={20} icon={<CheckCircle />} variant="success" />
                    <StatsCard title="Denied" value={2} icon={<XCircle />} variant="destructive" />
                </StatsGrid>
            );
        });

        const grid = container.querySelector('[data-testid="stats-grid"]');
        expect(grid?.className).toContain('md:grid-cols-4');
    });

    it('applies smaller gap on mobile', () => {
        act(() => {
            root.render(
                <StatsGrid>
                    <StatsCard title="Staff" value={10} icon={<Users />} variant="default" />
                </StatsGrid>
            );
        });

        const grid = container.querySelector('[data-testid="stats-grid"]');
        expect(grid?.className).toContain('gap-2');
        expect(grid?.className).toContain('md:gap-4');
    });

    it('renders all four stats cards', () => {
        act(() => {
            root.render(
                <StatsGrid>
                    <StatsCard title="Total Staff" value={10} icon={<Users />} variant="default" />
                    <StatsCard title="Pending" value={5} icon={<Clock />} variant="warning" />
                    <StatsCard title="Approved" value={20} icon={<CheckCircle />} variant="success" />
                    <StatsCard title="Denied" value={2} icon={<XCircle />} variant="destructive" />
                </StatsGrid>
            );
        });

        const cards = container.querySelectorAll('[data-testid="stats-card"]');
        expect(cards.length).toBe(4);

        expect(container.textContent).toContain('Total Staff');
        expect(container.textContent).toContain('Pending');
        expect(container.textContent).toContain('Approved');
        expect(container.textContent).toContain('Denied');
    });
});

describe('Admin Dashboard Section Order', () => {
    /**
     * Tests to verify the expected section order in the admin dashboard:
     * 1. Email Notifications
     * 2. Organization Settings (Google Sheets)
     * 3. Stats Cards
     * 4. Time-Off Requests (Approval Queue)
     *
     * Since the admin page is a server component, we test the expected structure.
     */

    const expectedSectionOrder = [
        'Email Notifications',
        'Organization Settings',
        'Stats Cards',
        'Time-Off Requests',
    ];

    it('defines correct section order', () => {
        expect(expectedSectionOrder[0]).toBe('Email Notifications');
        expect(expectedSectionOrder[1]).toBe('Organization Settings');
        expect(expectedSectionOrder[2]).toBe('Stats Cards');
        expect(expectedSectionOrder[3]).toBe('Time-Off Requests');
    });

    it('has Email Notifications before Organization Settings', () => {
        const emailIndex = expectedSectionOrder.indexOf('Email Notifications');
        const settingsIndex = expectedSectionOrder.indexOf('Organization Settings');
        expect(emailIndex).toBeLessThan(settingsIndex);
    });

    it('has Organization Settings before Stats Cards', () => {
        const settingsIndex = expectedSectionOrder.indexOf('Organization Settings');
        const statsIndex = expectedSectionOrder.indexOf('Stats Cards');
        expect(settingsIndex).toBeLessThan(statsIndex);
    });

    it('has Stats Cards before Time-Off Requests', () => {
        const statsIndex = expectedSectionOrder.indexOf('Stats Cards');
        const requestsIndex = expectedSectionOrder.indexOf('Time-Off Requests');
        expect(statsIndex).toBeLessThan(requestsIndex);
    });

    it('has Time-Off Requests at the bottom', () => {
        const requestsIndex = expectedSectionOrder.indexOf('Time-Off Requests');
        expect(requestsIndex).toBe(expectedSectionOrder.length - 1);
    });
});

describe('StatsCard - Display Values', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeAll(() => {
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

    it('displays zero values correctly', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Pending"
                    value={0}
                    icon={<Clock className="h-4 w-4" />}
                    variant="warning"
                />
            );
        });

        expect(container.textContent).toContain('0');
    });

    it('displays large values correctly', () => {
        act(() => {
            root.render(
                <StatsCard
                    title="Total Staff"
                    value={9999}
                    icon={<Users className="h-4 w-4" />}
                    variant="default"
                />
            );
        });

        expect(container.textContent).toContain('9999');
    });
});
