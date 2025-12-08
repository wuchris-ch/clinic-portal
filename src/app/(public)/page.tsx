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
                <p className="mb-4 text-slate-600 leading-relaxed">
                    To adhere to clinic operational standards, our clinic has various protocols to perform clinic duties and responsibilities.
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
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
                <p className="mb-4 text-slate-600 leading-relaxed">
                    Employers and Employees have duties to each other. For a mutually respectful working relationship, we have included the Employee Handbook.
                </p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-indigo-800">
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
                <p className="text-slate-600 leading-relaxed mb-4">
                    The full text of the B.C. Employment Standards is available online. If you have specific questions, please contact your employer. Alternatively, you can contact Employment Standards for clarification.
                </p>
                <a
                    href="https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96113_01"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
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
                <p className="mb-4 text-slate-600">
                    Excellent patient service depends on efficient clinic flow and teamwork. Outstanding staff will earn merit points for the following:
                </p>
                <ul className="grid gap-3 mb-6">
                    {[
                        "Outstanding contribution recognized by co-workers",
                        "Excellent communications with the doctor",
                        "Dependability in attendance and following protocols",
                        "Taking on additional responsibilities during shortages"
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{item}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-slate-500 italic border-t pt-4">
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
                <p className="text-slate-600 leading-relaxed">
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
        color: "text-sky-600",
        bg: "bg-sky-50",
        hoverBg: "group-hover:bg-sky-100",
    },
    {
        id: "single-day-off",
        title: "Request Single Day Off",
        description: "Submit a request for a single day absence",
        icon: CalendarOff,
        href: "/dashboard",
        clickable: true,
        color: "text-amber-600",
        bg: "bg-amber-50",
        hoverBg: "group-hover:bg-amber-100",
    },
    {
        id: "time-clock",
        title: "Adjust Time Clock",
        description: "Fix missed punches or time clock errors",
        icon: Clock,
        href: "/dashboard",
        clickable: true,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        hoverBg: "group-hover:bg-indigo-100",
    },
    {
        id: "overtime",
        title: "Overtime Request",
        description: "Submit overtime hours for approval",
        icon: Briefcase,
        href: "/dashboard",
        clickable: true,
        color: "text-orange-600",
        bg: "bg-orange-50",
        hoverBg: "group-hover:bg-orange-100",
    },
    {
        id: "vacation",
        title: "Request Vacation",
        description: "Plan your upcoming vacation time",
        icon: Calendar,
        href: "#",
        clickable: false,
        color: "text-blue-600",
        bg: "bg-blue-50",
        hoverBg: "group-hover:bg-blue-100",
    },
    {
        id: "sick-day",
        title: "Submit Sick Day",
        description: "Report an unexpected absence due to illness",
        icon: ThermometerSun,
        href: "#",
        clickable: false,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        hoverBg: "group-hover:bg-emerald-100",
    },
];

function HelpTopicCard({ topic }: { topic: typeof helpTopics[0] }) {
    const Icon = topic.icon;
    const className = `group flex flex-col items-start p-6 rounded-2xl border border-border/50 bg-white shadow-sm transition-all duration-300 ${topic.clickable ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`;

    const content = (
        <>
            <div className={`p-3 rounded-xl ${topic.bg} ${topic.hoverBg} transition-colors mb-4`}>
                <Icon className={`w-8 h-8 ${topic.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{topic.description}</p>
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
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                        How can we help you?
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                        Welcome to the Clinic of Dr. Steven Ma Employee Portal. Access resources, submit requests, and manage your schedule all in one place.
                    </p>
                    <div className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
                        Employee Handbook and Forms
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
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">
                                Important Information
                            </h2>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                Please review the following sections carefully. They contain essential information regarding clinic protocols, expectations, and your rights as an employee.
                            </p>
                            <div className="p-6 bg-white rounded-2xl border border-border/50 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Need Guidance?</h3>
                                        <p className="text-sm text-slate-500">Contact Dr. Ma confidentially</p>
                                    </div>
                                </div>
                                <a
                                    href="mailto:sma.eyemd@gmail.com"
                                    className="block w-full py-3 px-4 bg-slate-900 text-white text-center rounded-xl font-medium hover:bg-slate-800 transition-colors"
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
                                <div key={section.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 scroll-mt-24" id={section.id}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-slate-50 rounded-xl">
                                            <Icon className="w-6 h-6 text-slate-700" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                                    </div>
                                    <div className="text-slate-600">
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
