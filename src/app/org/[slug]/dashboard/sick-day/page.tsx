import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SickDayForm } from "@/components/sick-day-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import type { PayPeriod, Organization, Profile } from "@/lib/types/database";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function SickDayPage({ params }: PageProps) {
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
                {/* Sick Day Form */}
                <Card className="border-border/50">
                    <CardHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Thermometer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle>{typedOrg?.name || "Organization"} - Sick Day Submission</CardTitle>
                            </div>
                        </div>
                        <CardDescription>
                            Use this form to report a sick day absence.
                        </CardDescription>
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">INSTRUCTIONS:</p>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                                <li>Submit this form as soon as possible when you are sick</li>
                                <li>If you have a doctor&apos;s note, please upload it with your submission</li>
                                <li>You will receive a confirmation email once your submission is processed</li>
                            </ul>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <SickDayForm
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
                        <CardTitle>Sick Day Policy</CardTitle>
                        <CardDescription>
                            Important information about sick leave
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Please notify us as early as possible when you are unable to work due to illness.
                            This helps us arrange coverage for your responsibilities.
                        </p>
                        <p>
                            If you are sick for more than 3 consecutive days, a doctor&apos;s note may be required
                            upon your return to work.
                        </p>
                        <p>
                            Take care of your health and get well soon!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
