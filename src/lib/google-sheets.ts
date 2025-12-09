import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function appendRowToSheet(values: string[], sheetName: string = 'Sheet1') {
    try {
        if (
            !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
            !process.env.GOOGLE_PRIVATE_KEY ||
            !process.env.GOOGLE_SHEET_ID
        ) {
            console.warn("Google Sheets credentials not configured. Skipping sheet update.");
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
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        await sheets.spreadsheets.values.append({
            spreadsheetId,
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
