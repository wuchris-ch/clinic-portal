import { createServiceClient } from '@/lib/supabase/server';

interface UploadResult {
    success: boolean;
    publicUrl?: string;
    error?: string;
}

/**
 * Upload a file to Supabase Storage and return a public URL.
 * 
 * @param fileBuffer - The file content as a Buffer
 * @param fileName - Name for the uploaded file
 * @param mimeType - MIME type of the file (e.g., 'application/pdf')
 * @returns Object containing success status and the public URL
 */
export async function uploadDoctorNote(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
): Promise<UploadResult> {
    try {
        const supabase = await createServiceClient();

        // Create a unique file path with timestamp to avoid collisions
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `doctor-notes/${timestamp}-${sanitizedFileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('sick-day-documents')
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return { success: false, error: uploadError.message };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('sick-day-documents')
            .getPublicUrl(filePath);

        return {
            success: true,
            publicUrl,
        };
    } catch (error) {
        console.error("Error uploading to Supabase Storage:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
