import { createClient } from "@/lib/supabase/server";
import { TimeClockRequestForm } from "@/components/time-clock-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { PayPeriod } from "@/lib/types/database";

export default async function PublicTimeClockPage() {
    const supabase = await createClient();

    // Check if user is logged in (optional, for pre-filling)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userEmail = "";
    let userName = "";

    if (user) {
        userEmail = user.email ?? "";

        // Fetch user profile for pre-filling
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .single() as { data: { full_name: string; email: string } | null };

        if (profile) {
            userEmail = profile.email || userEmail;
            userName = profile.full_name || "";
        }
    }

    // Fetch pay periods (current and upcoming only)
    const today = new Date().toISOString().split('T')[0];
    const { data: payPeriodsData } = await supabase
        .from("pay_periods")
        .select("*")
        .gte("end_date", today)
        .order("start_date", { ascending: true });

    const payPeriods = (payPeriodsData || []) as PayPeriod[];

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-border/50">
                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle>S.Ma, MD Inc - Time Clock Request</CardTitle>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                        <p className="text-muted-foreground mb-3">
                            Use this form to submit requests for adjusting your timesheet when you missed clocking in or out. Please provide accurate times and explanations for each entry.
                        </p>
                        <p className="font-semibold text-orange-600 dark:text-orange-400">Important:</p>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                            <li>We only accept requests for the current pay period</li>
                            <li>Requests must be submitted before midnight on the final day of the pay period</li>
                        </ul>
                    </div>
                </CardHeader>
                <CardContent>
                    <TimeClockRequestForm
                        payPeriods={payPeriods}
                        userEmail={userEmail}
                        userName={userName}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
