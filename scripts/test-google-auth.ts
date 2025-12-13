/**
 * Quick diagnostic script to test Google API credentials
 * Run with: npx tsx --env-file=.env.local scripts/test-google-auth.ts
 */

import { google } from 'googleapis';

async function testGoogleAuth() {
    console.log('\n🔍 Google API Diagnostic Test\n');
    console.log('─'.repeat(50));

    // Check credentials exist
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;
    const existingSheetId = process.env.GOOGLE_SHEET_ID;

    console.log(`Service Account: ${email || '❌ NOT SET'}`);
    console.log(`Private Key: ${key ? '✓ Set (' + key.length + ' chars)' : '❌ NOT SET'}`);
    console.log(`Existing Sheet ID: ${existingSheetId || '(not set)'}`);
    console.log('─'.repeat(50));

    if (!email || !key) {
        console.error('\n❌ Missing credentials. Cannot proceed.\n');
        process.exit(1);
    }

    try {
        // Test 1: Basic auth
        console.log('\n📋 Test 1: Authenticating with Google...');
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: email,
                private_key: key.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive',
            ],
        });

        await auth.getClient();
        console.log('   ✓ Authentication successful');

        // Test 2: Read existing sheet (if configured)
        if (existingSheetId) {
            console.log('\n📋 Test 2: Reading existing sheet...');
            const sheets = google.sheets({ version: 'v4', auth });
            try {
                const response = await sheets.spreadsheets.get({
                    spreadsheetId: existingSheetId,
                    fields: 'properties.title',
                });
                console.log(`   ✓ Can read sheet: "${response.data.properties?.title}"`);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                console.log(`   ❌ Cannot read sheet: ${message}`);
            }
        } else {
            console.log('\n📋 Test 2: Skipped (no GOOGLE_SHEET_ID configured)');
        }

        // Test 3: Try to create a new sheet
        console.log('\n📋 Test 3: Attempting to create a new sheet...');
        const sheets = google.sheets({ version: 'v4', auth });
        try {
            const response = await sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title: `TEST-DELETE-ME-${Date.now()}`,
                    },
                },
            });
            console.log(`   ✓ Created sheet: ${response.data.spreadsheetId}`);
            console.log(`   ✓ URL: ${response.data.spreadsheetUrl}`);

            // Try to delete it
            console.log('\n📋 Test 4: Cleaning up (deleting test sheet)...');
            const drive = google.drive({ version: 'v3', auth });
            await drive.files.delete({
                fileId: response.data.spreadsheetId!,
            });
            console.log('   ✓ Test sheet deleted');

        } catch (e: unknown) {
            console.log(`   ❌ Cannot create sheet`);
            const message = e instanceof Error ? e.message : String(e);
            console.log(`   Error: ${message}`);
            const errorWithResponse = e as { response?: { data?: { error?: unknown } }; code?: number };
            if (errorWithResponse.response?.data?.error) {
                console.log(`   Details: ${JSON.stringify(errorWithResponse.response.data.error, null, 2)}`);
            }

            // Check if it's a scope issue
            if (message?.includes('permission') || errorWithResponse.code === 403) {
                console.log('\n💡 Possible causes:');
                console.log('   1. Google Workspace org policy blocking service account file creation');
                console.log('   2. Service account needs domain-wide delegation');
                console.log('   3. API restrictions on Google Cloud project');
                console.log('\n   ➜ Use "Link Existing Sheet" as a workaround');
            }
        }

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('\n❌ Authentication failed:', message);
        console.log('\n💡 Check that your GOOGLE_PRIVATE_KEY is correct and properly formatted');
    }

    console.log('\n' + '─'.repeat(50));
    console.log('Diagnostic complete\n');
}

testGoogleAuth();
