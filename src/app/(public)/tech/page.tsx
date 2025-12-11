import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Cpu,
    Database,
    Cloud,
    GitBranch,
    Shield,
    Zap,
    Server,
    Code2,
    TestTube,
    Workflow
} from "lucide-react";
import Link from "next/link";

export default function TechPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-6 border border-emerald-500/20">
                        <Code2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                        Under the Hood
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A technical deep-dive into the architecture, tooling, and infrastructure powering this portal.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">Next.js 16</Badge>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">React 19</Badge>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">TypeScript</Badge>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">Supabase</Badge>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">Vercel</Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                {/* Core Stack */}
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <CardTitle>Core Stack</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <TechItem
                                title="Next.js 16"
                                subtitle="App Router"
                                description="Server Components, Server Actions, and streaming with React 19"
                            />
                            <TechItem
                                title="TypeScript"
                                subtitle="Strict Mode"
                                description="Full type safety with no implicit any, strict null checks"
                            />
                            <TechItem
                                title="Tailwind CSS v4"
                                subtitle="+ shadcn/ui"
                                description="Utility-first CSS with accessible, customizable components"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Database & Auth */}
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-lg">
                                <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle>Database & Authentication</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <TechItem
                                title="Supabase PostgreSQL"
                                subtitle="Row Level Security"
                                description="Fine-grained access control policies on every table"
                            />
                            <TechItem
                                title="Google OAuth"
                                subtitle="via Supabase Auth"
                                description="Secure third-party authentication with session management"
                            />
                            <TechItem
                                title="Edge Middleware"
                                subtitle="Server-side validation"
                                description="Auth checks at the edge before requests hit the server"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Data Pipeline */}
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-lg">
                                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <CardTitle>Data Pipeline & Integrations</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <TechItem
                                title="Google Sheets API"
                                subtitle="Service Account Auth"
                                description="Real-time form logging independent of email delivery status"
                            />
                            <TechItem
                                title="Gmail SMTP"
                                subtitle="Nodemailer + React Email"
                                description="Transactional emails with type-safe React templates"
                            />
                            <TechItem
                                title="Timezone Handling"
                                subtitle="date-fns-tz"
                                description="Pacific Time with automatic DST conversion"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Deployment */}
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                                <Cloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <CardTitle>Deployment & Infrastructure</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <TechItem
                                title="Vercel"
                                subtitle="Edge Network"
                                description="Automatic preview deployments for every branch"
                            />
                            <TechItem
                                title="Environment Config"
                                subtitle="Dev / Preview / Prod"
                                description="Isolated configurations for each deployment stage"
                            />
                            <TechItem
                                title="Edge Functions"
                                subtitle="Middleware"
                                description="Auth and routing logic running at the edge"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* CI/CD */}
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg">
                                <GitBranch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <CardTitle>CI/CD Pipeline</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                GitHub Actions workflow runs on every push and pull request:
                            </p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <PipelineStep icon={TestTube} label="Unit Tests" detail="Vitest + Coverage" />
                                <PipelineStep icon={Server} label="E2E Tests" detail="Playwright / Chromium" />
                                <PipelineStep icon={Shield} label="Lint & Types" detail="ESLint + tsc --noEmit" />
                                <PipelineStep icon={Workflow} label="Build Check" detail="Production validation" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Test reports and coverage artifacts retained for 7 days.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Architecture Diagram */}
                <Card className="border-border/50 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader className="pb-4">
                        <CardTitle>Request Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                            <pre className="text-slate-700 dark:text-slate-300 whitespace-pre">
                                {`User → Vercel Edge → Next.js Middleware (auth check)
                              ↓
                    App Router (Server Components)
                              ↓
            ┌─────────────────┼─────────────────┐
            ↓                 ↓                 ↓
      Supabase DB    Google Sheets API    Gmail SMTP
     (PostgreSQL)    (Service Account)   (Nodemailer)`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Back link */}
                <div className="text-center pt-8">
                    <Link
                        href="/walkthrough"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to App Walkthrough
                    </Link>
                </div>
            </div>
        </div>
    );
}

function TechItem({ title, subtitle, description }: { title: string; subtitle: string; description: string }) {
    return (
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-foreground">{title}</div>
            <div className="text-xs text-muted-foreground mb-2">{subtitle}</div>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function PipelineStep({ icon: Icon, label, detail }: { icon: React.ComponentType<{ className?: string }>; label: string; detail: string }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{detail}</div>
            </div>
        </div>
    );
}
