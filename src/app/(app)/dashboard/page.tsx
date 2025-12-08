import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarOff, Clock, Timer, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboardItems = [
    {
      title: "Request Day Off",
      description: "Submit a single day off request for approval",
      icon: CalendarOff,
      href: "/dashboard/day-off",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Time Clock Request",
      description: "Submit a request to adjust your timesheet for missed clock-in or clock-out",
      icon: Clock,
      href: "/dashboard/time-clock",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Overtime Submission",
      description: "Submit overtime for approval",
      icon: Timer,
      href: "/dashboard/overtime",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Select a request type to get started
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {dashboardItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {item.title}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
