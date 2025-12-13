import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Appends a row to a Google Sheet.
 * 
 * @param values - Array of values to append as a row
 * @param sheetName - Tab name within the spreadsheet (default: 'Sheet1')
 * @param spreadsheetId - Optional org-specific sheet ID. Falls back to GOOGLE_SHEET_ID env var for public forms.
 */
export async function appendRowToSheet(
    values: string[],
    sheetName: string = 'Sheet1',
    spreadsheetId?: string
) {
    try {
        if (
            !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
            !process.env.GOOGLE_PRIVATE_KEY
        ) {
            console.warn("Google Sheets credentials not configured. Skipping sheet update.");
            return false;
        }

        // Use provided spreadsheetId or fall back to global env var
        const targetSheetId = spreadsheetId || process.env.GOOGLE_SHEET_ID;

        if (!targetSheetId) {
            console.warn("No spreadsheet ID provided and GOOGLE_SHEET_ID not configured. Skipping sheet update.");
            return false;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: SCOPES,
        });

        const sheets = google.sheets({ version: 'v4', auth });

        await sheets.spreadsheets.values.append({
            spreadsheetId: targetSheetId,
            range: `${sheetName}!A:A`, // Appends to the specified sheet
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [values],
            },
        });

        return true;
    } catch (error) {
        console.error("Error appending to Google Sheet:", error);
        return false;
    }
}

