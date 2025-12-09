"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Calendar,
  CalendarOff,
  Clock,
  Timer,
  Shield,
  Users,
  LogOut,
  Home,
  Megaphone,
  FileText,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppSidebarProps {
  user: User | null;
  profile: Profile | null;
}

const helpCenterItems = [
  {
    title: "Help Center Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Announcements",
    url: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Documentation",
    url: "/documentation",
    icon: FileText,
  },
  {
    title: "App Walkthrough",
    url: "/walkthrough",
    icon: BookOpen,
  },
];

const quickFormItems = [
  {
    title: "Request 1 Day Off",
    url: "/forms/day-off",
    icon: CalendarOff,
  },
  {
    title: "Time Clock Request",
    url: "/forms/time-clock",
    icon: Clock,
  },
  {
    title: "Overtime Submission",
    url: "/forms/overtime",
    icon: Timer,
  },
];

const staffNavItems = [
  {
    title: "Request 1 Day Off",
    url: "/dashboard/day-off",
    icon: CalendarOff,
  },
  {
    title: "Time Clock Request",
    url: "/dashboard/time-clock",
    icon: Clock,
  },
  {
    title: "Overtime Submission",
    url: "/dashboard/overtime",
    icon: Timer,
  },
  {
    title: "Team Calendar",
    url: "/calendar",
    icon: Calendar,
  },
];

const adminNavItems = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: Shield,
  },
  {
    title: "Manage Staff",
    url: "/admin/employees",
    icon: Users,
  },
];

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isAdmin = profile?.role === "admin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">StaffHub</span>
            <span className="text-xs text-muted-foreground">Time Off Portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Help Center</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpCenterItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Forms - always visible, for easy public access */}
        {!user && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Forms</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickFormItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>My Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {staffNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && user && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {user ? (
            <>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-2 py-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.full_name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile?.role === "admin" ? "Administrator" : "Staff"}
                    </p>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/login">
                  <LogOut className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

