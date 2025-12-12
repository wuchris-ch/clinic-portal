import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit Tests: Doctor Note Upload Utility (Supabase Storage)
 * 
 * Tests the uploadDoctorNote function for file handling and error cases.
 */

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
    createServiceClient: vi.fn().mockResolvedValue({
        storage: {
            from: () => ({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            }),
        },
    }),
}));

describe('Doctor Note Upload Utility', () => {
    const originalConsoleError = console.error;

    beforeEach(() => {
        vi.clearAllMocks();
        console.error = vi.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('returns success with public URL on successful upload', async () => {
        mockUpload.mockResolvedValue({ error: null });
        mockGetPublicUrl.mockReturnValue({
            data: { publicUrl: 'https://supabase.co/storage/v1/object/public/sick-day-documents/test.pdf' }
        });

        const { uploadDoctorNote } = await import('@/lib/google-drive');

        const result = await uploadDoctorNote(
            Buffer.from('test content'),
            'test-note.pdf',
            'application/pdf'
        );

        expect(result.success).toBe(true);
        expect(result.publicUrl).toContain('supabase.co');
        expect(mockUpload).toHaveBeenCalledWith(
            expect.stringContaining('doctor-notes/'),
            expect.any(Buffer),
            expect.objectContaining({
                contentType: 'application/pdf',
                upsert: false,
            })
        );
    });

    it('returns error when upload fails', async () => {
        mockUpload.mockResolvedValue({ error: { message: 'Upload quota exceeded' } });

        const { uploadDoctorNote } = await import('@/lib/google-drive');

        const result = await uploadDoctorNote(
            Buffer.from('test content'),
            'test-note.pdf',
            'application/pdf'
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Upload quota exceeded');
    });

    it('sanitizes file names to remove special characters', async () => {
        mockUpload.mockResolvedValue({ error: null });
        mockGetPublicUrl.mockReturnValue({
            data: { publicUrl: 'https://supabase.co/storage/test.pdf' }
        });

        const { uploadDoctorNote } = await import('@/lib/google-drive');

        await uploadDoctorNote(
            Buffer.from('test'),
            'John Doe - Doctor Note - 2025-12-11.pdf',
            'application/pdf'
        );

        // Should sanitize special characters (spaces, dashes become underscores)
        expect(mockUpload).toHaveBeenCalledWith(
            expect.stringMatching(/doctor-notes\/\d+-John_Doe_-_Doctor_Note_-_2025-12-11\.pdf/),
            expect.any(Buffer),
            expect.any(Object)
        );
    });

    it('includes timestamp in file path for uniqueness', async () => {
        mockUpload.mockResolvedValue({ error: null });
        mockGetPublicUrl.mockReturnValue({
            data: { publicUrl: 'https://supabase.co/storage/test.pdf' }
        });

        const { uploadDoctorNote } = await import('@/lib/google-drive');

        await uploadDoctorNote(
            Buffer.from('test'),
            'note.pdf',
            'application/pdf'
        );

        // File path should include a timestamp
        expect(mockUpload).toHaveBeenCalledWith(
            expect.stringMatching(/doctor-notes\/\d{13}-note\.pdf/),
            expect.any(Buffer),
            expect.any(Object)
        );
    });
});
