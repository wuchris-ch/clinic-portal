"use client";

import Link from "next/link";
import { Megaphone, CalendarOff, Clock, Briefcase, Calendar, ThermometerSun, Mail, BookOpen, Quote, AlertCircle, Award, FileText } from "lucide-react";

// Section data
const sections = [
    {
        id: "clinic-protocols",
        title: "Clinic Protocols",
        icon: AlertCircle,
        content: (
            <>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                    To adhere to clinic operational standards, our clinic has various protocols to perform clinic duties and responsibilities.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        For documents outlining each clinic protocol, click on the top left corner, and look under <span className="font-semibold">Documentation</span>.
                    </p>
                </div>
            </>
        ),
    },
    {
        id: "employee-handbook",
        title: "Employee Handbook",
        icon: BookOpen,
        content: (
            <>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                    Employers and Employees have duties to each other. For a mutually respectful working relationship, we have included the Employee Handbook.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-4 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-indigo-800 dark:text-indigo-200">
                        Click on the top left corner, and look under <span className="font-semibold">Documentation</span> for each chapter of the Employee Handbook.
                    </p>
                </div>
            </>
        ),
    },
    {
        id: "bc-employment-standards",
        title: "BC Employment Standards",
        icon: ScaleIcon,
        content: (
            <>
                <p className="text-muted-foreground leading-relaxed mb-4">
                    The full text of the B.C. Employment Standards is available online. If you have specific questions, please contact your employer. Alternatively, you can contact Employment Standards for clarification.
                </p>
                <a
                    href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96113_01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                    View BC Employment Standards →
                </a>
            </>
        ),
    },
    {
        id: "employee-merit-system",
        title: "Employee Merit System",
        icon: Award,
        content: (
            <>
                <p className="mb-4 text-muted-foreground">
                    Excellent patient service depends on efficient clinic flow and teamwork. Outstanding staff will earn merit points for the following:
                </p>
                <ul className="grid gap-3 mb-6">
                    {[
                        "Outstanding contribution recognized by co-workers",
                        "Excellent communications with the doctor",
                        "Dependability in attendance and following protocols",
                        "Taking on additional responsibilities during shortages"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-muted/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            <span className="text-sm text-foreground">{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-muted-foreground italic border-t border-border pt-4">
                    The Employee Merit System will be combined with the Employee Evaluation from time to time to recognize employee(s) for their work.
                </p>
            </>
        ),
    },
    {
        id: "employee-evaluation",
        title: "Employee Evaluation",
        icon: Quote,
        content: (
            <>
                <p className="text-muted-foreground leading-relaxed">
                    To maintain performance standards and provide feedback to you about your strengths and weaknesses, we will perform periodic evaluations. This may include quizzes, tests, as well as supervised performance of clinic tasks.
                </p>
            </>
        ),
    },
];

// Fallback icon for missing Scale icon
function ScaleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
    )
}

// Help topic cards
const helpTopics = [
    {
        id: "announcements",
        title: "Announcements",
        description: "Latest news and updates from the clinic",
        icon: Megaphone,
        href: "/announcements",
        clickable: true,
        color: "text-sky-600 dark:text-sky-400",
        bg: "bg-sky-50 dark:bg-sky-900/20",
        hoverBg: "group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30",
    },
    {
        id: "single-day-off",
        title: "Request Single Day Off",
        description: "Submit a request for a single day absence",
        icon: CalendarOff,
        href: "/forms/day-off",
        clickable: true,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        hoverBg: "group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30",
    },
    {
        id: "time-clock",
        title: "Adjust Time Clock",
        description: "Fix missed punches or time clock errors",
        icon: Clock,
        href: "/forms/time-clock",
        clickable: true,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        hoverBg: "group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30",
    },
    {
        id: "overtime",
        title: "Overtime Request",
        description: "Submit overtime hours for approval",
        icon: Briefcase,
        href: "/forms/overtime",
        clickable: true,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        hoverBg: "group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30",
    },
    {
        id: "vacation",
        title: "Request Vacation",
        description: "Plan your upcoming vacation time",
        icon: Calendar,
        href: "/forms/vacation",
        clickable: true,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        hoverBg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
    },
    {
        id: "sick-day",
        title: "Submit Sick Day",
        description: "Report an unexpected absence due to illness",
        icon: ThermometerSun,
        href: "/forms/sick-day",
        clickable: true,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30",
    },
];

function HelpTopicCard({ topic }: { topic: typeof helpTopics[0] }) {
    const Icon = topic.icon;
    const className = `group flex flex-col items-start p-6 rounded-2xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300 ${topic.clickable ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`;

    const content = (
        <>
            <div className={`p-3 rounded-xl ${topic.bg} ${topic.hoverBg} transition-colors mb-4`}>
                <Icon className={`w-8 h-8 ${topic.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{topic.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
        </>
    );

    if (topic.clickable) {
        return (
            <Link href={topic.href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <div className={className}>
            {content}
        </div>
    );
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-background border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Welcome to the Clinic of Dr. Steven Ma Employee Portal. Access resources, submit requests, and manage your schedule all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">
                            Employee Handbook and Forms
                        </div>
                        <div className="relative flex flex-col items-center">
                            <Link
                                href="https://docs.google.com/spreadsheets/d/1LO2QpKORnLL6XgRK__kiUREAe2t09NgnQW1MyRhgRwE/edit?gid=0#gid=0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 hover:shadow-sm transition-all duration-200 active:scale-95"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Syncs with Google Sheets
                            </Link>
                            <Link
                                href="https://docs.google.com/spreadsheets/d/1LO2QpKORnLL6XgRK__kiUREAe2t09NgnQW1MyRhgRwE/edit?gid=0#gid=0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-full mt-2 !text-[10px] md:!text-[11px] font-normal text-muted-foreground/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors leading-none pb-0.5 border-b border-transparent hover:border-emerald-600/50 whitespace-nowrap"
                            >
                                View Live Sheet →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                    {helpTopics.map((topic) => (
                        <HelpTopicCard key={topic.id} topic={topic} />
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-12 mb-20">
                    <div className="lg:w-1/3">
                        <div className="sticky top-8">
                            <h2 className="text-3xl font-bold text-foreground mb-4">
                                Important Information
                            </h2>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Please review the following sections carefully. They contain essential information regarding clinic protocols, expectations, and your rights as an employee.
                            </p>
                            <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Need Guidance?</h3>
                                        <p className="text-sm text-muted-foreground">Contact Dr. Ma confidentially</p>
                                    </div>
                                </div>
                                <a
                                    href="mailto:sma.eyemd@gmail.com"
                                    className="block w-full py-3 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-center rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                                >
                                    Email Dr. Ma
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 space-y-8">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <div key={section.id} className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 scroll-mt-24" id={section.id}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-slate-50 dark:bg-muted/50 rounded-xl">
                                            <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {section.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
