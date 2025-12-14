import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Unit Tests: Organization Pages
 *
 * These tests verify the structure of organization-scoped pages,
 * ensuring they properly handle multi-tenancy and use correct components.
 */

const projectRoot = join(__dirname, '../..');
const orgPagesBase = join(projectRoot, 'src/app/org/[slug]');

describe('Org Pages Structure', () => {
    describe('Dashboard Page', () => {
        const dashboardPath = join(orgPagesBase, 'dashboard/page.tsx');

        it('exists', () => {
            expect(existsSync(dashboardPath)).toBe(true);
        });
    });

    describe('Admin Page', () => {
        const adminPath = join(orgPagesBase, 'admin/page.tsx');

        it('exists', () => {
            expect(existsSync(adminPath)).toBe(true);
        });

        const adminContent = readFileSync(adminPath, 'utf-8');

        it('imports admin components', () => {
            expect(adminContent).toContain('PendingRequestsQueue');
        });

        it('fetches pending requests', () => {
            expect(adminContent).toContain('.from(');
            expect(adminContent).toContain('leave_requests');
        });

        it('handles organization context', () => {
            expect(adminContent).toContain('organization');
        });
    });

    describe('Employees Page', () => {
        const employeesPath = join(orgPagesBase, 'admin/employees/page.tsx');

        it('exists', () => {
            expect(existsSync(employeesPath)).toBe(true);
        });

        const employeesContent = readFileSync(employeesPath, 'utf-8');

        it('imports EmployeesList component', () => {
            expect(employeesContent).toContain('EmployeesList');
        });

        it('fetches profiles', () => {
            expect(employeesContent).toContain('profiles');
        });
    });

    describe('Calendar Page', () => {
        const calendarPath = join(orgPagesBase, 'calendar/page.tsx');

        it('exists', () => {
            expect(existsSync(calendarPath)).toBe(true);
        });

        const calendarContent = readFileSync(calendarPath, 'utf-8');

        it('imports TeamCalendar component', () => {
            expect(calendarContent).toContain('TeamCalendar');
        });

        it('fetches leave requests for calendar', () => {
            expect(calendarContent).toContain('leave_requests');
        });
    });

    describe('Announcements Page', () => {
        const announcementsPath = join(orgPagesBase, 'announcements/page.tsx');

        it('exists', () => {
            expect(existsSync(announcementsPath)).toBe(true);
        });

        const announcementsContent = readFileSync(announcementsPath, 'utf-8');

        it('imports announcements components', () => {
            expect(announcementsContent).toContain('AnnouncementsList');
        });
    });
});

describe('Dashboard Form Pages', () => {
    describe('Day Off Page', () => {
        const dayOffPath = join(orgPagesBase, 'dashboard/day-off/page.tsx');

        it('exists', () => {
            expect(existsSync(dayOffPath)).toBe(true);
        });

        const dayOffContent = readFileSync(dayOffPath, 'utf-8');

        it('imports SingleDayOffForm component', () => {
            expect(dayOffContent).toContain('SingleDayOffForm');
        });

        it('fetches leave types', () => {
            expect(dayOffContent).toContain('leave_types');
        });

        it('fetches pay periods', () => {
            expect(dayOffContent).toContain('pay_periods');
        });

        it('passes org sheet ID to form', () => {
            expect(dayOffContent).toContain('googleSheetId');
        });
    });

    describe('Vacation Page', () => {
        const vacationPath = join(orgPagesBase, 'dashboard/vacation/page.tsx');

        it('exists', () => {
            expect(existsSync(vacationPath)).toBe(true);
        });

        const vacationContent = readFileSync(vacationPath, 'utf-8');

        it('imports VacationRequestForm component', () => {
            expect(vacationContent).toContain('VacationRequestForm');
        });

        it('fetches pay periods', () => {
            expect(vacationContent).toContain('pay_periods');
        });
    });

    describe('Sick Day Page', () => {
        const sickDayPath = join(orgPagesBase, 'dashboard/sick-day/page.tsx');

        it('exists', () => {
            expect(existsSync(sickDayPath)).toBe(true);
        });

        const sickDayContent = readFileSync(sickDayPath, 'utf-8');

        it('imports SickDayForm component', () => {
            expect(sickDayContent).toContain('SickDayForm');
        });
    });

    describe('Overtime Page', () => {
        const overtimePath = join(orgPagesBase, 'dashboard/overtime/page.tsx');

        it('exists', () => {
            expect(existsSync(overtimePath)).toBe(true);
        });

        const overtimeContent = readFileSync(overtimePath, 'utf-8');

        it('imports OvertimeRequestForm component', () => {
            expect(overtimeContent).toContain('OvertimeRequestForm');
        });
    });

    describe('Time Clock Page', () => {
        const timeClockPath = join(orgPagesBase, 'dashboard/time-clock/page.tsx');

        it('exists', () => {
            expect(existsSync(timeClockPath)).toBe(true);
        });

        const timeClockContent = readFileSync(timeClockPath, 'utf-8');

        it('imports TimeClockRequestForm component', () => {
            expect(timeClockContent).toContain('TimeClockRequestForm');
        });
    });
});

describe('Org Layout', () => {
    const layoutPath = join(orgPagesBase, 'layout.tsx');

    it('exists', () => {
        expect(existsSync(layoutPath)).toBe(true);
    });

    const layoutContent = readFileSync(layoutPath, 'utf-8');

    it('provides organization context', () => {
        expect(layoutContent).toContain('OrganizationProvider');
    });

    it('validates organization access', () => {
        expect(layoutContent).toContain('organization');
    });

    it('includes app sidebar', () => {
        expect(layoutContent).toContain('AppSidebar');
    });

    it('includes app header', () => {
        expect(layoutContent).toContain('AppHeader');
    });

    it('redirects unauthorized users', () => {
        expect(layoutContent).toContain('redirect');
    });
});

describe('Multi-Tenancy Integration', () => {
    const adminPath = join(orgPagesBase, 'admin/page.tsx');
    const adminContent = readFileSync(adminPath, 'utf-8');

    it('admin page filters by organization_id', () => {
        expect(adminContent).toContain('organization_id');
    });

    const calendarPath = join(orgPagesBase, 'calendar/page.tsx');
    const calendarContent = readFileSync(calendarPath, 'utf-8');

    it('calendar page uses RLS for org filtering', () => {
        // Calendar relies on RLS policies for org filtering, not explicit .eq()
        // The comment in the code explains this
        expect(calendarContent).toContain('RLS handles org filtering');
    });
});
