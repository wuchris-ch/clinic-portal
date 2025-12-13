"use client";

import Link from "next/link";
import { CalendarDays, Building2, Users, FileSpreadsheet, Bell, Clock, ClipboardList, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                            <CalendarDays className="w-7 h-7 text-primary" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                            StaffHub
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Time-off request management for clinics and small teams.
                            Staff submit requests, admins review them, everything logs to Google Sheets.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                            <Link
                                href="/register-org"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                <Building2 className="w-4 h-4" />
                                Register Organization
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Joining an existing organization?{" "}
                            <Link href="/register" className="text-primary hover:underline">
                                Register as staff
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

            {/* Features */}
            <div className="bg-muted/30 border-y border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
                        What you can do
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={ClipboardList}
                            title="Submit time-off requests"
                            description="Vacation, sick days, single days off, overtime, and time clock adjustments. Each request type has its own form."
                        />
                        <FeatureCard
                            icon={FileSpreadsheet}
                            title="Google Sheets integration"
                            description="Link your own spreadsheet. Every submission is automatically logged - no manual data entry needed."
                        />
                        <FeatureCard
                            icon={Bell}
                            title="Email notifications"
                            description="Admins are notified when requests are submitted. Staff are notified when requests are approved or denied."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Team calendar"
                            description="View approved time-off across your team. See who's away on any given day."
                        />
                        <FeatureCard
                            icon={Building2}
                            title="Multi-organization support"
                            description="Each organization has isolated data, their own dashboard, and a dedicated Google Sheet."
                        />
                        <FeatureCard
                            icon={Clock}
                            title="Request history"
                            description="Staff can view their past requests and current status. Admins can search and filter all requests."
                        />
                    </div>
                </div>
            </div>

            {/* Request Types */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">
                    Supported request types
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <RequestType label="Vacation" description="Multi-day time off with date range" />
                    <RequestType label="Sick Day" description="Single or multi-day with optional doctor's note" />
                    <RequestType label="Single Day Off" description="One day leave for any reason" />
                    <RequestType label="Overtime" description="Record extra hours worked" />
                    <RequestType label="Time Clock Adjustment" description="Fix missed punches or errors" />
                </div>
            </div>

            {/* For Admins / For Staff */}
            <div className="bg-muted/30 border-y border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                For Admins
                            </h3>
                            <ul className="space-y-3">
                                <ListItem>Dashboard with pending requests queue</ListItem>
                                <ListItem>Approve or deny with one click</ListItem>
                                <ListItem>Full request history with search</ListItem>
                                <ListItem>Manage notification recipients</ListItem>
                                <ListItem>Employee list and role management</ListItem>
                                <ListItem>Link your Google Sheet for automatic logging</ListItem>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                For Staff
                            </h3>
                            <ul className="space-y-3">
                                <ListItem>Submit requests from any device</ListItem>
                                <ListItem>View status of submitted requests</ListItem>
                                <ListItem>See team calendar for coverage planning</ListItem>
                                <ListItem>Email confirmation when requests are decided</ListItem>
                                <ListItem>Upload documents (e.g., doctor notes)</ListItem>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Get Started */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                        Get started
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                        Create your organization to get a dashboard URL. Link your Google Sheet from Admin Settings, then invite your team to register.
                    </p>
                    <Link
                        href="/register-org"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Register Organization
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">StaffHub</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link href="/documentation" className="hover:text-foreground transition-colors">
                                Documentation
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
    return (
        <div className="p-5 rounded-lg border border-border bg-card">
            <Icon className="w-5 h-5 text-primary mb-3" />
            <h3 className="font-medium text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function RequestType({ label, description }: { label: string; description: string }) {
    return (
        <div className="p-4 rounded-lg border border-border bg-card">
            <div className="font-medium text-foreground">{label}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
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
