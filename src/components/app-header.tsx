"use client";

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

interface AppHeaderProps {
  user: User;
  profile: Profile | null;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Team Calendar",
  "/admin": "Admin Dashboard",
  "/admin/employees": "Manage Staff",
};

export function AppHeader({ profile }: AppHeaderProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";

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
      <div className="ml-auto flex items-center gap-4">
        {profile?.role === "admin" && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            Admin
          </span>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

