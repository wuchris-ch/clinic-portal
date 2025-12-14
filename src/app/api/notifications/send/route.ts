import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createServiceClient } from "@/lib/supabase/server";
import { render } from "@react-email/components";
import { ApprovalEmail } from "@/components/emails/approval-email";
import { DenialEmail } from "@/components/emails/denial-email";
import { NewRequestEmail } from "@/components/emails/new-request-email";
import { TimeClockRequestEmail } from "@/components/emails/time-clock-request-email";
import { OvertimeRequestEmail } from "@/components/emails/overtime-request-email";
import { appendRowToSheet } from "@/lib/google-sheets";
import { SHEET_TAB_NAMES } from "@/lib/constants/google-sheets";
import { getPSTDateTime } from "@/lib/utils";

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
      // Fall back to env var if database query fails
      const envEmails = process.env.NOTIFY_EMAILS;
      return envEmails ? envEmails.split(",").map((e) => e.trim()) : [];
    }

    // If we have recipients in DB, use those
    if (data && data.length > 0) {
      return data.map((r: { email: string }) => r.email);
    }

    // If DB returned successful but empty list, it means "Send to No One" (Admin disabled all)
    return [];
  } catch (err) {
    console.error("Error in getNotificationRecipients:", err);
    // Fall back to env var on any error
    const envEmails = process.env.NOTIFY_EMAILS;
    return envEmails ? envEmails.split(",").map((e) => e.trim()) : [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    // Get mail transporter (may be null if credentials not configured)
    const transporter = getMailTransporter();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Handle vacation request notifications (sent to admins) - logs to a separate Sheet tab
    if (type === "vacation_request") {
      const {
        requestId,
        employeeName,
        employeeEmail,
        startDate,
        endDate,
        totalDays,
        submissionDate,
        payPeriodLabel,
        coverageName,
        coverageEmail,
        notes,
        googleSheetId, // Optional org-specific sheet ID
        organizationId, // For filtering notification recipients
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        const pst = getPSTDateTime();
        await appendRowToSheet(
          [
            submissionDate || pst.date,            // A: Submission Date (PST)
            pst.time,                              // B: Time of Day (PST)
            pst.dayOfWeek,                         // C: Day of Week
            "Vacation Request",                    // D: Type
            employeeName,                          // E: Name
            employeeEmail,                         // F: Email
            startDate,                             // G: Vacation Start Date
            endDate,                               // H: Vacation End Date
            totalDays?.toString() || "0",          // I: Weekdays Count (Mon-Fri)
            payPeriodLabel || "N/A",               // J: Pay Periods (selected)
            coverageName || "N/A",                 // K: Coverage Name
            coverageEmail || "N/A",                // L: Coverage Email
            notes || "N/A",                        // M: Notes
          ],
          SHEET_TAB_NAMES.VACATION,
          googleSheetId // Pass org-specific sheet ID (undefined falls back to global)
        );
        console.log("Vacation request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log vacation request to Sheets:", sheetError);
      }

      // Get notification recipients from database for this org
      const notifyEmailsList = await getNotificationRecipients(organizationId);
      if (notifyEmailsList.length === 0 || !transporter) {
        console.log(
          !transporter
            ? "Gmail not configured, skipping email (Sheets logged)"
            : "No notification recipients configured"
        );
        return NextResponse.json({ success: true, emailSent: false });
      }

      const isSameDay = startDate === endDate;

      const emailHtml = await render(
        NewRequestEmail({
          employeeName,
          employeeEmail,
          leaveType: "Vacation",
          startDate,
          endDate,
          isSameDay,
          reason: notes || "Vacation request",
          totalDays,
          submissionDate,
          payPeriodLabel,
          coverageName,
          coverageEmail,
          adminUrl: `${appUrl}/admin`,
        })
      );

      const emailResult = await transporter.sendMail({
        from: `StaffHub <${process.env.GMAIL_USER}>`,
        to: notifyEmailsList,
        subject: `New Vacation Request from ${employeeName}`,
        html: emailHtml,
      });

      console.log(`Admin notification sent for vacation request ${requestId}`);
      return NextResponse.json({
        success: true,
        emailSent: true,
        id: emailResult?.messageId,
      });
    }

    // Handle new request notifications (sent to admins)
    if (type === "new_request") {
      const {
        requestId,
        employeeName,
        employeeEmail,
        leaveType,
        startDate,
        endDate,
        reason,
        totalDays,
        coverageName,
        coverageEmail,
        submissionDate,
        payPeriodLabel,
        googleSheetId, // Optional org-specific sheet ID
        organizationId, // For filtering notification recipients
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        const pst = getPSTDateTime();
        await appendRowToSheet([
          submissionDate || pst.date,                           // A: Submission Date (PST)
          pst.time,                                             // B: Time of Day (PST)
          pst.dayOfWeek,                                        // C: Day of Week
          "Leave Request",                                      // D: Type
          employeeName,                                         // E: Name
          employeeEmail,                                        // F: Email
          leaveType,                                            // G: Leave Type
          startDate,                                            // H: Start Date
          endDate,                                              // I: End Date
          totalDays?.toString() || "0",                         // J: Total Days
          reason,                                               // K: Reason
          payPeriodLabel || "N/A",                              // L: Pay Period
          coverageName || "N/A",                                // M: Coverage Name
          coverageEmail || "N/A"                                // N: Coverage Email
        ], SHEET_TAB_NAMES.DAY_OFF, googleSheetId);
        console.log("Day off request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log leave request to Sheets:", sheetError);
      }

      // Get notification recipients from database for this org
      const notifyEmailsList = await getNotificationRecipients(organizationId);
      if (notifyEmailsList.length === 0 || !transporter) {
        console.log(!transporter
          ? "Gmail not configured, skipping email (Sheets logged)"
          : "No notification recipients configured");
        return NextResponse.json({ success: true, emailSent: false });
      }

      const isSameDay = startDate === endDate;

      const emailHtml = await render(
        NewRequestEmail({
          employeeName,
          employeeEmail,
          leaveType,
          startDate,
          endDate,
          isSameDay,
          reason,
          totalDays,
          submissionDate,
          payPeriodLabel,
          coverageName,
          coverageEmail,
          adminUrl: `${appUrl}/admin`,
        })
      );

      const emailResult = await transporter.sendMail({
        from: `StaffHub <${process.env.GMAIL_USER}>`,
        to: notifyEmailsList,
        subject: `New Time-Off Request from ${employeeName}`,
        html: emailHtml,
      });

      console.log(`Admin notification sent for request ${requestId}`);
      return NextResponse.json({ success: true, emailSent: true, id: emailResult?.messageId });
    }

    // Handle time clock request notifications (sent to admins)
    if (type === "time_clock_request") {
      const {
        employeeName,
        employeeEmail,
        payPeriodLabel,
        clockInDate,
        clockInTime,
        clockInReason,
        clockOutDate,
        clockOutTime,
        clockOutReason,
        googleSheetId,
        organizationId,
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        const pst = getPSTDateTime();
        const clockInStr = clockInDate ? `${clockInDate} ${clockInTime}` : "N/A";
        const clockOutStr = clockOutDate ? `${clockOutDate} ${clockOutTime}` : "N/A";

        await appendRowToSheet([
          pst.date,                     // A: Submission Date
          pst.time,                     // B: Time of Day
          pst.dayOfWeek,                // C: Day of Week
          "Time Clock Request",         // D: Type
          employeeName,                 // E: Name
          employeeEmail,                // F: Email
          clockInStr,                   // G: Clock In
          clockOutStr,                  // H: Clock Out
          clockInReason || "",          // I: Reason In
          clockOutReason || "",         // J: Reason Out
          payPeriodLabel || "N/A"       // K: Pay Period
        ], SHEET_TAB_NAMES.TIME_CLOCK, googleSheetId);
        console.log("Time clock request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log time clock to Sheets:", sheetError);
      }

      const notifyEmailsList = await getNotificationRecipients(organizationId);
      if (notifyEmailsList.length === 0 || !transporter) {
        console.log(!transporter
          ? "Gmail not configured, skipping email (Sheets logged)"
          : "No notification recipients configured");
        return NextResponse.json({ success: true, emailSent: false });
      }

      const emailHtml = await render(
        TimeClockRequestEmail({
          employeeName,
          employeeEmail,
          payPeriodLabel,
          clockInDate,
          clockInTime,
          clockInReason,
          clockOutDate,
          clockOutTime,
          clockOutReason,
        })
      );

      const emailResult = await transporter.sendMail({
        from: `StaffHub <${process.env.GMAIL_USER}>`,
        to: notifyEmailsList,
        subject: `Time Clock Request from ${employeeName}`,
        html: emailHtml,
      });

      console.log(`Time clock request notification sent for ${employeeName}`);
      return NextResponse.json({ success: true, emailSent: true, id: emailResult?.messageId });
    }

    // Handle overtime request notifications (sent to admins)
    if (type === "overtime_request") {
      const {
        employeeName,
        employeeEmail,
        payPeriodLabel,
        overtimeDate,
        askedDoctor,
        seniorStaffName,
        googleSheetId,
        organizationId,
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        const pst = getPSTDateTime();
        await appendRowToSheet([
          pst.date,                     // A: Submission Date
          pst.time,                     // B: Time of Day
          pst.dayOfWeek,                // C: Day of Week
          "Overtime Request",           // D: Type
          employeeName,                 // E: Name
          employeeEmail,                // F: Email
          overtimeDate,                 // G: Overtime Date
          askedDoctor ? "Yes" : "No",   // H: Asked Doctor
          seniorStaffName || "N/A",     // I: Senior Staff
          payPeriodLabel || "N/A"       // J: Pay Period
        ], SHEET_TAB_NAMES.OVERTIME, googleSheetId);
        console.log("Overtime request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log overtime to Sheets:", sheetError);
      }

      const notifyEmailsList = await getNotificationRecipients(organizationId);
      if (notifyEmailsList.length === 0 || !transporter) {
        console.log(!transporter
          ? "Gmail not configured, skipping email (Sheets logged)"
          : "No notification recipients configured");
        return NextResponse.json({ success: true, emailSent: false });
      }

      const emailHtml = await render(
        OvertimeRequestEmail({
          employeeName,
          employeeEmail,
          payPeriodLabel,
          overtimeDate,
          askedDoctor,
          seniorStaffName,
        })
      );

      const emailResult = await transporter.sendMail({
        from: `StaffHub <${process.env.GMAIL_USER}>`,
        to: notifyEmailsList,
        subject: `Overtime Submission from ${employeeName}`,
        html: emailHtml,
      });

      console.log(`Overtime request notification sent for ${employeeName}`);
      return NextResponse.json({ success: true, emailSent: true, id: emailResult?.messageId });
    }

    // Handle approval/denial notifications (sent to employee)
    const {
      requestId,
      userId,
      userEmail,
      userName,
      startDate,
      endDate,
      leaveType,
      adminNotes,
    } = body;

    // Log notification to database (use service client - RLS requires service_role for insert)
    const supabase = await createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("notifications").insert({
      user_id: userId,
      request_id: requestId,
      type,
      email_sent: false,
    });

    const isSameDay = startDate === endDate;

    // Render React email to HTML
    let emailHtml: string;
    let subject: string;

    if (type === "approved") {
      emailHtml = await render(
        ApprovalEmail({
          userName,
          leaveType,
          startDate,
          endDate,
          isSameDay,
          dashboardUrl: `${appUrl}/dashboard`,
        })
      );
      subject = `Time-Off Request Approved - ${leaveType}`;
    } else {
      emailHtml = await render(
        DenialEmail({
          userName,
          leaveType,
          startDate,
          endDate,
          isSameDay,
          adminNotes,
          dashboardUrl: `${appUrl}/dashboard`,
        })
      );
      subject = `Time-Off Request Denied - ${leaveType}`;
    }

    // Send email via Gmail (skip if not configured)
    if (!transporter) {
      console.log("Gmail not configured, skipping approval/denial email");
      return NextResponse.json({ success: true, emailSent: false });
    }

    const emailResult = await transporter.sendMail({
      from: `StaffHub <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject,
      html: emailHtml,
    });

    // Update notification record
    if (emailResult?.messageId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("notifications")
        .update({ email_sent: true })
        .eq("request_id", requestId)
        .eq("type", type);
    }

    return NextResponse.json({ success: true, emailSent: true, id: emailResult?.messageId });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
