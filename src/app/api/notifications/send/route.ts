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
      } = body;

      const notifyEmails = process.env.NOTIFY_EMAILS;
      if (!notifyEmails) {
        console.log("NOTIFY_EMAILS not configured, skipping admin notification");
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
          adminUrl: `${appUrl}/admin`,
        })
      );

      const emailResult = await transporter.sendMail({
        from: `StaffHub <${process.env.GMAIL_USER}>`,
        to: notifyEmails.split(",").map((e) => e.trim()),
        subject: `📋 New Time-Off Request from ${employeeName}`,
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
      subject = `✅ Time-Off Request Approved - ${leaveType}`;
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
      subject = `❌ Time-Off Request Denied - ${leaveType}`;
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
