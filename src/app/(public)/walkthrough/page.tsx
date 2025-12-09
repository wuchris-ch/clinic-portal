import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default async function WalkthroughPage() {
    const walkthroughPath = path.join(process.cwd(), "WALKTHROUGH.md");
    let content = "";

    try {
        content = await fs.promises.readFile(walkthroughPath, "utf8");
    } catch (error) {
        console.error("Error reading WALKTHROUGH.md:", error);
        content = "# Error\n\nCould not load the walkthrough documentation.";
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6 dark:bg-indigo-950/30">
                        <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 dark:text-slate-100">
                        App Walkthrough
                    </h1>
                    A complete guide to using the Employee Portal.
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardContent className="p-8 lg:p-12">
                        <article className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                        </article>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
