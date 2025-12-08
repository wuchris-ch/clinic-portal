import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeaveRequestForm } from "@/components/leave-request-form";
import { MyRequestsList } from "@/components/my-requests-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Clock, CheckCircle, XCircle } from "lucide-react";
import type { LeaveRequest, LeaveType, PayPeriod } from "@/lib/types/database";

type RequestWithType = LeaveRequest & {
  leave_types: LeaveType;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

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

  // Fetch user's requests
  const { data: requestsData } = await supabase
    .from("leave_requests")
    .select(`
      *,
      leave_types (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const requests = (requestsData || []) as RequestWithType[];

  // Calculate stats
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const deniedCount = requests.filter((r) => r.status === "denied").length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Pending"
          value={pendingCount}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />
        <StatsCard
          title="Approved"
          value={approvedCount}
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success"
        />
        <StatsCard
          title="Denied"
          value={deniedCount}
          icon={<XCircle className="h-4 w-4" />}
          variant="destructive"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Leave Request Form */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Request Time Off</CardTitle>
                <CardDescription>
                  Submit a new leave request for approval
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LeaveRequestForm 
              leaveTypes={leaveTypes} 
              payPeriods={payPeriods} 
              userId={user.id}
              userEmail={profile?.email || user?.email || ""}
              userName={profile?.full_name || "Staff Member"}
            />
          </CardContent>
        </Card>

        {/* My Requests List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>
              View the status of your submitted requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MyRequestsList requests={requests} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  variant,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: "warning" | "success" | "destructive";
}) {
  const variantStyles = {
    warning: "bg-warning/10 text-warning-foreground border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const iconStyles = {
    warning: "text-warning-foreground",
    success: "text-success",
    destructive: "text-destructive",
  };

  return (
    <Card className={`border ${variantStyles[variant]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={iconStyles[variant]}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

