import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/components";
import { ApprovalEmail } from "@/components/emails/approval-email";
import { DenialEmail } from "@/components/emails/denial-email";
import { NewRequestEmail } from "@/components/emails/new-request-email";
import { TimeClockRequestEmail } from "@/components/emails/time-clock-request-email";
import { OvertimeRequestEmail } from "@/components/emails/overtime-request-email";
import { appendRowToSheet } from "@/lib/google-sheets";
import { format } from "date-fns";

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

// Get current date/time in Pacific Time
function getPSTTimestamp(includeTime: boolean = false): string {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  if (includeTime) {
    return format(pstDate, "yyyy-MM-dd HH:mm:ss");
  }
  return format(pstDate, "yyyy-MM-dd");
}

// Get notification recipients from database, falling back to env var
async function getNotificationRecipients(): Promise<string[]> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("notification_recipients")
      .select("email")
      .eq("is_active", true);

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

    // Fall back to env var if no recipients in DB
    const envEmails = process.env.NOTIFY_EMAILS;
    return envEmails ? envEmails.split(",").map((e) => e.trim()) : [];
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
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        await appendRowToSheet([
          submissionDate || getPSTTimestamp(), // A: Submission Date (PST)
          "Leave Request",                                    // B: Type
          employeeName,                                       // C: Name
          employeeEmail,                                      // D: Email
          leaveType,                                          // E: Leave Type
          startDate,                                          // F: Start Date
          endDate,                                            // G: End Date
          totalDays?.toString() || "0",                       // H: Total Days
          reason,                                             // I: Reason
          payPeriodLabel || "N/A",                            // J: Pay Period
          coverageName || "N/A",                              // K: Coverage Name
          requestId                                           // L: Request ID
        ], "Leave Requests");
        console.log("Leave request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log leave request to Sheets:", sheetError);
      }

      // Get notification recipients from database (with env var fallback)
      const notifyEmailsList = await getNotificationRecipients();
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
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        const timestamp = getPSTTimestamp(true); // PST timestamp
        const clockInStr = clockInDate ? `${clockInDate} ${clockInTime}` : "N/A";
        const clockOutStr = clockOutDate ? `${clockOutDate} ${clockOutTime}` : "N/A";

        await appendRowToSheet([
          timestamp,                  // A: Submission Date
          "Time Clock Request",       // B: Type
          employeeName,               // C: Name
          employeeEmail,              // D: Email
          clockInStr,                 // E: Clock In
          clockOutStr,                // F: Clock Out
          clockInReason || "",        // G: Reason In
          clockOutReason || "",       // H: Reason Out
          payPeriodLabel || "N/A"     // I: Pay Period
        ], "Time Clock");
        console.log("Time clock request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log time clock to Sheets:", sheetError);
      }

      const notifyEmailsList = await getNotificationRecipients();
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
      } = body;

      // Log to Google Sheets FIRST (before email check)
      try {
        const timestamp = getPSTTimestamp(true); // PST timestamp
        await appendRowToSheet([
          timestamp,                  // A: Submission Date
          "Overtime Request",         // B: Type
          employeeName,               // C: Name
          employeeEmail,              // D: Email
          overtimeDate,               // E: Overtime Date
          askedDoctor ? "Yes" : "No", // F: Asked Doctor
          seniorStaffName || "N/A",   // G: Senior Staff
          payPeriodLabel || "N/A"     // H: Pay Period
        ], "Overtime");
        console.log("Overtime request logged to Google Sheets");
      } catch (sheetError) {
        console.error("Failed to log overtime to Sheets:", sheetError);
      }

      const notifyEmailsList = await getNotificationRecipients();
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

    // Log notification to database
    const supabase = await createClient();
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
