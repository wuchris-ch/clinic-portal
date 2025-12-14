import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { SickDayEmail } from "@/components/emails/sick-day-email";
import { appendRowToSheet } from "@/lib/google-sheets";
import { SHEET_TAB_NAMES } from "@/lib/constants/google-sheets";
import { uploadDoctorNote } from "@/lib/google-drive";
import { getPSTDateTime } from "@/lib/utils";
import { createServiceClient } from "@/lib/supabase/server";

function getMailTransporter() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return null;
    }
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

// Get notification recipients from database for a specific organization
// Uses service client to bypass RLS (API route may not have user session)
async function getNotificationRecipients(organizationId?: string): Promise<string[]> {
    try {
        const supabase = await createServiceClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = (supabase as any)
            .from("notification_recipients")
            .select("email")
            .eq("is_active", true);

        // Filter by organization if provided
        if (organizationId) {
            query = query.eq("organization_id", organizationId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching notification recipients:", error);
            const envEmails = process.env.NOTIFY_EMAILS;
            return envEmails ? envEmails.split(",").map((e) => e.trim()) : [];
        }

        if (data && data.length > 0) {
            return data.map((r: { email: string }) => r.email);
        }

        return [];
    } catch (err) {
        console.error("Error in getNotificationRecipients:", err);
        const envEmails = process.env.NOTIFY_EMAILS;
        return envEmails ? envEmails.split(",").map((e) => e.trim()) : [];
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const type = formData.get("type") as string;

        if (type !== "sick_day_request") {
            return NextResponse.json(
                { success: false, error: "Invalid request type" },
                { status: 400 }
            );
        }

        const employeeName = formData.get("employeeName") as string;
        const employeeEmail = formData.get("employeeEmail") as string;
        const payPeriodLabel = formData.get("payPeriodLabel") as string || null;
        const submissionDate = formData.get("submissionDate") as string;
        const sickDate = formData.get("sickDate") as string;
        const hasDoctorNote = formData.get("hasDoctorNote") === "true";
        const doctorNoteFile = formData.get("doctorNote") as File | null;
        const googleSheetId = formData.get("googleSheetId") as string || undefined;
        const organizationId = formData.get("organizationId") as string || undefined;

        let doctorNoteLink: string | null = null;

        // Upload doctor note to Supabase Storage if provided
        if (hasDoctorNote && doctorNoteFile && doctorNoteFile.size > 0) {
            const buffer = Buffer.from(await doctorNoteFile.arrayBuffer());
            const fileName = `${employeeName} - Doctor Note - ${sickDate} - ${doctorNoteFile.name}`;

            const uploadResult = await uploadDoctorNote(
                buffer,
                fileName,
                doctorNoteFile.type
            );

            if (uploadResult.success && uploadResult.publicUrl) {
                doctorNoteLink = uploadResult.publicUrl;
                console.log("Doctor note uploaded to Supabase:", doctorNoteLink);
            } else {
                console.warn("Failed to upload doctor note:", uploadResult.error);
            }
        }

        // Log to Google Sheets
        try {
            const pst = getPSTDateTime();
            await appendRowToSheet([
                submissionDate || pst.date,          // A: Submission Date
                pst.time,                             // B: Time
                pst.dayOfWeek,                        // C: Day
                employeeName,                         // D: Employee Name
                employeeEmail,                        // E: Email
                payPeriodLabel || "N/A",              // F: Pay Period
                sickDate,                             // G: Sick Date
                hasDoctorNote ? "Yes" : "No",         // H: Has Doctor Note
                doctorNoteLink || "N/A",              // I: Doctor Note Link
            ], SHEET_TAB_NAMES.SICK_DAY, googleSheetId);
            console.log("Sick day logged to Google Sheets");
        } catch (sheetError) {
            console.error("Failed to log sick day to Sheets:", sheetError);
        }

        // Get mail transporter and recipients for this org
        const transporter = getMailTransporter();
        const notifyEmailsList = await getNotificationRecipients(organizationId);

        if (notifyEmailsList.length === 0 || !transporter) {
            console.log(!transporter
                ? "Gmail not configured, skipping email (Sheets logged)"
                : "No notification recipients configured");
            return NextResponse.json({ success: true, emailSent: false });
        }

        // Send email notification
        const emailHtml = await render(
            SickDayEmail({
                employeeName,
                employeeEmail,
                payPeriodLabel,
                submissionDate,
                sickDate,
                hasDoctorNote,
                doctorNoteLink,
            })
        );

        const emailResult = await transporter.sendMail({
            from: `StaffHub <${process.env.GMAIL_USER}>`,
            to: notifyEmailsList,
            subject: `Sick Day Submission from ${employeeName}`,
            html: emailHtml,
        });

        console.log(`Sick day notification sent for ${employeeName}`);
        return NextResponse.json({
            success: true,
            emailSent: true,
            id: emailResult?.messageId,
            doctorNoteLink,
        });
    } catch (error) {
        console.error("Sick day submission error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit sick day" },
            { status: 500 }
        );
    }
}
