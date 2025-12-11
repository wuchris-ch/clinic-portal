import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get current date, time, and day of week in Pacific Time
export function getPSTDateTime(date: Date = new Date()): { date: string; time: string; dayOfWeek: string } {
  const pstDate = new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return {
    date: format(pstDate, "yyyy-MM-dd"),
    time: format(pstDate, "hh:mm:ss a"), // 12-hour format with AM/PM
    dayOfWeek: format(pstDate, "EEEE")   // Full day name (e.g., "Monday")
  };
}
