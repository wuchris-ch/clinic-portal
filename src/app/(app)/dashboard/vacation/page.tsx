import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VacationRequestForm } from "@/components/vacation-request-form";
import { MyRequestsList } from "@/components/my-requests-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { LeaveRequest, LeaveType, PayPeriod } from "@/lib/types/database";

type RequestWithType = LeaveRequest & {
  leave_types: LeaveType;
};

export default async function VacationPage() {
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
  const { data: profile } = (await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .single()) as { data: { full_name: string; email: string } | null };

  // Fetch Vacation leave type id
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

  // Fetch user's vacation requests
  const { data: requestsData } = await supabase
    .from("leave_requests")
    .select(`
      *,
      leave_types (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const allRequests = (requestsData || []) as RequestWithType[];
  const requests = allRequests.filter((r) => r.leave_types?.name === "Vacation");

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Vacation Request Form */}
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
                  IF YOU MADE ARRANGEMENTS WITH A CO-WORKER TO TAKE OVER YOUR JOB POSITION, WE ARE MUCH MORE LIKELY TO APPROVE YOUR REQUEST.
                </li>
              </ul>
            </div>

            {!vacationLeaveTypeId && (
              <div className="text-xs text-muted-foreground">
                Note: The &quot;Vacation&quot; leave type isn&apos;t configured in the database yet. Your submission will still be emailed and logged to Google Sheets, but won&apos;t show up in this request history.
              </div>
            )}
          </CardHeader>
          <CardContent>
            <VacationRequestForm
              payPeriods={payPeriods}
              userId={userId}
              vacationLeaveTypeId={vacationLeaveTypeId}
              userEmail={profile?.email || userEmail}
              userName={profile?.full_name || "Staff Member"}
            />
          </CardContent>
        </Card>

        {/* My Requests List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>My Vacation Requests</CardTitle>
            <CardDescription>View the status of your submitted vacation requests</CardDescription>
          </CardHeader>
          <CardContent>
            <MyRequestsList requests={requests} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
