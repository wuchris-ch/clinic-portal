import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { google } from "googleapis";

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

        // Check Google credentials
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            return NextResponse.json(
                { error: "Google credentials not configured on server" },
                { status: 500 }
            );
        }

        // Try to access the sheet
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        try {
            const response = await sheets.spreadsheets.get({
                spreadsheetId: sheetId,
                fields: "properties.title,sheets.properties.title",
            });

            const sheetTitle = response.data.properties?.title || "Untitled";
            const tabNames = response.data.sheets?.map(s => s.properties?.title) || [];

            return NextResponse.json({
                success: true,
                sheetTitle,
                tabs: tabNames,
            });
        } catch (sheetError: unknown) {
            const error = sheetError as { code?: number; message?: string };

            if (error.code === 404) {
                return NextResponse.json(
                    { success: false, error: "Sheet not found. Check the ID and try again." },
                    { status: 404 }
                );
            }
            if (error.code === 403) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Access denied. Make sure the sheet is shared with the service account."
                    },
                    { status: 403 }
                );
            }

            throw sheetError;
        }

    } catch (error) {
        console.error("Error in test-sheet API:", error);
        console.error("Error details:", {
            name: (error as Error)?.name,
            message: (error as Error)?.message,
            hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
            keyLength: process.env.GOOGLE_PRIVATE_KEY?.length,
        });
        return NextResponse.json(
            { error: "Failed to test sheet connection", details: (error as Error)?.message },
            { status: 500 }
        );
    }
}
