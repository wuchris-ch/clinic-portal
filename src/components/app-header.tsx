"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/database";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AppHeaderProps {
  user: User | null;
  profile: Profile | null;
}

const pageTitles: Record<string, string> = {
  "/": "Home",
  // Org-scoped pages (slug is dynamic, matched by suffix below)
  "/home": "About StaffHub",
  "/documentation": "Documentation",
  "/announcements": "Announcements",
  "/calendar": "Team Calendar",
  "/admin": "Admin Dashboard",
  "/admin/employees": "Manage Staff",
  // Authenticated forms (dashboard)
  "/dashboard/day-off": "Request 1 Day Off",
  "/dashboard/vacation": "Vacation Request",
  "/dashboard/time-clock": "Time Clock Request",
  "/dashboard/overtime": "Overtime Submission",
  "/dashboard/sick-day": "Sick Day Submission",
};

export function AppHeader({ user, profile }: AppHeaderProps) {
  const pathname = usePathname();

  // Get page title, checking for org-scoped routes (e.g., /org/acme-clinic/announcements)
  const getPageTitle = () => {
    // Direct match first
    if (pageTitles[pathname]) return pageTitles[pathname];

    // Check for org-scoped routes by matching path suffix
    for (const [path, title] of Object.entries(pageTitles)) {
      if (path !== "/" && pathname.endsWith(path)) {
        return title;
      }
    }

    return "Dashboard";
  };

  const pageTitle = getPageTitle();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {profile?.role === "admin" && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            Admin
          </span>
        )}
        <ThemeToggle />
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="hidden md:flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        ) : (
          <Link href="/login">
            <Button size="sm" className="hidden md:flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </Link>
        )}
        {/* Mobile Auth Icons */}
        {user ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="md:hidden"
          >
            <LogOut className="w-4 h-4" />
            <span className="sr-only">Sign Out</span>
          </Button>
        ) : (
          <Link href="/login" className="md:hidden">
            <Button variant="ghost" size="icon">
              <LogIn className="w-4 h-4" />
              <span className="sr-only">Sign In</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

