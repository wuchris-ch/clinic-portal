import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/components";
import { ApprovalEmail } from "@/components/emails/approval-email";
import { DenialEmail } from "@/components/emails/denial-email";
import { NewRequestEmail } from "@/components/emails/new-request-email";

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

    // Skip email sending if no Gmail credentials configured
    const transporter = getMailTransporter();
    if (!transporter) {
      console.log("Gmail credentials not configured, skipping email");
      return NextResponse.json({ success: true, emailSent: false });
    }

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

      // Get notification recipients from database (with env var fallback)
      const notifyEmailsList = await getNotificationRecipients();
      if (notifyEmailsList.length === 0) {
        console.log("No notification recipients configured, skipping admin notification");
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

    // Send email via Gmail
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
