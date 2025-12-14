"use client";

import { useState } from "react";
import {
  CalendarDays,
  Building2,
  Users,
  FileSpreadsheet,
  Bell,
  Clock,
  ClipboardList,
  CheckCircle2,
  Check,
  X,
  ChevronRight,
  Inbox,
  ArrowLeft,
} from "lucide-react";

// Sheet data for each tab
const sheetData = {
  vacation: [
    { employee: "Sarah Chen", start: "12/23/24", end: "12/27/24", reason: "Holiday travel", status: "Approved" },
    { employee: "Marcus Johnson", start: "12/02/24", end: "12/06/24", reason: "Conference", status: "Approved" },
    { employee: "Emily Rodriguez", start: "11/28/24", end: "11/29/24", reason: "Wedding", status: "Approved" },
  ],
  sick: [
    { employee: "James Wilson", start: "12/10/24", end: "12/10/24", reason: "Flu symptoms", status: "Approved" },
    { employee: "Maria Garcia", start: "12/05/24", end: "12/06/24", reason: "Doctor appointment", status: "Approved" },
  ],
  dayoff: [
    { employee: "Alex Thompson", start: "12/18/24", end: "12/18/24", reason: "Personal", status: "Approved" },
    { employee: "Lisa Park", start: "12/15/24", end: "12/15/24", reason: "Family event", status: "Approved" },
    { employee: "David Kim", start: "12/12/24", end: "12/12/24", reason: "Moving day", status: "Approved" },
  ],
  overtime: [
    { employee: "Sarah Chen", start: "12/01/24", end: "12/01/24", reason: "4 hours - Project deadline", status: "Approved" },
    { employee: "Marcus Johnson", start: "11/28/24", end: "11/28/24", reason: "2 hours - Client call", status: "Approved" },
  ],
};

const sheetTabs = [
  { id: "vacation", label: "Vacation Requests" },
  { id: "sick", label: "Sick Days" },
  { id: "dayoff", label: "Day Off" },
  { id: "overtime", label: "Overtime" },
] as const;

// Email data
const emails = [
  {
    id: 1,
    from: "StaffHub",
    subject: "New Vacation Request from Sarah Chen",
    preview: "Dec 23 - Dec 27, 2024 · Holiday travel to visit family",
    time: "2m ago",
    unread: true,
    body: `You have a new vacation request to review.

Employee: Sarah Chen
Type: Vacation
Dates: Dec 23 - Dec 27, 2024
Reason: Holiday travel to visit family

View this request in your dashboard:
https://staffhub.app/org/sunrise-clinic/admin`,
  },
  {
    id: 2,
    from: "StaffHub",
    subject: "New Sick Day Request from Marcus Johnson",
    preview: "Dec 16, 2024 · Not feeling well",
    time: "1h ago",
    unread: true,
    body: `You have a new sick day request to review.

Employee: Marcus Johnson
Type: Sick Day
Date: Dec 16, 2024
Reason: Not feeling well

View this request in your dashboard:
https://staffhub.app/org/sunrise-clinic/admin`,
  },
  {
    id: 3,
    from: "StaffHub",
    subject: "Request Approved: Your Day Off on Dec 20",
    preview: "Your day off request has been approved",
    time: "3h ago",
    unread: false,
    body: `Good news! Your time off request has been approved.

Type: Day Off
Date: Dec 20, 2024
Status: Approved

If you have any questions, please contact your manager.`,
  },
  {
    id: 4,
    from: "StaffHub",
    subject: "New Day Off Request from James Wilson",
    preview: "Dec 18, 2024 · Doctor appointment",
    time: "Yesterday",
    unread: false,
    body: `You have a new day off request to review.

Employee: James Wilson
Type: Day Off
Date: Dec 18, 2024
Reason: Doctor appointment

View this request in your dashboard:
https://staffhub.app/org/sunrise-clinic/admin`,
  },
];

export default function HomePage() {
  const [activeSheetTab, setActiveSheetTab] = useState<keyof typeof sheetData>("vacation");
  const [selectedEmail, setSelectedEmail] = useState<typeof emails[0] | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border rounded-lg mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
              <CalendarDays className="w-7 h-7 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              About StaffHub
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Time-off request management for clinics and small teams.
              Staff submit requests, admins review them, everything logs to Google Sheets.
            </p>
          </div>
        </div>
      </div>

      {/* Google Sheets Preview - Interactive */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Google Sheets Sync</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Every request logged automatically
            </h2>
            <p className="text-muted-foreground mb-6">
              Link your Google Sheet once. Every approved request gets logged instantly with employee name, dates, and status.
            </p>
            <ul className="space-y-3">
              <ListItem>Separate tabs for each request type</ListItem>
              <ListItem>Real-time sync on approval</ListItem>
              <ListItem>Your sheet, your data, full control</ListItem>
            </ul>
          </div>

          {/* Interactive Sheets mockup */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
            <div className="flex items-center gap-3 px-4 py-3 bg-green-600 text-white">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="text-sm font-medium">Time Off Requests - Sunrise Clinic</span>
            </div>
            <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
              {sheetTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSheetTab(tab.id)}
                  className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSheetTab === tab.id
                      ? "text-green-600 border-b-2 border-green-600 bg-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                    <th className="px-3 py-2 text-left font-medium border-r border-border">Employee</th>
                    <th className="px-3 py-2 text-left font-medium border-r border-border">Start</th>
                    <th className="px-3 py-2 text-left font-medium border-r border-border">End</th>
                    <th className="px-3 py-2 text-left font-medium border-r border-border">
                      {activeSheetTab === "overtime" ? "Hours/Notes" : "Reason"}
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {sheetData[activeSheetTab].map((row, idx) => (
                    <tr key={idx} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2.5 border-r border-border">{row.employee}</td>
                      <td className="px-3 py-2.5 border-r border-border">{row.start}</td>
                      <td className="px-3 py-2.5 border-r border-border">{row.end}</td>
                      <td className="px-3 py-2.5 border-r border-border">{row.reason}</td>
                      <td className="px-3 py-2.5 text-green-600">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
              <p className="text-[10px] text-muted-foreground">Click tabs to see different request types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Notifications Preview - Interactive */}
      <div className="bg-muted/30 border-y border-border my-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Email mockup */}
            <div className="order-2 lg:order-1 rounded-xl border border-border bg-card overflow-hidden shadow-lg">
              {selectedEmail ? (
                // Email detail view
                <>
                  <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-foreground">Back to Inbox</span>
                  </div>
                  <div className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">StaffHub</div>
                        <div className="text-xs text-muted-foreground">noreply@staffhub.app</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-foreground">{selectedEmail.subject}</div>
                  </div>
                  <div className="p-5">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed mb-4">
                      {selectedEmail.body}
                    </pre>
                    <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      View Request in Dashboard
                    </button>
                  </div>
                </>
              ) : (
                // Inbox view
                <>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                    <Inbox className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Inbox</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {emails.filter(e => e.unread).length} new
                    </span>
                  </div>
                  <div className="divide-y divide-border">
                    {emails.map((email) => (
                      <button
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                          email.unread ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            email.unread ? "bg-primary" : "bg-transparent"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className={`text-sm ${
                                email.unread ? "font-semibold text-foreground" : "text-muted-foreground"
                              }`}>
                                {email.from}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">{email.time}</span>
                            </div>
                            <div className={`text-sm truncate ${
                              email.unread ? "font-medium text-foreground" : "text-muted-foreground"
                            }`}>
                              {email.subject}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{email.preview}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 bg-muted/30 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">Tap an email to see the full message</p>
                  </div>
                </>
              )}
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-4">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Email Notifications</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Never miss a request
              </h2>
              <p className="text-muted-foreground mb-6">
                Get notified the moment a request comes in. Review and respond right from your inbox, or click through to your dashboard.
              </p>
              <ul className="space-y-3">
                <ListItem>Instant alerts for new requests</ListItem>
                <ListItem>One-click approve/deny from email</ListItem>
                <ListItem>Staff notified when decisions are made</ListItem>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold mb-4">
              1
            </div>
            <h3 className="font-medium text-foreground mb-2">Admin creates organization</h3>
            <p className="text-sm text-muted-foreground">
              Register your clinic or team, then link your own Google Sheet to log all submissions.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold mb-4">
              2
            </div>
            <h3 className="font-medium text-foreground mb-2">Staff join and submit requests</h3>
            <p className="text-sm text-muted-foreground">
              Team members register with your organization name, then submit vacation, sick day, or other time-off requests.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold mb-4">
              3
            </div>
            <h3 className="font-medium text-foreground mb-2">Admins review and approve</h3>
            <p className="text-sm text-muted-foreground">
              Receive email notifications, review requests in the dashboard, approve or deny with one click.
            </p>
          </div>
        </div>
      </div>

      {/* Team Calendar Preview */}
      <div className="bg-muted/30 border-y border-border my-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-4">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Team Calendar</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              See who&apos;s out at a glance
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Visual calendar shows approved time-off across your team. Plan coverage and avoid scheduling conflicts.
            </p>
          </div>

          {/* Calendar mockup */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg max-w-3xl mx-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold text-foreground ml-2">December 2024</span>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs text-muted-foreground py-2 font-medium">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {[22, 23, 24, 25, 26, 27, 28].map((date) => (
                  <div key={date} className="min-h-[80px] rounded-lg bg-muted/30 border border-border p-2">
                    <div className={`text-xs mb-2 ${date === 25 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {date}
                    </div>
                    {date >= 23 && date <= 27 && (
                      <div className="text-[10px] px-1.5 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 truncate">
                        Sarah - Vacation
                      </div>
                    )}
                    {date === 24 && (
                      <div className="text-[10px] px-1.5 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 truncate mt-1">
                        James - Day Off
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
          What you can do
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={ClipboardList}
            title="Submit time-off requests"
            description="Vacation, sick days, single days off, overtime, and time clock adjustments."
          />
          <FeatureCard
            icon={FileSpreadsheet}
            title="Google Sheets integration"
            description="Every submission is automatically logged - no manual data entry needed."
          />
          <FeatureCard
            icon={Bell}
            title="Email notifications"
            description="Admins notified on submission. Staff notified on approval or denial."
          />
          <FeatureCard
            icon={Users}
            title="Team calendar"
            description="View approved time-off across your team. See who's away on any given day."
          />
          <FeatureCard
            icon={Building2}
            title="Multi-organization"
            description="Each organization has isolated data, their own dashboard, and dedicated sheet."
          />
          <FeatureCard
            icon={Clock}
            title="Request history"
            description="Staff view their past requests. Admins can search and filter all requests."
          />
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="bg-muted/30 border-y border-border my-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
            Admin dashboard
          </h2>

          {/* Browser frame */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
            {/* Browser toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-md mx-auto h-7 rounded-md bg-muted flex items-center px-3">
                  <span className="text-xs text-muted-foreground">staffhub.app/org/sunrise-clinic/admin</span>
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Pending Requests</h3>
                  <p className="text-sm text-muted-foreground">3 requests waiting for review</p>
                </div>
              </div>

              {/* Request cards */}
              <div className="space-y-3">
                <RequestCard
                  name="Sarah Chen"
                  type="Vacation"
                  dates="Dec 23 - Dec 27, 2024"
                  reason="Holiday travel to visit family"
                  status="pending"
                  initials="SC"
                />
                <RequestCard
                  name="Marcus Johnson"
                  type="Sick Day"
                  dates="Dec 16, 2024"
                  reason="Not feeling well"
                  status="pending"
                  initials="MJ"
                />
                <RequestCard
                  name="Emily Rodriguez"
                  type="Day Off"
                  dates="Dec 20, 2024"
                  reason="Personal appointment"
                  status="pending"
                  initials="ER"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestCard({
  name,
  type,
  dates,
  reason,
  status,
  initials,
}: {
  name: string;
  type: string;
  dates: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  initials: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="font-medium text-foreground">{name}</div>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              status === "pending"
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : status === "approved"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            <span className="text-foreground">{type}</span> · {dates}
          </div>
          <div className="text-sm text-muted-foreground mb-3">{reason}</div>
          {status === "pending" && (
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium">
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border">
                <X className="w-3 h-3" />
                Deny
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-lg border border-border bg-card">
      <Icon className="w-5 h-5 text-primary mb-3" />
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
