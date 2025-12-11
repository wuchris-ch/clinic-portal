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
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: '../test-results/coverage',
            // Enforce minimum coverage thresholds
            thresholds: {
                lines: 50,
                functions: 50,
                branches: 40,
                statements: 50,
            },
            // Exclude test files and configs from coverage
            exclude: [
                'node_modules/**',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.spec.ts',
                '**/setup.ts',
            ],
        },

        // Test timeout
        testTimeout: 10000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
        },
    },
});
