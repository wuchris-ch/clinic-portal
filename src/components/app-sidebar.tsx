"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile, Organization } from "@/lib/types/database";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Calendar,
  CalendarOff,
  Clock,
  Timer,
  Thermometer,
  Shield,
  Users,
  LogOut,
  Home,
  Megaphone,
  FileText,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppSidebarProps {
  user: User | null;
  profile: Profile | null;
  organization?: Organization | null;
}

const helpCenterItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Documentation",
    url: "/documentation",
    icon: FileText,
  },
];

// Admin and staff nav items are now generated inside the component with org prefixes

export function AppSidebar({ user, profile, organization }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isAdmin = profile?.role === "admin";
  const { isMobile, setOpenMobile } = useSidebar();

  // Base path for org-scoped routes
  const basePath = organization ? `/org/${organization.slug}` : '';

  // Generate org-scoped nav items
  const staffNavItems = [
    {
      title: "Announcements",
      url: `${basePath}/announcements`,
      icon: Megaphone,
    },
    {
      title: "Request 1 Day Off",
      url: `${basePath}/dashboard/day-off`,
      icon: CalendarOff,
    },
    {
      title: "Vacation Request",
      url: `${basePath}/dashboard/vacation`,
      icon: Calendar,
    },
    {
      title: "Time Clock Request",
      url: `${basePath}/dashboard/time-clock`,
      icon: Clock,
    },
    {
      title: "Overtime Submission",
      url: `${basePath}/dashboard/overtime`,
      icon: Timer,
    },
    {
      title: "Sick Day Submission",
      url: `${basePath}/dashboard/sick-day`,
      icon: Thermometer,
    },
    {
      title: "Team Calendar",
      url: `${basePath}/calendar`,
      icon: CalendarDays,
    },
  ];

  const adminNavItems = [
    {
      title: "Admin Dashboard",
      url: `${basePath}/admin`,
      icon: Shield,
    },
    {
      title: "Manage Staff",
      url: `${basePath}/admin/employees`,
      icon: Users,
    },
  ];

  // Close sidebar on mobile after navigation
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
      <SidebarHeader className="border-b border-sidebar-border relative">
        {/* Mobile close button */}
        <button
          onClick={closeSidebarOnMobile}
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-sidebar-accent transition-colors md:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 px-2 py-3 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" suppressHydrationWarning />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">StaffHub</span>
            <span className="text-xs text-muted-foreground">Time Off Portal</span>
          </div>
        </Link>
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
                    <Link href={item.url} onClick={closeSidebarOnMobile}>
                      <item.icon className="w-4 h-4" suppressHydrationWarning />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && organization && (
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
                      <Link href={item.url} onClick={closeSidebarOnMobile}>
                        <item.icon className="w-4 h-4" suppressHydrationWarning />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && user && organization && (
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
                      <Link href={item.url} onClick={closeSidebarOnMobile}>
                        <item.icon className="w-4 h-4" suppressHydrationWarning />
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
                <Link href="/login" onClick={closeSidebarOnMobile}>
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

