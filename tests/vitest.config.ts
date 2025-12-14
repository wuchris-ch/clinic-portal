import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

export default defineConfig({
    plugins: [react()],
    test: {
        // Set root to project root for coverage to work
        root: projectRoot,

        // Test environment
        environment: 'jsdom',

        // Include test files (relative to project root)
        include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],

        // Global test setup
        globals: true,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './test-results/coverage',
            // Include source files for coverage
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            // Enforce minimum coverage thresholds
            thresholds: {
                lines: 15,
                functions: 15,
                branches: 15,
                statements: 15,
            },
            // Exclude test files and configs from coverage
            exclude: [
                'node_modules/**',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/*.spec.ts',
                '**/setup.ts',
                'src/**/*.d.ts',
                'src/components/ui/**', // shadcn components
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
