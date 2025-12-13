"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, format, isSaturday, isSunday, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import type { PayPeriod } from "@/lib/types/database";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface VacationRequestFormProps {
  payPeriods?: PayPeriod[];
  userId?: string; // Optional - anonymous users can submit without login
  vacationLeaveTypeId?: string; // Required for DB insert
  userEmail: string;
  userName: string;
  googleSheetId?: string; // Optional - org-specific sheet ID for multi-tenancy
  organizationId?: string; // Required for multi-tenancy DB inserts
}

function getWeekdayDatesBetweenInclusive(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (!isSaturday(d) && !isSunday(d)) {
      dates.push(d);
    }
  }
  return dates;
}

export function VacationRequestForm({
  payPeriods = [],
  userId,
  vacationLeaveTypeId,
  userEmail,
  userName,
  googleSheetId,
  organizationId,
}: VacationRequestFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);

  // User details state (editable)
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);

  const [submissionDate, setSubmissionDate] = useState<Date>(new Date());
  const [submissionDateOpen, setSubmissionDateOpen] = useState(false);

  const [vacationStartDate, setVacationStartDate] = useState<Date | undefined>(undefined);
  const [vacationStartOpen, setVacationStartOpen] = useState(false);
  const [vacationEndDate, setVacationEndDate] = useState<Date | undefined>(undefined);
  const [vacationEndOpen, setVacationEndOpen] = useState(false);

  const [selectedPayPeriodIds, setSelectedPayPeriodIds] = useState<string[]>([]);

  const [coverageName, setCoverageName] = useState("");
  const [coverageEmail, setCoverageEmail] = useState("");

  const [notes, setNotes] = useState("");

  const togglePayPeriod = (periodId: string, checked: boolean | string) => {
    const isChecked = checked === true;
    setSelectedPayPeriodIds((prev) => {
      if (isChecked) return Array.from(new Set([...prev, periodId]));
      return prev.filter((id) => id !== periodId);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }

    if (!submissionDate) {
      toast.error("Please select today's date");
      return;
    }

    if (!vacationStartDate || !vacationEndDate) {
      toast.error("Please select a vacation start and end date");
      return;
    }

    if (vacationEndDate < vacationStartDate) {
      toast.error("End date must be on or after start date");
      return;
    }

    if (selectedPayPeriodIds.length === 0) {
      toast.error("Please select the pay periods affected by your vacation");
      return;
    }

    const weekdayDates = getWeekdayDatesBetweenInclusive(vacationStartDate, vacationEndDate);
    if (weekdayDates.length === 0) {
      toast.error("Your selected range contains no weekdays. Please adjust your dates.");
      return;
    }

    setIsLoading(true);

    try {
      const payPeriodLabels = selectedPayPeriodIds
        .map((id) => payPeriods.find((p) => p.id === id))
        .filter(Boolean)
        .map((p) => {
          const period = p as PayPeriod;
          return `PP${period.period_number} (ending ${period.end_date})`;
        });

      const payPeriodLabel = payPeriodLabels.length > 0 ? payPeriodLabels.join("; ") : null;

      const startDateStr = format(vacationStartDate, "yyyy-MM-dd");
      const endDateStr = format(vacationEndDate, "yyyy-MM-dd");
      const submissionDateStr = format(submissionDate, "yyyy-MM-dd");

      let requestId: string | null = null;

      // Insert to DB only when we have an authenticated user and a Vacation leave_type_id
      if (userId && vacationLeaveTypeId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: requestData, error: requestError } = await (supabase as any)
          .from("leave_requests")
          .insert({
            user_id: userId,
            leave_type_id: vacationLeaveTypeId,
            organization_id: organizationId,
            // Vacation can span multiple pay periods, so we don't force a single pay_period_id.
            pay_period_id: null,
            submission_date: submissionDateStr,
            start_date: startDateStr,
            end_date: endDateStr,
            reason: notes?.trim() || "Vacation request",
            coverage_name: coverageName.trim() ? coverageName.trim() : null,
            coverage_email: coverageEmail.trim() ? coverageEmail.trim() : null,
            status: "pending",
          })
          .select("id")
          .single();

        if (requestError) {
          toast.error(requestError.message);
          return;
        }

        requestId = requestData.id;

        // Insert weekday dates for calendar visibility
        const dateInserts = weekdayDates.map((date) => ({
          request_id: requestId,
          date: format(date, "yyyy-MM-dd"),
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: datesError } = await (supabase as any)
          .from("leave_request_dates")
          .insert(dateInserts);

        if (datesError) {
          // Non-fatal
          console.error("Failed to insert vacation request dates:", datesError);
        }
      }

      // Always notify admins + log to Google Sheets
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vacation_request",
          requestId,
          employeeName: name.trim(),
          employeeEmail: email.trim(),
          startDate: startDateStr,
          endDate: endDateStr,
          totalDays: weekdayDates.length,
          submissionDate: submissionDateStr,
          coverageName: coverageName.trim() ? coverageName.trim() : null,
          coverageEmail: coverageEmail.trim() ? coverageEmail.trim() : null,
          payPeriodLabel,
          notes: notes?.trim() || null,
          googleSheetId, // Pass org-specific sheet ID for multi-tenancy
        }),
      });

      toast.success("Vacation request submitted successfully!");

      // Reset
      setSubmissionDate(new Date());
      setVacationStartDate(undefined);
      setVacationEndDate(undefined);
      setSelectedPayPeriodIds([]);
      setCoverageName("");
      setCoverageEmail("");
      setNotes("");

      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      {/* Today's Date (Submission Date) */}
      <div className="space-y-2">
        <Label>Today&apos;s Date (Date of submitting request) *</Label>
        <Popover open={submissionDateOpen} onOpenChange={setSubmissionDateOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(submissionDate, "EEEE, MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={submissionDate}
              onSelect={(date) => {
                if (date) {
                  setSubmissionDate(date);
                  setSubmissionDateOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Vacation Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start Date of your vacation *</Label>
          <Popover open={vacationStartOpen} onOpenChange={setVacationStartOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {vacationStartDate
                  ? format(vacationStartDate, "EEEE, MMMM d, yyyy")
                  : "Select start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={vacationStartDate}
                onSelect={(date) => {
                  setVacationStartDate(date);
                  setVacationStartOpen(false);
                  // If end date is before start, clear end date
                  if (date && vacationEndDate && vacationEndDate < date) {
                    setVacationEndDate(undefined);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date of your vacation *</Label>
          <Popover open={vacationEndOpen} onOpenChange={setVacationEndOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {vacationEndDate
                  ? format(vacationEndDate, "EEEE, MMMM d, yyyy")
                  : "Select end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={vacationEndDate}
                onSelect={(date) => {
                  setVacationEndDate(date);
                  setVacationEndOpen(false);
                }}
                disabled={(date) =>
                  Boolean(vacationStartDate) && date < (vacationStartDate as Date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Pay Periods */}
      {payPeriods.length > 0 && (
        <div className="space-y-2">
          <Label>Select the Pay Periods affected by your vacation request *</Label>
          <div className="rounded-lg border border-border/50 bg-card">
            <div className="max-h-[320px] overflow-y-auto p-3 space-y-2">
              {payPeriods.map((period) => {
                const checked = selectedPayPeriodIds.includes(period.id);

                return (
                  <div key={period.id} className="flex items-start gap-3">
                    <Checkbox
                      id={`pay-period-${period.id}`}
                      checked={checked}
                      onCheckedChange={(v) => togglePayPeriod(period.id, v)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`pay-period-${period.id}`}
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      <span className="font-medium">
                        PP{period.period_number} — {format(parseISO(period.start_date), "MMM d")} to {format(parseISO(period.end_date), "MMM d, yyyy")}
                      </span>
                      {period.period_number === 1 && period.t4_year && (
                        <span className="text-xs text-muted-foreground ml-2">
                          start of {period.t4_year} T4
                        </span>
                      )}
                      {period.period_number === 24 && period.t4_year && (
                        <span className="text-xs text-muted-foreground ml-2">
                          end of {period.t4_year} T4
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Select all pay periods that overlap your vacation dates.
          </p>
        </div>
      )}

      {/* Coverage */}
      <div className="space-y-2">
        <Label htmlFor="coverageName">
          Name of a co-worker (if any), to cover your job duties in your absence
        </Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="coverageName"
            placeholder="Co-worker name"
            value={coverageName}
            onChange={(e) => setCoverageName(e.target.value)}
          />
          <Input
            id="coverageEmail"
            type="email"
            placeholder="Co-worker email"
            value={coverageEmail}
            onChange={(e) => setCoverageEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any details you'd like to add..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[90px] resize-none"
        />
      </div>

      {/* Submit */}
      <p className="text-xs text-muted-foreground text-center">
        We will reply by email, within 72 hours of your submission. You will receive a reply at
        the email you entered above.
      </p>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}



