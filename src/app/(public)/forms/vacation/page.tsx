import { createClient } from "@/lib/supabase/server";
import { VacationRequestForm } from "@/components/vacation-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { LeaveType, PayPeriod } from "@/lib/types/database";

export default async function PublicVacationPage() {
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
    const { data: profile } = (await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()) as { data: { full_name: string; email: string } | null };

    if (profile) {
      userEmail = profile.email || userEmail;
      userName = profile.full_name || "";
    }
  }

  // Fetch Vacation leave type (for authenticated DB inserts)
  const { data: vacationType } = await supabase
    .from("leave_types")
    .select("*")
    .eq("name", "Vacation")
    .maybeSingle();

  const vacationLeaveTypeId = (vacationType as LeaveType | null)?.id;

  // Fetch pay periods (current and upcoming only)
  const today = new Date().toISOString().split("T")[0];
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>S.Ma, MD Inc - Vacation Request</CardTitle>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
            <p className="font-semibold text-orange-600 dark:text-orange-400">INSTRUCTIONS:</p>
            <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
              <li>THIS IS ONLY FOR VACATION REQUEST.</li>
              <li>CHOOSE THE PAY PERIODS AFFECTED BY YOUR VACATION DAYS.</li>
              <li>
                BC EMPLOYMENT STANDARDS ACT STATES:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Employees who worked more than one year are entitled to vacation pay equivalent to 4% of wages of the previous year</li>
                  <li>Employees who worked more than five years are entitled to vacation pay equivalent to 6% of wages of the previous year</li>
                  <li>Employees in B.C. can&apos;t take vacation time whenever they want. Employers have the final say on when employees can take their vacation.</li>
                  <li>Employers in B.C. have the right to schedule vacation time based on business needs.</li>
                </ul>
              </li>
              <li>
                IF YOU MADE ARRANGEMENTS WITH A CO-WORKER TO TAKE OVER YOUR JOB POSITION, WE ARE MUCH MORE LIKELY TO APPROVE YOUR REQUEST, WHILE ADDING MERIT POINTS TO YOU AND THAT CO-WORKER.
              </li>
            </ul>
          </div>

          {!vacationLeaveTypeId && (
            <div className="text-xs text-muted-foreground">
              Note: The &quot;Vacation&quot; leave type isn&apos;t configured in the database yet. Your submission will still be emailed and logged to Google Sheets, but won&apos;t be saved to your account history.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <VacationRequestForm
            payPeriods={payPeriods}
            userId={userId || undefined}
            vacationLeaveTypeId={vacationLeaveTypeId}
            userEmail={userEmail}
            userName={userName}
          />
        </CardContent>
      </Card>
    </div>
  );
}
