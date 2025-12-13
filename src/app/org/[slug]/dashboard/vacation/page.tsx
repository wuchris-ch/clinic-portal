import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VacationRequestForm } from "@/components/vacation-request-form";
import { MyRequestsList } from "@/components/my-requests-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { LeaveRequest, LeaveType, PayPeriod, Organization, Profile } from "@/lib/types/database";

type RequestWithType = LeaveRequest & {
    leave_types: LeaveType;
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function VacationPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile and org
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const typedProfile = profile as Profile | null;

    // Get organization to get google_sheet_id
    const { data: organization } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    const typedOrg = organization as Organization | null;

    const userId = user.id;
    const userEmail = user.email ?? "";

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

    // Fetch user's vacation requests in this org
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
                                <CardTitle>{typedOrg?.name || "Organization"} - Vacation Request</CardTitle>
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
                            userEmail={typedProfile?.email || userEmail}
                            userName={typedProfile?.full_name || "Staff Member"}
                            googleSheetId={typedOrg?.google_sheet_id ?? undefined}
                            organizationId={typedOrg?.id}
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
