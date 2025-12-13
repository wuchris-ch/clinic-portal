import { google } from 'googleapis';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',  // Full drive access needed to create new files
];

// Sheet tab configurations with headers
const SHEET_TABS = {
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

interface CreateSheetResult {
    success: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    error?: string;
}

/**
 * Creates a new Google Sheet for an organization with pre-populated headers.
 * The sheet is shared with the organization admin's email.
 */
export async function createOrganizationSheet(
    organizationName: string,
    adminEmail: string
): Promise<CreateSheetResult> {
    try {
        // Check for required credentials
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('Google credentials not configured. Cannot create organization sheet.');
            return {
                success: false,
                error: 'Google credentials not configured',
            };
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const drive = google.drive({ version: 'v3', auth });

        // Build sheet configurations with headers
        const sheetConfigs = Object.entries(SHEET_TABS).map(([title, headers], index) => ({
            properties: {
                sheetId: index,
                title,
                gridProperties: {
                    frozenRowCount: 1, // Freeze header row
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
        }));

        // Try to create the spreadsheet
        // First attempt: Use Drive API to create in a shared folder (often works when direct create fails)
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        let spreadsheetId: string | undefined;
        let spreadsheetUrl: string | undefined;

        if (folderId) {
            try {
                console.log(`Attempting to create spreadsheet in folder: ${folderId}`);
                const driveFile = await drive.files.create({
                    requestBody: {
                        name: `${organizationName} - HR Portal Submissions`,
                        mimeType: 'application/vnd.google-apps.spreadsheet',
                        parents: [folderId],
                    },
                    fields: 'id, webViewLink',
                });
                spreadsheetId = driveFile.data.id || undefined;
                spreadsheetUrl = driveFile.data.webViewLink || undefined;
                console.log(`Created spreadsheet via Drive API: ${spreadsheetId}`);
            } catch (driveError) {
                console.warn('Drive API create failed, trying Sheets API:', driveError);
            }
        }

        // Second attempt: Direct Sheets API create (works for personal accounts)
        if (!spreadsheetId) {
            const spreadsheet = await sheets.spreadsheets.create({
                requestBody: {
                    properties: {
                        title: `${organizationName} - HR Portal Submissions`,
                    },
                    sheets: sheetConfigs,
                },
            });
            spreadsheetId = spreadsheet.data.spreadsheetId || undefined;
            spreadsheetUrl = spreadsheet.data.spreadsheetUrl || undefined;
        }

        // If we created via Drive API, we need to add the tabs and headers
        if (spreadsheetId && folderId) {
            try {
                // Delete the default "Sheet1" and add our custom sheets
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        requests: [
                            // Add all our custom sheets
                            ...Object.entries(SHEET_TABS).map(([title], index) => ({
                                addSheet: {
                                    properties: {
                                        title,
                                        index: index,
                                        gridProperties: {
                                            frozenRowCount: 1,
                                        },
                                    },
                                },
                            })),
                        ],
                    },
                });

                // Add headers to each sheet
                const headerUpdates = Object.entries(SHEET_TABS).map(([title, headers]) => ({
                    range: `'${title}'!A1:${String.fromCharCode(64 + headers.length)}1`,
                    values: [headers],
                }));

                await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        valueInputOption: 'RAW',
                        data: headerUpdates,
                    },
                });

                // Try to delete the default Sheet1
                try {
                    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
                    const defaultSheet = sheetInfo.data.sheets?.find(s => s.properties?.title === 'Sheet1');
                    if (defaultSheet?.properties?.sheetId !== undefined) {
                        await sheets.spreadsheets.batchUpdate({
                            spreadsheetId,
                            requestBody: {
                                requests: [{
                                    deleteSheet: {
                                        sheetId: defaultSheet.properties.sheetId,
                                    },
                                }],
                            },
                        });
                    }
                } catch {
                    // Ignore - Sheet1 might not exist or might be the only sheet
                }

                console.log('Added custom tabs and headers to spreadsheet');
            } catch (setupError) {
                console.warn('Could not set up tabs (spreadsheet still created):', setupError);
            }
        }

        if (!spreadsheetId) {
            return {
                success: false,
                error: 'Failed to create spreadsheet - no ID returned',
            };
        }

        // Share the spreadsheet with the organization admin
        try {
            await drive.permissions.create({
                fileId: spreadsheetId,
                requestBody: {
                    type: 'user',
                    role: 'writer',
                    emailAddress: adminEmail,
                },
                sendNotificationEmail: true,
            });
        } catch (shareError) {
            console.error('Failed to share spreadsheet with admin:', shareError);
            // Don't fail the whole operation - sheet was created successfully
            // Admin can be granted access manually if sharing fails
        }

        console.log(`Created organization sheet: ${spreadsheetId} for ${organizationName}`);

        return {
            success: true,
            spreadsheetId,
            spreadsheetUrl: spreadsheetUrl || undefined,
        };
    } catch (error: unknown) {
        // Log detailed error for debugging
        const err = error as { response?: { data?: { error?: { message?: string; status?: string } } }; message?: string };
        console.error('Error creating organization sheet:', error);

        if (err.response?.data?.error) {
            console.error('Google API Error Details:', JSON.stringify(err.response.data.error, null, 2));
        }

        const errorMessage = err.response?.data?.error?.message
            || err.message
            || 'Unknown error';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Maps form types to their corresponding sheet tab names.
 */
export function getSheetTabName(formType: string): string {
    const tabMap: Record<string, string> = {
        vacation: 'Vacation Requests',
        'sick-day': 'Sick Days',
        'day-off': 'Day Off Requests',
        overtime: 'Overtime Requests',
        'time-clock': 'Time Clock Adjustments',
    };

    return tabMap[formType] || 'Sheet1';
}
