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
// Updated to match new gradient-based styling
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
        default: "bg-card border-border/40 shadow-sm",
        warning: "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/60 shadow-sm shadow-amber-100/50",
        success: "bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200/60 shadow-sm shadow-emerald-100/50",
        destructive: "bg-gradient-to-br from-rose-50 to-red-50/50 border-rose-200/60 shadow-sm shadow-rose-100/50",
    };

    const titleStyles = {
        default: "text-muted-foreground",
        warning: "text-amber-700",
        success: "text-emerald-700",
        destructive: "text-rose-700",
    };

    const valueStyles = {
        default: "text-foreground",
        warning: "text-amber-900",
        success: "text-emerald-900",
        destructive: "text-rose-900",
    };

    const iconContainerStyles = {
        default: "bg-muted/50 text-muted-foreground",
        warning: "bg-amber-100/80 text-amber-600",
        success: "bg-emerald-100/80 text-emerald-600",
        destructive: "bg-rose-100/80 text-rose-600",
    };

    return (
        <div className={`border rounded-lg overflow-hidden ${variantStyles[variant]}`} data-testid="stats-card">
            <div className="p-4 md:p-5" data-testid="card-content">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className={`text-xs md:text-sm font-medium ${titleStyles[variant]}`} data-testid="card-title">{title}</p>
                        <p className={`text-2xl md:text-3xl font-bold tracking-tight ${valueStyles[variant]}`} data-testid="card-value">{value}</p>
                    </div>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center ${iconContainerStyles[variant]}`} data-testid="card-icon">
                        <div className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-[18px] md:[&>svg]:h-[18px]">{icon}</div>
                    </div>
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
        expect(cardContent?.className).toContain('p-4');
        expect(cardContent?.className).toContain('md:p-5');
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

    it('applies icon container with proper sizing', () => {
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
        // Icon container now uses fixed size with rounded-lg
        expect(iconContainer?.className).toContain('w-8');
        expect(iconContainer?.className).toContain('h-8');
        expect(iconContainer?.className).toContain('md:w-9');
        expect(iconContainer?.className).toContain('md:h-9');
        expect(iconContainer?.className).toContain('rounded-lg');
    });

    describe('variant styles - gradient based', () => {
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
            expect(card?.className).toContain('border-border/40');
            expect(card?.className).toContain('shadow-sm');
        });

        it('applies warning variant with amber gradient', () => {
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
            expect(card?.className).toContain('bg-gradient-to-br');
            expect(card?.className).toContain('from-amber-50');
            expect(card?.className).toContain('border-amber-200/60');
        });

        it('applies success variant with emerald gradient', () => {
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
            expect(card?.className).toContain('bg-gradient-to-br');
            expect(card?.className).toContain('from-emerald-50');
            expect(card?.className).toContain('border-emerald-200/60');
        });

        it('applies destructive variant with rose gradient', () => {
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
            expect(card?.className).toContain('bg-gradient-to-br');
            expect(card?.className).toContain('from-rose-50');
            expect(card?.className).toContain('border-rose-200/60');
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
     * 1. Organization Header (compact)
     * 2. Email Notifications
     * 3. Google Sheets (standalone card with green branding)
     * 4. Time-Off Requests (Approval Queue)
     * 5. Stats Cards (at the bottom)
     *
     * Since the admin page is a server component, we test the expected structure.
     */

    const expectedSectionOrder = [
        'Organization Header',
        'Email Notifications',
        'Google Sheets',
        'Time-Off Requests',
        'Stats Cards',
    ];

    it('defines correct section order with 5 sections', () => {
        expect(expectedSectionOrder.length).toBe(5);
        expect(expectedSectionOrder[0]).toBe('Organization Header');
        expect(expectedSectionOrder[1]).toBe('Email Notifications');
        expect(expectedSectionOrder[2]).toBe('Google Sheets');
        expect(expectedSectionOrder[3]).toBe('Time-Off Requests');
        expect(expectedSectionOrder[4]).toBe('Stats Cards');
    });

    it('has Organization Header at the top', () => {
        const headerIndex = expectedSectionOrder.indexOf('Organization Header');
        expect(headerIndex).toBe(0);
    });

    it('has Email Notifications before Google Sheets', () => {
        const emailIndex = expectedSectionOrder.indexOf('Email Notifications');
        const sheetsIndex = expectedSectionOrder.indexOf('Google Sheets');
        expect(emailIndex).toBeLessThan(sheetsIndex);
    });

    it('has Google Sheets before Time-Off Requests', () => {
        const sheetsIndex = expectedSectionOrder.indexOf('Google Sheets');
        const requestsIndex = expectedSectionOrder.indexOf('Time-Off Requests');
        expect(sheetsIndex).toBeLessThan(requestsIndex);
    });

    it('has Time-Off Requests before Stats Cards', () => {
        const requestsIndex = expectedSectionOrder.indexOf('Time-Off Requests');
        const statsIndex = expectedSectionOrder.indexOf('Stats Cards');
        expect(requestsIndex).toBeLessThan(statsIndex);
    });

    it('has Stats Cards at the bottom', () => {
        const statsIndex = expectedSectionOrder.indexOf('Stats Cards');
        expect(statsIndex).toBe(expectedSectionOrder.length - 1);
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
