import { createClient } from "@/lib/supabase/server";
import { SingleDayOffForm } from "@/components/single-day-off-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarOff } from "lucide-react";
import type { LeaveType, PayPeriod } from "@/lib/types/database";

export default async function PublicDayOffPage() {
    const supabase = await createClient();

    // Check if user is logged in (optional, for pre-filling)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userEmail = "";
    let userName = "";
    let userId = "";

    if (user) {
        userId = user.id;
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

    // Fetch leave types
    const { data: leaveTypesData } = await supabase
        .from("leave_types")
        .select("*")
        .order("name");

    const leaveTypes = (leaveTypesData || []) as LeaveType[];

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
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CalendarOff className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>S.Ma, MD Inc - Request for Single Work Day Off</CardTitle>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                        <p className="text-muted-foreground mb-3">
                            Use this form to submit requests to be off on a particular day you are scheduled to work, and an explanation, so we can keep track of staff availability, to help with future staff scheduling. Thank you.
                        </p>
                        <p className="font-semibold text-orange-600 dark:text-orange-400">INSTRUCTIONS:</p>
                        <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                            <li>THIS FORM IS NOT FOR VACATION REQUEST</li>
                            <li>CHOOSE THE PAY PERIOD CORRESPONDING TO THE DAY YOU REQUEST OFF.</li>
                            <li>BC EMPLOYMENT STANDARDS ACT REQUIRES REASONABLE NOTICE TO YOUR EMPLOYER, WHICH IS TWO (2) WEEKS IN ADVANCE. WE CANNOT GUARANTEE YOUR REQUEST WILL BE GRANTED, AS IT DEPENDS ON STAFFING RESOURCE AND CLINIC NEEDS. THE LONGER LEAD TIME, THE MORE LIKELY THE REQUEST CAN BE GRANTED.</li>
                            <li>IF YOU MADE ARRANGEMENTS WITH A CO-WORKER WHO HAS AGREED TO TAKE OVER YOUR JOB RESPONSIBILITY, AND PROVIDE THEIR NAME, WE ARE MUCH MORE LIKELY TO APPROVE YOUR REQUEST, WHILE ADDING MERIT POINTS TO YOU AND THAT CO-WORKER</li>
                        </ul>
                    </div>
                </CardHeader>
                <CardContent>
                    <SingleDayOffForm
                        leaveTypes={leaveTypes}
                        payPeriods={payPeriods}
                        userId={userId}
                        userEmail={userEmail}
                        userName={userName}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
