import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        // Test root directory
        root: path.resolve(__dirname),

        // Test environment
        environment: 'jsdom',

        // Include test files
        include: ['unit/**/*.test.ts', 'unit/**/*.test.tsx'],

        // Global test setup
        globals: true,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            reportsDirectory: '../test-results/coverage',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
        },
    },
});
