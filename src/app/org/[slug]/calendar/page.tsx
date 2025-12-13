import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamCalendar } from "@/components/team-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { LeaveRequest, LeaveType, Profile } from "@/lib/types/database";

type RequestWithDetails = LeaveRequest & {
    profiles: Pick<Profile, "id" | "full_name">;
    leave_types: LeaveType;
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch approved leave requests with user profiles (RLS handles org filtering)
    const { data: requestsData } = await supabase
        .from("leave_requests")
        .select(`
      *,
      profiles!leave_requests_user_id_fkey (id, full_name),
      leave_types (*)
    `)
        .eq("status", "approved")
        .order("start_date");

    const approvedRequests = (requestsData || []) as RequestWithDetails[];

    // Fetch leave types for legend
    const { data: leaveTypesData } = await supabase
        .from("leave_types")
        .select("*")
        .order("name");

    const leaveTypes = (leaveTypesData || []) as LeaveType[];

    return (
        <div className="space-y-6">
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Team Calendar</CardTitle>
                            <CardDescription>
                                View who&apos;s away and plan accordingly
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-border/50">
                        {leaveTypes.map((type) => (
                            <div key={type.id} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: type.color }}
                                />
                                <span className="text-sm text-muted-foreground">{type.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar */}
                    <TeamCalendar events={approvedRequests} />
                </CardContent>
            </Card>
        </div>
    );
}
