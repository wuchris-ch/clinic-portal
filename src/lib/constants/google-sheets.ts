/**
 * Google Sheets Tab Names
 *
 * IMPORTANT: These tab names must match exactly what users have in their Google Sheets.
 * Do NOT change these without updating user documentation and notifying all users.
 *
 * See CLAUDE.md > "Google Sheets Tab Names (DO NOT CHANGE)" for details.
 */

export const SHEET_TAB_NAMES = {
    /** Tab for single day off requests */
    DAY_OFF: "Day Off Requests",

    /** Tab for multi-day vacation requests */
    VACATION: "Vacation Requests",

    /** Tab for time clock adjustment requests */
    TIME_CLOCK: "Time Clock Adjustments",

    /** Tab for overtime submissions */
    OVERTIME: "Overtime Requests",

    /** Tab for sick day submissions */
    SICK_DAY: "Sick Days",
} as const;

export type SheetTabName = typeof SHEET_TAB_NAMES[keyof typeof SHEET_TAB_NAMES];

/**
 * Expected column counts for each form type.
 * Used for validation in tests.
 */
export const SHEET_COLUMN_COUNTS = {
    DAY_OFF: 14,      // A-N columns
    VACATION: 13,     // A-M columns
    TIME_CLOCK: 11,   // A-K columns
    OVERTIME: 10,     // A-J columns
    SICK_DAY: 9,      // A-I columns
} as const;
