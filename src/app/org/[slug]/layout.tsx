import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { OrganizationProvider } from "@/components/organization-context";
import type { Organization, Profile } from "@/lib/types/database";

interface OrgLayoutProps {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get user profile with explicit type
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const typedProfile = profile as Profile | null;

    if (!typedProfile) {
        redirect("/login");
    }

    // Get organization by slug with explicit type
    const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    const typedOrg = organization as Organization | null;

    if (orgError || !typedOrg) {
        notFound();
    }

    // Verify user belongs to this organization
    if (typedProfile.organization_id !== typedOrg.id) {
        // User doesn't belong to this org - redirect to their org or show error
        if (typedProfile.organization_id) {
            // Get user's actual org
            const { data: userOrg } = await supabase
                .from("organizations")
                .select("slug")
                .eq("id", typedProfile.organization_id)
                .single();

            const typedUserOrg = userOrg as { slug: string } | null;
            if (typedUserOrg?.slug) {
                redirect(`/org/${typedUserOrg.slug}/dashboard`);
            }
        }
        redirect("/login");
    }

    return (
        <OrganizationProvider organization={typedOrg}>
            <SidebarProvider>
                <AppSidebar user={user} profile={typedProfile} organization={typedOrg} />
                <SidebarInset>
                    <AppHeader user={user} profile={typedProfile} />
                    <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </OrganizationProvider>
    );
}

