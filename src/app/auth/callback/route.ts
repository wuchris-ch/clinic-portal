import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback: session exchange failed", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    if (!data.user) {
      console.error("Auth callback: no user returned from session exchange");
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Fetch user's profile to get their organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from("profiles")
      .select("organization_id")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Auth callback: failed to fetch profile", profileError.message);
      return NextResponse.redirect(`${origin}/login?error=no_profile`);
    }

    if (!profile?.organization_id) {
      console.error("Auth callback: user has no organization assigned");
      return NextResponse.redirect(`${origin}/login?error=no_org`);
    }

    // Get org slug for redirect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: org, error: orgError } = await (supabase as any)
      .from("organizations")
      .select("slug")
      .eq("id", profile.organization_id)
      .single();

    if (orgError || !org?.slug) {
      console.error("Auth callback: failed to fetch organization", orgError?.message);
      return NextResponse.redirect(`${origin}/login?error=org_not_found`);
    }

    return NextResponse.redirect(`${origin}/org/${org.slug}/dashboard`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
