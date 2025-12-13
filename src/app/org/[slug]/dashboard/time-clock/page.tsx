import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TimeClockRequestForm } from "@/components/time-clock-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { PayPeriod, Organization, Profile } from "@/lib/types/database";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function TimeClockPage({ params }: PageProps) {
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
                {/* Time Clock Request Form */}
                <Card className="border-border/50">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle>{typedOrg?.name || "Organization"} - Time Clock Adjustment</CardTitle>
                            </div>
                        </div>
                        <CardDescription>
                            Use this form to report missed clock-in or clock-out punches that need correction.
                        </CardDescription>
                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm">
                            <p className="font-semibold text-indigo-600 dark:text-indigo-400">INSTRUCTIONS:</p>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                                <li>Fill in only the sections that apply to your situation</li>
                                <li>You can submit a missed clock-in, clock-out, or both</li>
                                <li>Please provide an explanation for each missed punch</li>
                            </ul>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <TimeClockRequestForm
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
                        <CardTitle>About Time Clock Adjustments</CardTitle>
                        <CardDescription>
                            Important information about time clock corrections
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Time clock adjustments are for correcting missed punches only. If you forgot to clock in or out,
                            please submit this form as soon as possible.
                        </p>
                        <p>
                            Your request will be reviewed and processed within 48 hours. You will receive an email
                            confirmation once your adjustment has been made.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
