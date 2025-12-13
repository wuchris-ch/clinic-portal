import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OvertimeRequestForm } from "@/components/overtime-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import type { PayPeriod, Organization, Profile } from "@/lib/types/database";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function OvertimePage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const userEmail = user.email ?? "";

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const typedProfile = profile as Profile | null;

    // Get organization
    const { data: organization } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    const typedOrg = organization as Organization | null;

    // Fetch pay periods (current and upcoming only)
    const today = new Date().toISOString().split("T")[0];
    const { data: payPeriodsData } = await supabase
        .from("pay_periods")
        .select("*")
        .gte("end_date", today)
        .order("start_date", { ascending: true });

    const payPeriods = (payPeriodsData || []) as PayPeriod[];

    return (
        <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Overtime Request Form */}
                <Card className="border-border/50">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Timer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <CardTitle>{typedOrg?.name || "Organization"} - Overtime Submission</CardTitle>
                            </div>
                        </div>
                        <CardDescription>
                            Use this form to submit overtime hours you have worked.
                        </CardDescription>
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                            <p className="font-semibold text-orange-600 dark:text-orange-400">IMPORTANT:</p>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                                <li>Overtime must be pre-approved by a doctor or senior staff</li>
                                <li>Submit this form on the same day you worked overtime</li>
                                <li>Unapproved overtime may not be compensated</li>
                            </ul>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <OvertimeRequestForm
                            payPeriods={payPeriods}
                            userEmail={typedProfile?.email || userEmail}
                            userName={typedProfile?.full_name || "Staff Member"}
                            googleSheetId={typedOrg?.google_sheet_id ?? undefined}
                            organizationId={typedOrg?.id}
                        />
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-border/50 h-fit">
                    <CardHeader>
                        <CardTitle>Overtime Policy</CardTitle>
                        <CardDescription>
                            Guidelines for overtime work
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            All overtime must be approved in advance by a doctor or senior staff member.
                            Working overtime without prior approval may result in the hours not being compensated.
                        </p>
                        <p>
                            Please submit your overtime on the same day it occurs to ensure accurate record-keeping.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
