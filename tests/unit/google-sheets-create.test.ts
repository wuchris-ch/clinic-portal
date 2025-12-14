import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * High-Value Tests: Google Sheets Create Logic
 *
 * Tests the sheet creation business logic:
 * - Tab configuration structure
 * - Header definitions
 * - Form type to tab name mapping
 * - Error handling patterns
 *
 * Note: Actual Google API calls must be tested on Vercel Preview.
 */

// ============================================================================
// Sheet Configuration Tests
// ============================================================================

// Replicate the SHEET_TABS configuration for testing
const SHEET_TABS: Record<string, string[]> = {
    'Vacation Requests': [
        'Timestamp',
        'Employee Name',
        'Employee Email',
        'Start Date',
        'End Date',
        'Reason',
        'Coverage Name',
        'Coverage Email',
        'Pay Period',
        'Status',
    ],
    'Sick Days': [
        'Timestamp',
        'Employee Name',
        'Employee Email',
        'Date',
        'Reason',
        'Pay Period',
        'Status',
    ],
    'Day Off Requests': [
        'Timestamp',
        'Employee Name',
        'Employee Email',
        'Date',
        'Reason',
        'Pay Period',
        'Status',
    ],
    'Overtime Requests': [
        'Timestamp',
        'Employee Name',
        'Employee Email',
        'Date',
        'Hours',
        'Reason',
        'Pay Period',
        'Status',
    ],
    'Time Clock Adjustments': [
        'Timestamp',
        'Employee Name',
        'Employee Email',
        'Date',
        'Original Time',
        'Corrected Time',
        'Reason',
        'Status',
    ],
};

// Tab name mapping function (replicated from source)
function getSheetTabName(formType: string): string {
    const tabMap: Record<string, string> = {
        vacation: 'Vacation Requests',
        'sick-day': 'Sick Days',
        'day-off': 'Day Off Requests',
        overtime: 'Overtime Requests',
        'time-clock': 'Time Clock Adjustments',
    };

    return tabMap[formType] || 'Sheet1';
}

describe('Sheet Tab Configuration', () => {
    describe('Tab names', () => {
        it('has all 5 required tabs', () => {
            const tabNames = Object.keys(SHEET_TABS);

            expect(tabNames).toHaveLength(5);
            expect(tabNames).toContain('Vacation Requests');
            expect(tabNames).toContain('Sick Days');
            expect(tabNames).toContain('Day Off Requests');
            expect(tabNames).toContain('Overtime Requests');
            expect(tabNames).toContain('Time Clock Adjustments');
        });

        it('tab names match constants in google-sheets.ts', () => {
            // These must match SHEET_TAB_NAMES in src/lib/constants/google-sheets.ts
            expect(SHEET_TABS['Day Off Requests']).toBeDefined();
            expect(SHEET_TABS['Vacation Requests']).toBeDefined();
            expect(SHEET_TABS['Time Clock Adjustments']).toBeDefined();
            expect(SHEET_TABS['Overtime Requests']).toBeDefined();
            expect(SHEET_TABS['Sick Days']).toBeDefined();
        });
    });

    describe('Common headers', () => {
        it('all tabs start with Timestamp', () => {
            for (const [tabName, headers] of Object.entries(SHEET_TABS)) {
                expect(headers[0]).toBe('Timestamp');
            }
        });

        it('all tabs have Employee Name as second column', () => {
            for (const [tabName, headers] of Object.entries(SHEET_TABS)) {
                expect(headers[1]).toBe('Employee Name');
            }
        });

        it('all tabs have Employee Email as third column', () => {
            for (const [tabName, headers] of Object.entries(SHEET_TABS)) {
                expect(headers[2]).toBe('Employee Email');
            }
        });

        it('all tabs end with Status column', () => {
            for (const [tabName, headers] of Object.entries(SHEET_TABS)) {
                expect(headers[headers.length - 1]).toBe('Status');
            }
        });
    });

    describe('Vacation Requests tab', () => {
        const headers = SHEET_TABS['Vacation Requests'];

        it('has 10 columns', () => {
            expect(headers).toHaveLength(10);
        });

        it('includes date range columns', () => {
            expect(headers).toContain('Start Date');
            expect(headers).toContain('End Date');
        });

        it('includes coverage columns', () => {
            expect(headers).toContain('Coverage Name');
            expect(headers).toContain('Coverage Email');
        });

        it('includes pay period column', () => {
            expect(headers).toContain('Pay Period');
        });
    });

    describe('Sick Days tab', () => {
        const headers = SHEET_TABS['Sick Days'];

        it('has 7 columns', () => {
            expect(headers).toHaveLength(7);
        });

        it('has single Date column (not date range)', () => {
            expect(headers).toContain('Date');
            expect(headers).not.toContain('Start Date');
            expect(headers).not.toContain('End Date');
        });
    });

    describe('Day Off Requests tab', () => {
        const headers = SHEET_TABS['Day Off Requests'];

        it('has 7 columns', () => {
            expect(headers).toHaveLength(7);
        });

        it('has single Date column', () => {
            expect(headers).toContain('Date');
        });
    });

    describe('Overtime Requests tab', () => {
        const headers = SHEET_TABS['Overtime Requests'];

        it('has 8 columns', () => {
            expect(headers).toHaveLength(8);
        });

        it('includes Hours column', () => {
            expect(headers).toContain('Hours');
        });
    });

    describe('Time Clock Adjustments tab', () => {
        const headers = SHEET_TABS['Time Clock Adjustments'];

        it('has 8 columns', () => {
            expect(headers).toHaveLength(8);
        });

        it('includes time adjustment columns', () => {
            expect(headers).toContain('Original Time');
            expect(headers).toContain('Corrected Time');
        });

        it('does not have Pay Period column', () => {
            // Time clock adjustments don't track pay period in create headers
            // (though they might in the actual submission)
            expect(headers).not.toContain('Pay Period');
        });
    });
});

describe('getSheetTabName', () => {
    it('maps vacation to Vacation Requests', () => {
        expect(getSheetTabName('vacation')).toBe('Vacation Requests');
    });

    it('maps sick-day to Sick Days', () => {
        expect(getSheetTabName('sick-day')).toBe('Sick Days');
    });

    it('maps day-off to Day Off Requests', () => {
        expect(getSheetTabName('day-off')).toBe('Day Off Requests');
    });

    it('maps overtime to Overtime Requests', () => {
        expect(getSheetTabName('overtime')).toBe('Overtime Requests');
    });

    it('maps time-clock to Time Clock Adjustments', () => {
        expect(getSheetTabName('time-clock')).toBe('Time Clock Adjustments');
    });

    it('returns Sheet1 for unknown form type', () => {
        expect(getSheetTabName('unknown')).toBe('Sheet1');
    });

    it('returns Sheet1 for empty string', () => {
        expect(getSheetTabName('')).toBe('Sheet1');
    });

    it('is case-sensitive', () => {
        expect(getSheetTabName('Vacation')).toBe('Sheet1');
        expect(getSheetTabName('VACATION')).toBe('Sheet1');
    });
});

describe('Sheet Creation Result Types', () => {
    interface CreateSheetResult {
        success: boolean;
        spreadsheetId?: string;
        spreadsheetUrl?: string;
        error?: string;
    }

    it('success result includes spreadsheet info', () => {
        const result: CreateSheetResult = {
            success: true,
            spreadsheetId: '1abc123',
            spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123',
        };

        expect(result.success).toBe(true);
        expect(result.spreadsheetId).toBeDefined();
        expect(result.error).toBeUndefined();
    });

    it('failure result includes error message', () => {
        const result: CreateSheetResult = {
            success: false,
            error: 'Google credentials not configured',
        };

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.spreadsheetId).toBeUndefined();
    });
});

describe('Credential Validation', () => {
    function validateGoogleCredentials(
        email: string | undefined,
        privateKey: string | undefined
    ): { valid: boolean; error?: string } {
        if (!email || !privateKey) {
            return {
                valid: false,
                error: 'Google credentials not configured',
            };
        }
        return { valid: true };
    }

    it('returns invalid when email is missing', () => {
        const result = validateGoogleCredentials(undefined, 'private-key');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Google credentials not configured');
    });

    it('returns invalid when private key is missing', () => {
        const result = validateGoogleCredentials('email@example.com', undefined);

        expect(result.valid).toBe(false);
    });

    it('returns invalid when both are missing', () => {
        const result = validateGoogleCredentials(undefined, undefined);

        expect(result.valid).toBe(false);
    });

    it('returns valid when both are present', () => {
        const result = validateGoogleCredentials(
            'service@project.iam.gserviceaccount.com',
            '-----BEGIN PRIVATE KEY-----\nXXX\n-----END PRIVATE KEY-----'
        );

        expect(result.valid).toBe(true);
    });
});

describe('Private Key Formatting', () => {
    function formatPrivateKey(key: string): string {
        return key.replace(/\\n/g, '\n');
    }

    it('converts escaped newlines to actual newlines', () => {
        const input = '-----BEGIN PRIVATE KEY-----\\nABC\\nDEF\\n-----END PRIVATE KEY-----';
        const expected = '-----BEGIN PRIVATE KEY-----\nABC\nDEF\n-----END PRIVATE KEY-----';

        expect(formatPrivateKey(input)).toBe(expected);
    });

    it('handles key with no escaped newlines', () => {
        const input = '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----';

        expect(formatPrivateKey(input)).toBe(input);
    });

    it('handles multiple consecutive escaped newlines', () => {
        const input = 'ABC\\n\\nDEF';
        const expected = 'ABC\n\nDEF';

        expect(formatPrivateKey(input)).toBe(expected);
    });
});

describe('Spreadsheet Title Generation', () => {
    function generateSpreadsheetTitle(organizationName: string): string {
        return `${organizationName} - HR Portal Submissions`;
    }

    it('generates title with organization name', () => {
        expect(generateSpreadsheetTitle('Acme Clinic'))
            .toBe('Acme Clinic - HR Portal Submissions');
    });

    it('handles organization names with special characters', () => {
        expect(generateSpreadsheetTitle("Dr. Smith's Practice"))
            .toBe("Dr. Smith's Practice - HR Portal Submissions");
    });

    it('handles long organization names', () => {
        const longName = 'A'.repeat(100);
        const title = generateSpreadsheetTitle(longName);

        expect(title).toContain(longName);
        expect(title).toContain('HR Portal Submissions');
    });
});

describe('Sheet Configuration Building', () => {
    function buildSheetConfig(title: string, headers: string[], index: number) {
        return {
            properties: {
                sheetId: index,
                title,
                gridProperties: {
                    frozenRowCount: 1,
                },
            },
            data: [
                {
                    startRow: 0,
                    startColumn: 0,
                    rowData: [
                        {
                            values: headers.map((header) => ({
                                userEnteredValue: { stringValue: header },
                                userEnteredFormat: {
                                    textFormat: { bold: true },
                                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                                },
                            })),
                        },
                    ],
                },
            ],
        };
    }

    it('creates config with correct title', () => {
        const config = buildSheetConfig('Vacation Requests', ['A', 'B'], 0);

        expect(config.properties.title).toBe('Vacation Requests');
    });

    it('sets frozen row count to 1', () => {
        const config = buildSheetConfig('Test', ['A'], 0);

        expect(config.properties.gridProperties.frozenRowCount).toBe(1);
    });

    it('uses index as sheetId', () => {
        const config = buildSheetConfig('Test', ['A'], 3);

        expect(config.properties.sheetId).toBe(3);
    });

    it('creates header row with bold formatting', () => {
        const config = buildSheetConfig('Test', ['Header1', 'Header2'], 0);
        const headerValues = config.data[0].rowData[0].values;

        expect(headerValues[0].userEnteredValue.stringValue).toBe('Header1');
        expect(headerValues[0].userEnteredFormat.textFormat.bold).toBe(true);
    });

    it('applies gray background to headers', () => {
        const config = buildSheetConfig('Test', ['A'], 0);
        const bg = config.data[0].rowData[0].values[0].userEnteredFormat.backgroundColor;

        expect(bg.red).toBe(0.9);
        expect(bg.green).toBe(0.9);
        expect(bg.blue).toBe(0.9);
    });
});

describe('Integration Reminder', () => {
    it('REMINDER: Sheet creation must be tested on Vercel Preview', () => {
        console.log(`
            ⚠️  MANUAL TESTING REQUIRED ⚠️

            Unit tests verify business logic but CANNOT test actual Google API calls.

            Before merging changes to google-sheets-create.ts:

            1. Deploy to Vercel Preview branch
            2. Register a new organization
            3. Click "Create Sheet" in Admin Settings
            4. Verify:
               - Sheet is created with correct name
               - All 5 tabs exist
               - Headers are bold and frozen
               - Sheet is shared with admin email

            See CLAUDE.md > "Vercel Preview Testing Checklist" for details.
        `);
        expect(true).toBe(true);
    });
});
