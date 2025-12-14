import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PendingRequestsQueue } from "@/components/admin/pending-requests-queue";
import { RequestsHistory } from "@/components/admin/requests-history";
import { NotificationRecipients } from "@/components/admin/notification-recipients";
import { GoogleSheetsCard } from "@/components/admin/google-sheets-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, History, Shield, Users, CheckCircle, XCircle, Bell, Building2 } from "lucide-react";
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
        <div className="space-y-6">
            {/* Organization Header - Compact */}
            {organization && (
                <div className="flex items-center gap-3 px-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">{organization.name}</h1>
                        <p className="text-sm text-muted-foreground">/{organization.slug}</p>
                    </div>
                </div>
            )}

            {/* Email Notifications */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
                            <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Email Notifications</CardTitle>
                            <CardDescription className="text-sm">
                                Manage who receives alerts for new time-off requests
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

            {/* Google Sheets Integration - Distinct section */}
            {organization && (
                <GoogleSheetsCard
                    organization={organization}
                    serviceAccountEmail={process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}
                />
            )}

            {/* Time-Off Requests (Approval Queue) */}
            <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Time-Off Requests</CardTitle>
                            <CardDescription className="text-sm">
                                Review and manage employee leave requests
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                            <TabsTrigger value="pending" className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                Pending ({pendingCount})
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
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

            {/* Stats Cards - At bottom */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
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
        default: "bg-card border-border/40 shadow-sm",
        warning: "bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/60 shadow-sm shadow-amber-100/50",
        success: "bg-gradient-to-br from-emerald-50 to-green-50/50 border-emerald-200/60 shadow-sm shadow-emerald-100/50",
        destructive: "bg-gradient-to-br from-rose-50 to-red-50/50 border-rose-200/60 shadow-sm shadow-rose-100/50",
    };

    const titleStyles = {
        default: "text-muted-foreground",
        warning: "text-amber-700",
        success: "text-emerald-700",
        destructive: "text-rose-700",
    };

    const valueStyles = {
        default: "text-foreground",
        warning: "text-amber-900",
        success: "text-emerald-900",
        destructive: "text-rose-900",
    };

    const iconContainerStyles = {
        default: "bg-muted/50 text-muted-foreground",
        warning: "bg-amber-100/80 text-amber-600",
        success: "bg-emerald-100/80 text-emerald-600",
        destructive: "bg-rose-100/80 text-rose-600",
    };

    return (
        <Card className={`border overflow-hidden ${variantStyles[variant]}`}>
            <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                        <p className={`text-xs md:text-sm font-medium ${titleStyles[variant]}`}>{title}</p>
                        <p className={`text-2xl md:text-3xl font-bold tracking-tight ${valueStyles[variant]}`}>{value}</p>
                    </div>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center ${iconContainerStyles[variant]}`}>
                        <div className="[&>svg]:w-4 [&>svg]:h-4 md:[&>svg]:w-[18px] md:[&>svg]:h-[18px]">{icon}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
