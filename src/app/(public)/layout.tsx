import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import type { Profile, Organization } from "@/lib/types/database";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile and organization if logged in
  let profile: Profile | null = null;
  let organization: Organization | null = null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData as Profile | null;

    // If user has an org, fetch it
    if (profile?.organization_id) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profile.organization_id)
        .single();
      organization = orgData as Organization | null;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} profile={profile} organization={organization} />
      <SidebarInset>
        <AppHeader user={user} profile={profile} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

