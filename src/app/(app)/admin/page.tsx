import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PendingRequestsQueue } from "@/components/admin/pending-requests-queue";
import { RequestsHistory } from "@/components/admin/requests-history";
import { NotificationRecipients } from "@/components/admin/notification-recipients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, History, Shield, Users, CheckCircle, XCircle, Bell } from "lucide-react";
import type { Profile, LeaveRequest, LeaveType, NotificationRecipient } from "@/lib/types/database";

type RequestWithDetails = LeaveRequest & {
  profiles: Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
  leave_types: LeaveType;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch all leave requests with user profiles
  const { data: requestsData } = await supabase
    .from("leave_requests")
    .select(`
      *,
      profiles!leave_requests_user_id_fkey (id, full_name, email, avatar_url),
      leave_types (*)
    `)
    .order("created_at", { ascending: false });

  const allRequests = (requestsData || []) as RequestWithDetails[];

  // Fetch notification recipients
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recipientsData } = await (supabase as any)
    .from("notification_recipients")
    .select("*")
    .order("created_at", { ascending: false });

  const notificationRecipients = (recipientsData || []) as NotificationRecipient[];

  // Separate pending and processed requests
  const pendingRequests = allRequests.filter((r) => r.status === "pending");
  const processedRequests = allRequests.filter((r) => r.status !== "pending");

  // Stats
  const totalStaff = await supabase.from("profiles").select("id", { count: "exact" });
  const staffCount = totalStaff.count || 0;

  const pendingCount = pendingRequests.length;
  const approvedCount = allRequests.filter((r) => r.status === "approved").length;
  const deniedCount = allRequests.filter((r) => r.status === "denied").length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Staff"
          value={staffCount}
          icon={<Users className="h-4 w-4" />}
          variant="default"
        />
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

      {/* Main Content */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Time-Off Requests</CardTitle>
              <CardDescription>
                Review and manage employee leave requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History ({processedRequests.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <PendingRequestsQueue requests={pendingRequests} adminId={user.id} />
            </TabsContent>
            <TabsContent value="history">
              <RequestsHistory requests={processedRequests} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Recipients */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Manage who receives email notifications for new time-off requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <NotificationRecipients
            recipients={notificationRecipients}
            adminId={user.id}
          />
        </CardContent>
      </Card>
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
  variant: "default" | "warning" | "success" | "destructive";
}) {
  const variantStyles = {
    default: "bg-card border-border/50",
    warning: "bg-warning/10 text-warning-foreground border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const iconStyles = {
    default: "text-muted-foreground",
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

