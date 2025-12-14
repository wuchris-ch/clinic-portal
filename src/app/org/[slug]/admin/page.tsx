import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PendingRequestsQueue } from "@/components/admin/pending-requests-queue";
import { RequestsHistory } from "@/components/admin/requests-history";
import { NotificationRecipients } from "@/components/admin/notification-recipients";
import { OrganizationSettings } from "@/components/admin/organization-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, History, Shield, Users, CheckCircle, XCircle, Bell, Settings } from "lucide-react";
import type { Profile, LeaveRequest, LeaveType, NotificationRecipient, Organization } from "@/lib/types/database";

type RequestWithDetails = LeaveRequest & {
    profiles: Pick<Profile, "id" | "full_name" | "email" | "avatar_url">;
    leave_types: LeaveType;
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function AdminPage({ params }: PageProps) {
    const { slug } = await params;
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

    // Fetch organization
    const { data: organizationData } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    const organization = organizationData as Organization | null;

    // Fetch all leave requests with user profiles (RLS handles org filtering)
    const { data: requestsData } = await supabase
        .from("leave_requests")
        .select(`
      *,
      profiles!leave_requests_user_id_fkey (id, full_name, email, avatar_url),
      leave_types (*)
    `)
        .order("created_at", { ascending: false });

    const allRequests = (requestsData || []) as RequestWithDetails[];

    // Fetch notification recipients (RLS handles org filtering)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recipientsData } = await (supabase as any)
        .from("notification_recipients")
        .select("*")
        .order("created_at", { ascending: false });

    const notificationRecipients = (recipientsData || []) as NotificationRecipient[];

    // Separate pending and processed requests
    const pendingRequests = allRequests.filter((r) => r.status === "pending");
    const processedRequests = allRequests.filter((r) => r.status !== "pending");

    // Stats - count only org members
    let staffCount = 0;
    if (profile.organization_id) {
        const totalStaff = await supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("organization_id", profile.organization_id);
        staffCount = totalStaff.count || 0;
    }

    const pendingCount = pendingRequests.length;
    const approvedCount = allRequests.filter((r) => r.status === "approved").length;
    const deniedCount = allRequests.filter((r) => r.status === "denied").length;

    return (
        <div className="space-y-8">
            {/* Email Notifications */}
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
                        organizationId={profile.organization_id!}
                    />
                </CardContent>
            </Card>

            {/* Organization Settings (Google Sheets) */}
            {organization && (
                <Card className="border-border/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Organization Settings</CardTitle>
                                <CardDescription>
                                    Manage your organization&apos;s configuration and integrations
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <OrganizationSettings
                            organization={organization}
                            serviceAccountEmail={process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
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

            {/* Time-Off Requests (Approval Queue) */}
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
            <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm font-medium opacity-80">{title}</p>
                        <p className="text-2xl md:text-3xl font-bold">{value}</p>
                    </div>
                    <div className={`${iconStyles[variant]} [&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-4 md:[&>svg]:h-4`}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}
