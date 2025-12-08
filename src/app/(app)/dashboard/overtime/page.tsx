import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OvertimeRequestForm } from "@/components/overtime-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import type { PayPeriod } from "@/lib/types/database";

export default async function OvertimePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const userId = user.id;
    const userEmail = user.email ?? "";

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single() as { data: { full_name: string; email: string } | null };

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
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Timer className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <CardTitle>S.Ma, MD Inc - Overtime Submission</CardTitle>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                        <p className="font-semibold text-orange-600 dark:text-orange-400">Important:</p>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                            <li>We only accept requests for the current pay period</li>
                            <li>Requests must be submitted before midnight on the final day of the pay period</li>
                            <li>An employer is not required to pay overtime to an employee who worked excess hours on their own initiative (Wills v Small Town Press, BC Employment Standards Tribunal, September 2, 2003)</li>
                        </ul>
                    </div>
                </CardHeader>
                <CardContent>
                    <OvertimeRequestForm
                        payPeriods={payPeriods}
                        userEmail={profile?.email || userEmail}
                        userName={profile?.full_name || "Staff Member"}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
