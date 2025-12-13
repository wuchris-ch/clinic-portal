import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests: Notifications API Route Control Flow
 * 
 * These tests verify that Google Sheets logging happens INDEPENDENTLY
 * of Gmail configuration. This prevents the bug where no Gmail credentials
 * would block ALL functionality including Sheets logging.
 */

// Mock dependencies
vi.mock('@/components/emails/overtime-request-email', () => ({ OvertimeRequestEmail: vi.fn() }));

// Mock dependencies
const mockAppendRowToSheet = vi.fn().mockResolvedValue(true);
const mockCreateClient = vi.fn().mockResolvedValue({
    from: () => ({
        select: () => ({
            eq: () => ({ data: [{ email: 'test@db.com' }], error: null })
        })
    })
});

vi.mock('@/lib/google-sheets', () => ({
    appendRowToSheet: (...args: unknown[]) => mockAppendRowToSheet(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
    createServiceClient: () => mockCreateClient(),
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
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        // Suppress console.log and error during tests (keeps test output clean)
        console.log = vi.fn();
        console.error = vi.fn();
        // Ensure Google Sheets IS configured
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
        process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
        process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
        // Ensure Notification Emails are configured (for fallback, ensures logic proceeds to email sending)
        process.env.NOTIFY_EMAILS = 'admin@example.com';
    });

    afterEach(() => {
        process.env = originalEnv;
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
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
                'Day Off Requests',
                undefined // googleSheetId
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
                'Time Clock Adjustments',
                undefined // googleSheetId
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
                'Overtime Requests',
                undefined // googleSheetId
            );
            expect(data.success).toBe(true);
            expect(data.emailSent).toBe(false);
        });

        it('should call appendRowToSheet for vacation_request into Vacation Request sheet even without Gmail', async () => {
            const { POST } = await import('@/app/api/notifications/send/route');

            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'vacation_request',
                    requestId: 'vac-123',
                    employeeName: 'John Doe',
                    employeeEmail: 'john@example.com',
                    startDate: '2026-01-02',
                    endDate: '2026-01-10',
                    totalDays: 6,
                    submissionDate: '2025-12-11',
                    payPeriodLabel: 'PP1 (ending 2025-12-31); PP2 (ending 2026-01-15)',
                    coverageName: 'Jane Smith',
                    coverageEmail: 'jane@example.com',
                    notes: 'Booked flights',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(mockAppendRowToSheet).toHaveBeenCalled();
            expect(mockAppendRowToSheet).toHaveBeenCalledWith(
                expect.arrayContaining(['Vacation Request']),
                'Vacation Requests',
                undefined // googleSheetId
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

    describe('System Resilience', () => {
        it('should still Log to Google Sheets even if Supabase fails', async () => {
            // Mock Supabase to throw error
            mockCreateClient.mockRejectedValueOnce(new Error('Supabase Down'));

            const { POST } = await import('@/app/api/notifications/send/route');
            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_request',
                    employeeName: 'Resilience Test',
                    leaveType: 'Test',
                }),
            });

            const response = await POST(request);

            // Sheets logging happens BEFORE Supabase call, so it must succeed
            expect(mockAppendRowToSheet).toHaveBeenCalled();

            // Should verify successful response despite Supabase error (handled gracefully)
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        it('should still send Email even if Google Sheets logging fails', async () => {
            // Mock Sheets to fail
            mockAppendRowToSheet.mockRejectedValueOnce(new Error('Sheets API Error'));

            // Ensure Gmail is Configured
            process.env.GMAIL_USER = 'test@gmail.com';
            process.env.GMAIL_APP_PASSWORD = 'password';

            const { POST } = await import('@/app/api/notifications/send/route');
            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_request',
                    employeeName: 'Sheets Fail Test',
                    leaveType: 'Test',
                }),
            });

            // Mock transporter.sendMail
            const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
            // We need to re-mock nodemailer here because the top-level mock returns null by default 
            // but we need it to return a transporter now.
            // Since top-level mock is strict, let's use the one established in beforeEach? 
            // Actually beforeEach sets process.env but the mock factory runs once.
            // We need to spy on nodemailer.createTransport or re-import.
            // EASIER: The top-level mock is:
            // vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn().mockReturnValue(null) } }));

            // We need to override this.
            const nodemailer = await import('nodemailer');
            // @ts-expect-error - mocking nodemailer in test
            nodemailer.default.createTransport.mockReturnValue({
                sendMail: mockSendMail
            });

            await POST(request);

            // Verify Sheets was ATTEMPTED
            expect(mockAppendRowToSheet).toHaveBeenCalled();

            // Verify Email was SENT (failure in sheets shouldn't block email)
            expect(mockSendMail).toHaveBeenCalled();
        });
    });

    describe('Recipient Logic', () => {
        it('should RESPECT empty DB list (Admin disabled) and NOT fall back to Env Var', async () => {
            // Mock CreateClient to return empty list (Simulate Admin disabled all)
            mockCreateClient.mockResolvedValueOnce({
                from: () => ({
                    select: () => ({
                        eq: () => ({ data: [], error: null })
                    })
                })
            });

            // Ensure Env Var IS set (to prove we ignore it when DB is healthy but empty)
            process.env.NOTIFY_EMAILS = 'fallback@example.com';

            // Ensure Gmail IS set (so transporter exists)
            process.env.GMAIL_USER = 'test@gmail.com';
            process.env.GMAIL_APP_PASSWORD = 'password';

            // Mock SendMail
            const nodemailer = await import('nodemailer');
            const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
            // @ts-expect-error - mocking nodemailer in test
            nodemailer.default.createTransport.mockReturnValue({
                sendMail: mockSendMail
            });

            const { POST } = await import('@/app/api/notifications/send/route');
            const request = new Request('http://localhost/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'new_request',
                    employeeName: 'Logic Test',
                    leaveType: 'Test',
                    startDate: '2025-01-01',
                    endDate: '2025-01-01',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            // Should be success: true (Sheets logged)
            expect(data.success).toBe(true);

            // But emailSent: false (because recipient list was empty)
            expect(data.emailSent).toBe(false);

            // And sendMail NOT called (proving we ignored NOTIFY_EMAILS fallback)
            expect(mockSendMail).not.toHaveBeenCalled();
        });
    });
});
