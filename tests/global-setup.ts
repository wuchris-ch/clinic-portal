/**
 * Global setup for Playwright E2E tests.
 * Runs before any tests to verify we're not testing against production.
 */

import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile(): Record<string, string> {
    const envPath = path.resolve(__dirname, '../.env.local');
    const env: Record<string, string> = {};

    if (!fs.existsSync(envPath)) {
        return env;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
        }
    }

    return env;
}

function isProductionSupabase(url: string): boolean {
    // Production Supabase URLs end with .supabase.co
    return url.includes('.supabase.co');
}

export default async function globalSetup() {
    const env = loadEnvFile();
    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    if (isProductionSupabase(supabaseUrl)) {
        console.error('\n');
        console.error('╔══════════════════════════════════════════════════════════════════╗');
        console.error('║  🛑 E2E TESTS BLOCKED - PRODUCTION DATABASE DETECTED            ║');
        console.error('╠══════════════════════════════════════════════════════════════════╣');
        console.error('║                                                                  ║');
        console.error('║  Your .env.local points to production Supabase:                  ║');
        console.error(`║  ${supabaseUrl.substring(0, 50).padEnd(50)}        ║`);
        console.error('║                                                                  ║');
        console.error('║  E2E tests create test data and should NEVER run against        ║');
        console.error('║  production. Use local Supabase instead:                         ║');
        console.error('║                                                                  ║');
        console.error('║    1. supabase start                                             ║');
        console.error('║    2. Update .env.local with local credentials                   ║');
        console.error('║    3. Run tests again                                            ║');
        console.error('║                                                                  ║');
        console.error('║  Or just push to GitHub and let CI run the tests safely.        ║');
        console.error('║                                                                  ║');
        console.error('║  Safe commands you CAN run against production:                   ║');
        console.error('║    npm run test:unit    (no database access)                    ║');
        console.error('║    npm run lint         (no database access)                    ║');
        console.error('║    npm run build        (no database access)                    ║');
        console.error('║                                                                  ║');
        console.error('╚══════════════════════════════════════════════════════════════════╝');
        console.error('\n');

        throw new Error('E2E tests blocked: Cannot run against production database');
    }

    // Local Supabase - good to go
    console.log('✅ Database check passed: Using local Supabase');
}
