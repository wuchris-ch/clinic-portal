import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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
        const { sheetId, organizationId } = body;

        // Verify the organization belongs to this admin
        if (profile.organization_id !== organizationId) {
            return NextResponse.json(
                { error: "Forbidden - Organization mismatch" },
                { status: 403 }
            );
        }

        if (!sheetId) {
            return NextResponse.json(
                { error: "Sheet ID is required" },
                { status: 400 }
            );
        }

        // Update the organization with the new sheet ID
        const supabaseAdmin = getSupabaseAdmin();
        const { error: updateError } = await supabaseAdmin
            .from("organizations")
            .update({ google_sheet_id: sheetId })
            .eq("id", organizationId);

        if (updateError) {
            console.error("Failed to update organization with sheet ID:", updateError);
            return NextResponse.json(
                { error: "Failed to save sheet ID to database" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Sheet linked successfully",
        });

    } catch (error) {
        console.error("Error in link-sheet API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
