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
import { Home, Megaphone, FileText, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
  user: User | null;
  profile: Profile | null;
}

const pageTitles: Record<string, string> = {
  "/": "Employee Help Center",
  "/announcements": "Announcements",
  "/documentation": "Documentation",
  "/dashboard": "Dashboard",
  "/calendar": "Team Calendar",
  "/admin": "Admin Dashboard",
  "/admin/employees": "Manage Staff",
};

export function AppHeader({ user, profile }: AppHeaderProps) {
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
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {/* Help Center Quick Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link
            href="/announcements"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </Link>
          <Link
            href="/documentation"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Docs</span>
          </Link>
        </div>
        <Separator orientation="vertical" className="hidden md:block h-4" />
        {profile?.role === "admin" && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
            Admin
          </span>
        )}
        <a
          href="https://clinic-portal-three.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden"
        >
          <Button variant="ghost" size="icon" title="Home">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Button>
        </a>
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

