"use client";

import Link from "next/link";
import { ArrowLeft, FileText, BookOpen, ClipboardList } from "lucide-react";
import { useOrganization } from "@/components/organization-context";

// Documentation sections - empty for now, can be populated later
const documentationSections = [
  {
    id: "clinic-protocols",
    title: "Clinic Protocols",
    description: "Operational standards and procedures for clinic duties",
    icon: ClipboardList,
    documents: [],
  },
  {
    id: "employee-handbook",
    title: "Employee Handbook",
    description: "Policies, duties, and expectations for employees",
    icon: BookOpen,
    documents: [],
  },
  {
    id: "forms",
    title: "Forms",
    description: "Downloadable forms for various requests",
    icon: FileText,
    documents: [],
  },
];

export default function DocumentationPage() {
  const { basePath } = useOrganization();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-blue-500 py-8 rounded-xl shadow-sm">
        <div className="px-6 lg:px-8">
          <Link href={`${basePath}/announcements`} className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Announcements
          </Link>
          <h1 className="text-3xl font-bold text-white">Documentation</h1>
          <p className="text-white/80 mt-2">
            Clinic protocols, handbooks, and forms
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {documentationSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{section.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{section.description}</p>

                  {section.documents.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {section.documents.map((doc: { id: string; title: string; href: string }) => (
                        <li key={doc.id}>
                          <a
                            href={doc.href}
                            className="text-blue-600 hover:underline text-sm flex items-center gap-2 dark:text-blue-400"
                          >
                            <FileText className="w-4 h-4" />
                            {doc.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-gray-400 italic">
                      No documents available yet. Check back soon.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
