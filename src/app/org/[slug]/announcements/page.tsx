import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AnnouncementsList } from "@/components/announcements-list";
import type { Profile, Organization } from "@/lib/types/database";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnnouncementsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Fetch organization by slug
  const { data: organizationData } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .single();

  const organization = organizationData as Organization | null;

  if (!organization) {
    notFound();
  }

  // Verify user belongs to this organization
  if (profile?.organization_id !== organization.id) {
    // Redirect to their actual org if they have one
    if (profile?.organization_id) {
      const { data: userOrg } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", profile.organization_id)
        .single();
      if (userOrg) {
        redirect(`/org/${userOrg.slug}/announcements`);
      }
    }
    redirect("/login");
  }

  const isAdmin = profile?.role === "admin";

  // Fetch announcements for this organization
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("organization_id", organization.id)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with the latest {organization.name} news and updates
        </p>
      </div>

      {/* Content */}
      <AnnouncementsList
        announcements={announcements || []}
        isAdmin={isAdmin}
        organizationId={organization.id}
      />
    </div>
  );
}
