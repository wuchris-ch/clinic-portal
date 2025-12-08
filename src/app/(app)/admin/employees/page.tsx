import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployeesList } from "@/components/admin/employees-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { Profile } from "@/lib/types/database";

export default async function EmployeesPage() {
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
    redirect("/dashboard");
  }

  // Fetch all employees with their request counts
  const { data: employeesData } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  const employees = (employeesData || []) as Profile[];

  // Get request counts for each employee
  const employeesWithCounts = await Promise.all(
    employees.map(async (employee) => {
      const { count: pendingCount } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", employee.id)
        .eq("status", "pending");

      const { count: approvedCount } = await supabase
        .from("leave_requests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", employee.id)
        .eq("status", "approved");

      return {
        ...employee,
        pendingCount: pendingCount || 0,
        approvedCount: approvedCount || 0,
      };
    })
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                View and manage employee accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmployeesList employees={employeesWithCounts} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}

