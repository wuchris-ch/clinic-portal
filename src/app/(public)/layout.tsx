import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  // Non-signed-in users see the landing page
  if (!user) {
    return <>{children}</>;
  }

  // Get user profile to find their organization
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = profileData as Profile | null;

  // If user has an org, redirect them to their dashboard
  if (profile?.organization_id) {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("slug")
      .eq("id", profile.organization_id)
      .single();
    const organization = orgData as Pick<Organization, "slug"> | null;

    if (organization?.slug) {
      redirect(`/org/${organization.slug}/dashboard`);
    }
  }

  // User is logged in but has no org - show the landing page
  return <>{children}</>;
}

