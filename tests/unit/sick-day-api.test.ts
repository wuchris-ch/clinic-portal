import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests: Sick Day API Route
 * 
 * Tests verify:
 * - Google Sheets logging works independently of Gmail
 * - Supabase Storage upload is called when doctor note is provided
 * - FormData parsing works correctly
 */

// Mock dependencies
const mockAppendRowToSheet = vi.fn().mockResolvedValue(true);
const mockUploadDoctorNote = vi.fn().mockResolvedValue({
    success: true,
    publicUrl: 'https://supabase.co/storage/v1/object/public/sick-day-documents/test.pdf'
});
const mockCreateClient = vi.fn().mockResolvedValue({
    from: () => ({
        select: () => ({
            eq: () => ({ data: [{ email: 'admin@test.com' }], error: null })
        })
    })
});

vi.mock('@/lib/google-sheets', () => ({
    appendRowToSheet: (...args: unknown[]) => mockAppendRowToSheet(...args),
}));

vi.mock('@/lib/google-drive', () => ({
    uploadDoctorNote: (...args: unknown[]) => mockUploadDoctorNote(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => mockCreateClient(),
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

vi.mock('@/components/emails/sick-day-email', () => ({ SickDayEmail: vi.fn() }));

describe('Sick Day API - FormData Handling', () => {
    const originalEnv = process.env;
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        console.log = vi.fn();
        console.error = vi.fn();
        // Ensure Google Sheets IS configured
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com';
        process.env.GOOGLE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----';
        process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
        process.env.NOTIFY_EMAILS = 'admin@example.com';
    });

    afterEach(() => {
        process.env = originalEnv;
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
    });

    it('should reject non-sick_day_request types', async () => {
        const { POST } = await import('@/app/api/sick-day/submit/route');

        const formData = new FormData();
        formData.append('type', 'wrong_type');

        const request = new Request('http://localhost/api/sick-day/submit', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe('Invalid request type');
    });

    it('should log to Google Sheets even without Gmail configured', async () => {
        delete process.env.GMAIL_USER;
        delete process.env.GMAIL_APP_PASSWORD;

        const { POST } = await import('@/app/api/sick-day/submit/route');

        const formData = new FormData();
        formData.append('type', 'sick_day_request');
        formData.append('employeeName', 'John Doe');
        formData.append('employeeEmail', 'john@example.com');
        formData.append('payPeriodLabel', 'Period 1 (Dec 16 - Dec 31, 2025)');
        formData.append('submissionDate', '2025-12-11');
        formData.append('sickDate', '2025-12-10');
        formData.append('hasDoctorNote', 'false');

        const request = new Request('http://localhost/api/sick-day/submit', {
            method: 'POST',
            body: formData,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(mockAppendRowToSheet).toHaveBeenCalled();
        expect(mockAppendRowToSheet).toHaveBeenCalledWith(
            expect.arrayContaining(['John Doe', 'john@example.com']),
            'Sick Days'
        );
        expect(data.success).toBe(true);
        expect(data.emailSent).toBe(false);
    });

    it('should call uploadDoctorNote when hasDoctorNote is true and file provided', async () => {
        const { POST } = await import('@/app/api/sick-day/submit/route');

        const formData = new FormData();
        formData.append('type', 'sick_day_request');
        formData.append('employeeName', 'Jane Doe');
        formData.append('employeeEmail', 'jane@example.com');
        formData.append('payPeriodLabel', 'Period 2');
        formData.append('submissionDate', '2025-12-11');
        formData.append('sickDate', '2025-12-10');
        formData.append('hasDoctorNote', 'true');

        // Create a mock file
        const fileContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // PDF magic bytes
        const file = new File([fileContent], 'doctor_note.pdf', { type: 'application/pdf' });
        formData.append('doctorNote', file);

        const request = new Request('http://localhost/api/sick-day/submit', {
            method: 'POST',
            body: formData,
        });

        await POST(request);

        expect(mockUploadDoctorNote).toHaveBeenCalled();
        expect(mockUploadDoctorNote).toHaveBeenCalledWith(
            expect.any(Buffer),
            expect.stringContaining('Jane Doe'),
            'application/pdf'
        );
    });

    it('should NOT call uploadDoctorNote when hasDoctorNote is false', async () => {
        const { POST } = await import('@/app/api/sick-day/submit/route');

        const formData = new FormData();
        formData.append('type', 'sick_day_request');
        formData.append('employeeName', 'No Note User');
        formData.append('employeeEmail', 'nonote@example.com');
        formData.append('payPeriodLabel', 'Period 1');
        formData.append('submissionDate', '2025-12-11');
        formData.append('sickDate', '2025-12-10');
        formData.append('hasDoctorNote', 'false');

        const request = new Request('http://localhost/api/sick-day/submit', {
            method: 'POST',
            body: formData,
        });

        await POST(request);

        expect(mockUploadDoctorNote).not.toHaveBeenCalled();
    });

    it('should include doctor note link in Sheets when upload succeeds', async () => {
        const { POST } = await import('@/app/api/sick-day/submit/route');

        const formData = new FormData();
        formData.append('type', 'sick_day_request');
        formData.append('employeeName', 'Link Test');
        formData.append('employeeEmail', 'link@example.com');
        formData.append('payPeriodLabel', 'Period 1');
        formData.append('submissionDate', '2025-12-11');
        formData.append('sickDate', '2025-12-10');
        formData.append('hasDoctorNote', 'true');

        const file = new File([new Uint8Array([1, 2, 3])], 'note.pdf', { type: 'application/pdf' });
        formData.append('doctorNote', file);

        const request = new Request('http://localhost/api/sick-day/submit', {
            method: 'POST',
            body: formData,
        });

        await POST(request);

        // Verify the URL was included in the Sheets call
        expect(mockAppendRowToSheet).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.stringContaining('supabase.co') // The mock URL
            ]),
            'Sick Days'
        );
    });

    it('should log N/A for doctor note link when upload fails', async () => {
        mockUploadDoctorNote.mockResolvedValueOnce({
            success: false,
            error: 'Upload failed'
        });

        const { POST } = await import('@/app/api/sick-day/submit/route');

        const formData = new FormData();
        formData.append('type', 'sick_day_request');
        formData.append('employeeName', 'Fail Test');
        formData.append('employeeEmail', 'fail@example.com');
        formData.append('payPeriodLabel', 'Period 1');
        formData.append('submissionDate', '2025-12-11');
        formData.append('sickDate', '2025-12-10');
        formData.append('hasDoctorNote', 'true');

        const file = new File([new Uint8Array([1, 2, 3])], 'note.pdf', { type: 'application/pdf' });
        formData.append('doctorNote', file);

        const request = new Request('http://localhost/api/sick-day/submit', {
            method: 'POST',
            body: formData,
        });

        await POST(request);

        // Should still log to sheets with N/A for the link
        expect(mockAppendRowToSheet).toHaveBeenCalledWith(
            expect.arrayContaining(['N/A']),
            'Sick Days'
        );
    });
});
