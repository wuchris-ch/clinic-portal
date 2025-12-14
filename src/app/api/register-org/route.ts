import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organizationName, adminName, adminEmail, password } = body;

        // Validate required fields
        if (!organizationName || !adminName || !adminEmail || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Generate unique slug
        let slug = generateSlug(organizationName);
        let slugSuffix = 0;

        // Check for slug uniqueness
        while (true) {
            const testSlug = slugSuffix === 0 ? slug : `${slug}-${slugSuffix}`;
            const { data: existingOrg } = await supabaseAdmin
                .from('organizations')
                .select('id')
                .eq('slug', testSlug)
                .single();

            if (!existingOrg) {
                slug = testSlug;
                break;
            }
            slugSuffix++;
        }

        // Create organization first
        const { data: organization, error: orgError } = await supabaseAdmin
            .from('organizations')
            .insert({
                name: organizationName,
                slug,
                admin_email: adminEmail,
            })
            .select()
            .single();

        if (orgError) {
            console.error('Error creating organization:', orgError);
            return NextResponse.json(
                { error: 'Failed to create organization' },
                { status: 500 }
            );
        }

        // Create admin user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: adminName,
                role: 'admin',
                organization_id: organization.id,
            },
        });

        if (authError) {
            // Rollback organization creation
            await supabaseAdmin.from('organizations').delete().eq('id', organization.id);
            console.error('Error creating admin user:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        // Update profile with organization_id (trigger creates profile, we need to update it)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                organization_id: organization.id,
                role: 'admin',
            })
            .eq('id', authData.user.id);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            // Continue anyway - profile update is not critical
        }

        // Add admin as first notification recipient
        await supabaseAdmin.from('notification_recipients').insert({
            email: adminEmail,
            name: adminName,
            organization_id: organization.id,
            is_active: true,
        });

        return NextResponse.json({
            success: true,
            organization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
            },
        });

    } catch (error) {
        console.error('Error in register-org API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
