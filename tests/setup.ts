/**
 * Shared test utilities and setup for HR Employee Portal tests.
 */

import type { Page } from '@playwright/test';

// Test admin account (must exist in local Supabase)
// See scripts/test-login-info.md for setup details
export const TEST_ADMIN = {
    email: 'test@org.com',
    password: 'testadmin',
    name: 'Test Admin',
} as const;

// Test staff account (must exist in local Supabase)
export const TEST_STAFF = {
    email: 'test@staff.com',
    password: 'teststaff',
    name: 'Test Staff',
} as const;

// Test organization (the org that TEST_ADMIN belongs to)
export const TEST_ORG = {
    name: 'Test Organization',
    slug: 'testorg',
    adminEmail: TEST_ADMIN.email,
    adminName: TEST_ADMIN.name,
    adminPassword: TEST_ADMIN.password,
} as const;

// Secondary test organization for isolation tests
export const TEST_ORG_2 = {
    name: 'Another Clinic',
    slug: 'another-clinic',
    adminEmail: 'admin@anotherclinic.com',
    adminName: 'Another Admin',
    adminPassword: 'testpass456',
} as const;

// Common test constants
export const TEST_URLS = {
    // Public routes
    home: '/',
    documentation: '/documentation',

    // Auth routes
    login: '/login',
    register: '/register',
    registerOrg: '/register-org',

    // Legacy protected routes (being phased out)
    legacyDashboard: '/dashboard',
    legacyAdmin: '/admin',
    legacyCalendar: '/calendar',
} as const;

/**
 * Generate org-scoped URLs for a given organization slug
 */
export function getOrgUrls(orgSlug: string) {
    const basePath = `/org/${orgSlug}`;
    return {
        announcements: `${basePath}/announcements`,
        dashboard: `${basePath}/dashboard`,
        dashboardDayOff: `${basePath}/dashboard/day-off`,
        dashboardTimeClock: `${basePath}/dashboard/time-clock`,
        dashboardOvertime: `${basePath}/dashboard/overtime`,
        dashboardVacation: `${basePath}/dashboard/vacation`,
        dashboardSickDay: `${basePath}/dashboard/sick-day`,
        admin: `${basePath}/admin`,
        adminEmployees: `${basePath}/admin/employees`,
        calendar: `${basePath}/calendar`,
    } as const;
}

// Default test org URLs
export const TEST_ORG_URLS = getOrgUrls(TEST_ORG.slug);
export const TEST_ORG_2_URLS = getOrgUrls(TEST_ORG_2.slug);

// Test data
export const TEST_USER = {
    email: 'test@example.com',
    name: 'Test User',
};

export const TEST_STAFF_USER = {
    email: 'staff@testclinic.com',
    name: 'Test Staff Member',
    password: 'staffpass123',
};

// Form field test data
export const SAMPLE_DAY_OFF_DATA = {
    name: 'Test Employee',
    email: 'test@example.com',
    date: new Date().toISOString().split('T')[0],
    reason: 'Personal appointment',
};

export const SAMPLE_TIME_CLOCK_DATA = {
    name: 'Test Employee',
    email: 'test@example.com',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00',
    clockOut: '17:00',
};

export const SAMPLE_OVERTIME_DATA = {
    name: 'Test Employee',
    email: 'test@example.com',
    overtimeHours: 2,
    reason: 'Project deadline',
};

export const SAMPLE_SICK_DAY_DATA = {
    name: 'Test Employee',
    email: 'test@example.com',
    sickDate: new Date().toISOString().split('T')[0],
    hasDoctorNote: false,
};

// Helper to check if element is visible
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
        return true;
    } catch {
        return false;
    }
}

/**
 * Helper to wait for URL to match a pattern or specific URL
 */
export async function waitForUrl(page: Page, urlPattern: string | RegExp, timeout = 10000): Promise<void> {
    await page.waitForURL(urlPattern, { timeout });
}

/**
 * Helper to check if user is on an org-scoped route
 */
export function isOrgScopedRoute(url: string): boolean {
    return /\/org\/[^/]+/.test(url);
}

/**
 * Extract org slug from current URL
 */
export function getOrgSlugFromUrl(url: string): string | null {
    const match = url.match(/\/org\/([^/]+)/);
    return match ? match[1] : null;
}

/**
 * Helper to verify user is redirected to their org's dashboard
 */
export async function expectOrgDashboardRedirect(page: Page, expectedOrgSlug?: string): Promise<void> {
    await page.waitForURL(/\/org\/[^/]+\/dashboard/, { timeout: 10000 });
    const currentUrl = page.url();
    const orgSlug = getOrgSlugFromUrl(currentUrl);

    if (expectedOrgSlug) {
        if (orgSlug !== expectedOrgSlug) {
            throw new Error(`Expected org slug ${expectedOrgSlug}, but got ${orgSlug}`);
        }
    }
}
