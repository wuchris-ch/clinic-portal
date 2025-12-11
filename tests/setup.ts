/**
 * Shared test utilities and setup for HR Employee Portal tests.
 */

import type { Page } from '@playwright/test';

// Common test constants
export const TEST_URLS = {
    // Public routes
    home: '/',
    announcements: '/announcements',
    documentation: '/documentation',
    walkthrough: '/walkthrough',
    tech: '/tech',

    // Public forms
    publicDayOff: '/forms/day-off',
    publicTimeClock: '/forms/time-clock',
    publicOvertime: '/forms/overtime',

    // Auth routes  
    login: '/login',
    register: '/register',

    // Protected app routes
    dashboard: '/dashboard',
    dashboardDayOff: '/dashboard/day-off',
    dashboardTimeClock: '/dashboard/time-clock',
    dashboardOvertime: '/dashboard/overtime',
    admin: '/admin',
    calendar: '/calendar',
} as const;

// Test data
export const TEST_USER = {
    email: 'test@example.com',
    name: 'Test User',
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

// Helper to check if element is visible
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
        return true;
    } catch {
        return false;
    }
}
