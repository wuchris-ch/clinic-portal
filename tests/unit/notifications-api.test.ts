import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests: Notifications API Route Control Flow
 * 
 * These tests verify that Google Sheets logging happens INDEPENDENTLY
 * of Gmail configuration. This prevents the bug where no Gmail credentials
 * would block ALL functionality including Sheets logging.
 */

// Mock dependencies
const mockAppendRowToSheet = vi.fn().mockResolvedValue(true);
const mockCreateClient = vi.fn().mockResolvedValue({
    from: () => ({
        select: () => ({
            eq: () => ({ data: [], error: null })
        })
    })
});

vi.mock('@/lib/google-sheets', () => ({
    appendRowToSheet: (...args: unknown[]) => mockAppendRowToSheet(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockCreateClient(),
}));

vi.mock('nodemailer', () => ({
    default: {
        createTransport: vi.fn().mockReturnValue(null), // Simulate no Gmail
    },
}));

vi.mock('@react-email/components', () => ({
    render: vi.fn().mockResolvedValue('<html></html>'),
}));

vi.mock('@/components/emails/approval-email', () => ({ ApprovalEmail: vi.fn() }));
vi.mock('@/components/emails/denial-email', () => ({ DenialEmail: vi.fn() }));
vi.mock('@/components/emails/new-request-email', () => ({ NewRequestEmail: vi.fn() }));
vi.mock('@/components/emails/time-clock-request-email', () => ({ TimeClockRequestEmail: vi.fn() }));
vi.mock('@/components/emails/overtime-request-email', () => ({ OvertimeRequestEmail: vi.fn() }));

describe('Notifications API - Gmail Independence', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        // Ensure Google Sheets IS configured
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
        process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
        process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Google Sheets logs even when Gmail is NOT configured', () => {
        beforeEach(() => {
            // Explicitly remove Gmail credentials
            delete process.env.GMAIL_USER;
            delete process.env.GMAIL_APP_PASSWORD;
        });

        it('should call appendRowToSheet for new_request even without Gmail', async () => {
            const { POST } = await import('@/app/api/notifications/send/route');

            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_request',
                    requestId: 'test-123',
                    employeeName: 'John Doe',
                    employeeEmail: 'john@example.com',
                    leaveType: 'Single Day Off',
                    startDate: '2025-12-10',
                    endDate: '2025-12-10',
                    reason: 'Personal',
                    totalDays: 1,
                    submissionDate: '2025-12-09',
                    payPeriodLabel: 'Period 1',
                    coverageName: null,
                    coverageEmail: null,
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            // The key assertion: Sheets should be called even with no Gmail
            expect(mockAppendRowToSheet).toHaveBeenCalled();
            expect(mockAppendRowToSheet).toHaveBeenCalledWith(
                expect.arrayContaining(['Leave Request']),
                'Leave Requests'
            );

            // Response should indicate success (sheets logged) but no email sent
            expect(data.success).toBe(true);
            expect(data.emailSent).toBe(false);
        });

        it('should call appendRowToSheet for time_clock_request even without Gmail', async () => {
            const { POST } = await import('@/app/api/notifications/send/route');

            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'time_clock_request',
                    employeeName: 'John Doe',
                    employeeEmail: 'john@example.com',
                    payPeriodLabel: 'Period 1',
                    clockInDate: '2025-12-10',
                    clockInTime: '09:00 AM',
                    clockInReason: 'Forgot',
                    clockOutDate: null,
                    clockOutTime: null,
                    clockOutReason: null,
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(mockAppendRowToSheet).toHaveBeenCalled();
            expect(mockAppendRowToSheet).toHaveBeenCalledWith(
                expect.arrayContaining(['Time Clock Request']),
                'Time Clock'
            );
            expect(data.success).toBe(true);
            expect(data.emailSent).toBe(false);
        });

        it('should call appendRowToSheet for overtime_request even without Gmail', async () => {
            const { POST } = await import('@/app/api/notifications/send/route');

            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'overtime_request',
                    employeeName: 'John Doe',
                    employeeEmail: 'john@example.com',
                    payPeriodLabel: 'Period 1',
                    overtimeDate: '2025-12-10',
                    askedDoctor: true,
                    seniorStaffName: null,
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(mockAppendRowToSheet).toHaveBeenCalled();
            expect(mockAppendRowToSheet).toHaveBeenCalledWith(
                expect.arrayContaining(['Overtime Request']),
                'Overtime'
            );
            expect(data.success).toBe(true);
            expect(data.emailSent).toBe(false);
        });
    });

    describe('Regression guard: API should NOT have early return blocking Sheets', () => {
        it('should NOT return early when Gmail is not configured', async () => {
            delete process.env.GMAIL_USER;
            delete process.env.GMAIL_APP_PASSWORD;

            const { POST } = await import('@/app/api/notifications/send/route');

            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_request',
                    employeeName: 'Test User',
                    employeeEmail: 'test@example.com',
                    leaveType: 'Test',
                    startDate: '2025-12-10',
                    endDate: '2025-12-10',
                    reason: 'Test',
                    totalDays: 1,
                }),
            });

            await POST(request);

            // If this assertion fails, it means the API returned early
            // before reaching the Sheets logging code (the original bug!)
            expect(mockAppendRowToSheet).toHaveBeenCalledTimes(1);
        });
    });
});
