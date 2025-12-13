"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import type { PayPeriod } from "@/lib/types/database";
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

interface TimeClockRequestFormProps {
    payPeriods?: PayPeriod[];
    userEmail: string;
    userName: string;
    googleSheetId?: string;
    organizationId?: string;
}

export function TimeClockRequestForm({ payPeriods = [], userEmail, userName, googleSheetId, organizationId }: TimeClockRequestFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // User details state (editable)
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);

    const [selectedPayPeriodId, setSelectedPayPeriodId] = useState("");

    // Clock-in fields
    const [clockInDate, setClockInDate] = useState<Date | undefined>(undefined);
    const [clockInDateOpen, setClockInDateOpen] = useState(false);
    const [clockInHour, setClockInHour] = useState("");
    const [clockInMinute, setClockInMinute] = useState("");
    const [clockInAmPm, setClockInAmPm] = useState("AM");
    const [clockInReason, setClockInReason] = useState("");

    // Clock-out fields
    const [clockOutDate, setClockOutDate] = useState<Date | undefined>(undefined);
    const [clockOutDateOpen, setClockOutDateOpen] = useState(false);
    const [clockOutHour, setClockOutHour] = useState("");
    const [clockOutMinute, setClockOutMinute] = useState("");
    const [clockOutAmPm, setClockOutAmPm] = useState("AM");
    const [clockOutReason, setClockOutReason] = useState("");

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const formatTime = (hour: string, minute: string, amPm: string) => {
        if (!hour || !minute) return null;
        return `${hour}:${minute} ${amPm}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate at least one clock entry
        const hasClockIn = clockInDate && clockInHour && clockInMinute && clockInReason;
        const hasClockOut = clockOutDate && clockOutHour && clockOutMinute && clockOutReason;

        if (!name || !email) {
            toast.error("Please fill in your name and email");
            return;
        }

        // Pay period is only required if pay periods are available
        if (payPeriods.length > 0 && !selectedPayPeriodId) {
            toast.error("Please select a pay period");
            return;
        }

        if (!hasClockIn && !hasClockOut) {
            toast.error("Please fill in at least one clock-in or clock-out entry");
            return;
        }

        setIsLoading(true);

        try {
            const selectedPayPeriod = payPeriods.find(p => p.id === selectedPayPeriodId);
            const payPeriodLabel = selectedPayPeriod
                ? `Period ${selectedPayPeriod.period_number} (${format(parseISO(selectedPayPeriod.start_date), "MMM d")} - ${format(parseISO(selectedPayPeriod.end_date), "MMM d, yyyy")})`
                : null;

            await fetch("/api/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "time_clock_request",
                    employeeName: name,
                    employeeEmail: email,
                    payPeriodLabel,
                    clockInDate: clockInDate ? format(clockInDate, "yyyy-MM-dd") : null,
                    clockInTime: formatTime(clockInHour, clockInMinute, clockInAmPm),
                    clockInReason: clockInReason || null,
                    clockOutDate: clockOutDate ? format(clockOutDate, "yyyy-MM-dd") : null,
                    clockOutTime: formatTime(clockOutHour, clockOutMinute, clockOutAmPm),
                    clockOutReason: clockOutReason || null,
                    googleSheetId,
                    organizationId,
                }),
            });

            toast.success("Time clock request submitted successfully!");

            // Reset form
            setSelectedPayPeriodId("");
            setClockInDate(undefined);
            setClockInHour("");
            setClockInMinute("");
            setClockInAmPm("AM");
            setClockInReason("");
            setClockOutDate(undefined);
            setClockOutHour("");
            setClockOutMinute("");
            setClockOutAmPm("AM");
            setClockOutReason("");
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        {period.period_number === 1 && period.t4_year && (
                                            <span className="text-xs text-muted-foreground sm:text-sm">
                                                start of {period.t4_year} T4
                                            </span>
                                        )}
                                        {period.period_number === 24 && period.t4_year && (
                                            <span className="text-xs text-muted-foreground sm:text-sm">
                                                end of {period.t4_year} T4
                                            </span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

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

            {/* Clock-In Section */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Missed Clock-In</h3>
                </div>

                {/* Clock-In Date */}
                <div className="space-y-2">
                    <Label>Missed clock-in date</Label>
                    <Popover open={clockInDateOpen} onOpenChange={setClockInDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {clockInDate ? format(clockInDate, "EEEE, MMMM d, yyyy") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={clockInDate}
                                onSelect={(date) => {
                                    setClockInDate(date);
                                    setClockInDateOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Clock-In Time */}
                <div className="space-y-2">
                    <Label>Clock-in time for this date above</Label>
                    <div className="flex gap-2">
                        <Select value={clockInHour} onValueChange={setClockInHour}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                                {hours.map(h => (
                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={clockInMinute} onValueChange={setClockInMinute}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                                {minutes.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={clockInAmPm} onValueChange={setClockInAmPm}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clock-In Reason */}
                <div className="space-y-2">
                    <Label htmlFor="clockInReason">Please explain why you missed clocking-in</Label>
                    <Textarea
                        id="clockInReason"
                        placeholder="Your explanation..."
                        value={clockInReason}
                        onChange={(e) => setClockInReason(e.target.value)}
                        className="min-h-[80px] resize-none"
                    />
                </div>
            </div>

            {/* Clock-Out Section */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Missed Clock-Out</h3>
                </div>

                {/* Clock-Out Date */}
                <div className="space-y-2">
                    <Label>Missed clock-out date</Label>
                    <Popover open={clockOutDateOpen} onOpenChange={setClockOutDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {clockOutDate ? format(clockOutDate, "EEEE, MMMM d, yyyy") : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={clockOutDate}
                                onSelect={(date) => {
                                    setClockOutDate(date);
                                    setClockOutDateOpen(false);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Clock-Out Time */}
                <div className="space-y-2">
                    <Label>Clock-out time for this date above</Label>
                    <div className="flex gap-2">
                        <Select value={clockOutHour} onValueChange={setClockOutHour}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                                {hours.map(h => (
                                    <SelectItem key={h} value={h}>{h}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={clockOutMinute} onValueChange={setClockOutMinute}>
                            <SelectTrigger className="w-20">
                                <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                                {minutes.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={clockOutAmPm} onValueChange={setClockOutAmPm}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clock-Out Reason */}
                <div className="space-y-2">
                    <Label htmlFor="clockOutReason">Please explain why you missed clocking-out</Label>
                    <Textarea
                        id="clockOutReason"
                        placeholder="Your explanation..."
                        value={clockOutReason}
                        onChange={(e) => setClockOutReason(e.target.value)}
                        className="min-h-[80px] resize-none"
                    />
                </div>
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
