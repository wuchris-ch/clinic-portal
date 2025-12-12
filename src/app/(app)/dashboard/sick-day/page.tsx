import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SickDayForm } from "@/components/sick-day-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import type { PayPeriod } from "@/lib/types/database";

export default async function SickDayPage() {
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
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Thermometer className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle>S.Ma, MD Inc - Sick Day Submission</CardTitle>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                        <p className="text-muted-foreground mb-3">
                            Use this form to submit sick days. Submit one form for each Pay Period affected by your sick leave. Thank you.
                        </p>
                        <p className="font-semibold text-orange-600 dark:text-orange-400">INSTRUCTIONS:</p>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                            <li>CHOOSE THE PAY PERIOD CORRESPONDING TO THE SICK DAY(S). WE WILL ENDEAVOUR TO PAY THE SICK DAY IN THE SAME PAY PERIOD, OR AT THE LATEST, THE PAY PERIOD AFTER YOUR SICK DAY.</li>
                            <li>BC EMPLOYMENT STANDARDS ACT STATES: Your employer may request reasonably sufficient proof of illness.</li>
                        </ul>
                    </div>
                </CardHeader>
                <CardContent>
                    <SickDayForm
                        payPeriods={payPeriods}
                        userEmail={profile?.email || userEmail}
                        userName={profile?.full_name || "Staff Member"}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
