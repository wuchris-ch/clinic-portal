import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createOrganizationSheet } from "@/lib/google-sheets-create";

function getSupabaseAdmin() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated and is an admin
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user's profile to check admin status
        const { data: profileData } = await supabase
            .from("profiles")
            .select("role, organization_id")
            .eq("id", user.id)
            .single();

        const profile = profileData as { role: string; organization_id: string | null } | null;

        if (!profile || profile.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { organizationId } = body;

        // Verify the organization belongs to this admin
        if (profile.organization_id !== organizationId) {
            return NextResponse.json(
                { error: "Forbidden - Organization mismatch" },
                { status: 403 }
            );
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Fetch the organization
        const { data: organization, error: orgError } = await supabaseAdmin
            .from("organizations")
            .select("*")
            .eq("id", organizationId)
            .single();

        if (orgError || !organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 }
            );
        }

        // Create the Google Sheet
        const sheetResult = await createOrganizationSheet(
            organization.name,
            organization.admin_email
        );

        if (!sheetResult.success) {
            return NextResponse.json(
                {
                    error: sheetResult.error || "Failed to create Google Sheet",
                    details: "Please ensure Google API credentials are configured correctly."
                },
                { status: 500 }
            );
        }

        // Update the organization with the new sheet ID
        const { error: updateError } = await supabaseAdmin
            .from("organizations")
            .update({ google_sheet_id: sheetResult.spreadsheetId })
            .eq("id", organizationId);

        if (updateError) {
            console.error("Failed to update organization with sheet ID:", updateError);
            return NextResponse.json(
                { error: "Sheet created but failed to save ID to database" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            spreadsheetId: sheetResult.spreadsheetId,
            spreadsheetUrl: sheetResult.spreadsheetUrl,
        });

    } catch (error) {
        console.error("Error in create-sheet API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
