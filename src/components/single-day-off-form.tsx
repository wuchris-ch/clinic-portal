"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { LeaveType, PayPeriod } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface SingleDayOffFormProps {
    leaveTypes: LeaveType[];
    payPeriods?: PayPeriod[];
    userId?: string; // Optional - anonymous users can submit without login
    userEmail: string;
    userName: string;
}

export function SingleDayOffForm({ leaveTypes, payPeriods = [], userId, userEmail, userName }: SingleDayOffFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState(false);
    const [leaveTypeId, setLeaveTypeId] = useState("");
    const [selectedPayPeriodId, setSelectedPayPeriodId] = useState("");
    const [submissionDate, setSubmissionDate] = useState<Date>(new Date());
    const [submissionDateOpen, setSubmissionDateOpen] = useState(false);
    const [dayOffDate, setDayOffDate] = useState<Date | undefined>(undefined);
    const [dayOffDateOpen, setDayOffDateOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [hasCoverage, setHasCoverage] = useState(false);
    const [coverageName, setCoverageName] = useState("");

    const [coverageEmail, setCoverageEmail] = useState("");

    // User details state (editable)
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!leaveTypeId || !selectedPayPeriodId || !submissionDate || !dayOffDate || !reason || !name || !email) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            let requestId: string | null = null;

            // Only insert to database if user is logged in with a valid userId
            if (userId) {
                // Insert the leave request
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: requestData, error: requestError } = await (supabase as any)
                    .from("leave_requests")
                    .insert({
                        user_id: userId,
                        leave_type_id: leaveTypeId,
                        pay_period_id: selectedPayPeriodId,
                        submission_date: format(submissionDate, "yyyy-MM-dd"),
                        start_date: format(dayOffDate, "yyyy-MM-dd"),
                        end_date: format(dayOffDate, "yyyy-MM-dd"),
                        reason,
                        coverage_name: hasCoverage ? coverageName : null,
                        coverage_email: hasCoverage ? coverageEmail : null,
                        status: "pending",
                    })
                    .select("id")
                    .single();

                if (requestError) {
                    toast.error(requestError.message);
                    return;
                }

                requestId = requestData.id;

                // Insert the single date
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: datesError } = await (supabase as any)
                    .from("leave_request_dates")
                    .insert({
                        request_id: requestData.id,
                        date: format(dayOffDate, "yyyy-MM-dd"),
                    });

                if (datesError) {
                    console.error("Failed to insert request date:", datesError);
                }
            }

            // Send notification to admin(s) - always happens, even for anonymous users
            const selectedLeaveType = leaveTypes.find(t => t.id === leaveTypeId);
            const selectedPayPeriod = payPeriods.find(p => p.id === selectedPayPeriodId);
            const payPeriodLabel = selectedPayPeriod
                ? `Period ${selectedPayPeriod.period_number} (${format(parseISO(selectedPayPeriod.start_date), "MMM d")} - ${format(parseISO(selectedPayPeriod.end_date), "MMM d, yyyy")})`
                : null;
            try {
                await fetch("/api/notifications/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "new_request",
                        requestId: requestId,
                        employeeName: name,
                        employeeEmail: email,
                        leaveType: selectedLeaveType?.name || "Time Off",
                        startDate: format(dayOffDate, "yyyy-MM-dd"),
                        endDate: format(dayOffDate, "yyyy-MM-dd"),
                        reason,
                        totalDays: 1,
                        submissionDate: format(submissionDate, "yyyy-MM-dd"),
                        coverageName: hasCoverage ? coverageName : null,
                        coverageEmail: hasCoverage ? coverageEmail : null,
                        payPeriodLabel,
                    }),
                });
            } catch (notifyError) {
                console.error("Failed to send admin notification:", notifyError);
            }

            toast.success("Request submitted successfully!");

            // Reset form
            setLeaveTypeId("");
            setSelectedPayPeriodId("");
            setSubmissionDate(new Date());
            setDayOffDate(undefined);
            setReason("");
            setHasCoverage(false);
            setCoverageName("");
            setCoverageEmail("");

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

            {/* Leave Type */}
            <div className="space-y-2">
                <Label htmlFor="leaveType">Type of Leave *</Label>
                <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                    <SelectTrigger id="leaveType">
                        <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                        {leaveTypes
                            .filter((type) => type.name !== "Vacation")
                            .map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: type.color }}
                                        />
                                        {type.name}
                                    </div>
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Pay Period */}
            {payPeriods.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="payPeriod">Pay Period *</Label>
                    <Select value={selectedPayPeriodId} onValueChange={setSelectedPayPeriodId}>
                        <SelectTrigger id="payPeriod">
                            <SelectValue placeholder="Select pay period" />
                        </SelectTrigger>
                        <SelectContent>
                            {payPeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        <span>
                                            PP{period.period_number} — {format(parseISO(period.start_date), "MMM d")} to {format(parseISO(period.end_date), "MMM d, yyyy")}
                                        </span>
                                        {period.period_number === 1 && period.t4_year === 2026 && (
                                            <span className="text-xs text-muted-foreground sm:text-sm">
                                                start of 2026 T4
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Today's Date (Submission Date) */}
            <div className="space-y-2">
                <Label>Today&apos;s Date *</Label>
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

            {/* Day Off Date - Single Date Selection */}
            <div className="space-y-2">
                <Label>Date Off *</Label>
                <Popover open={dayOffDateOpen} onOpenChange={setDayOffDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dayOffDate ? format(dayOffDate, "EEEE, MMMM d, yyyy") : "Select the date you'll be off"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dayOffDate}
                            onSelect={(date) => {
                                setDayOffDate(date);
                                setDayOffDateOpen(false);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Reason */}
            <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                    id="reason"
                    placeholder="Please explain the reason for your time off request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[100px] resize-none"
                    required
                />
            </div>

            {/* Coverage */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="hasCoverage">Co-worker Coverage</Label>
                        <p className="text-xs text-muted-foreground">
                            Have you arranged coverage for your responsibilities?
                        </p>
                    </div>
                    <Switch
                        id="hasCoverage"
                        checked={hasCoverage}
                        onCheckedChange={setHasCoverage}
                    />
                </div>

                {hasCoverage && (
                    <div className="grid gap-4 sm:grid-cols-2 pl-4 border-l-2 border-primary/20">
                        <div className="space-y-2">
                            <Label htmlFor="coverageName">Co-worker Name</Label>
                            <Input
                                id="coverageName"
                                placeholder="Jane Smith"
                                value={coverageName}
                                onChange={(e) => setCoverageName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coverageEmail">Co-worker Email</Label>
                            <Input
                                id="coverageEmail"
                                type="email"
                                placeholder="jane@example.com"
                                value={coverageEmail}
                                onChange={(e) => setCoverageEmail(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
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
