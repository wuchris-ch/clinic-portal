"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface OvertimeRequestFormProps {
    payPeriods?: PayPeriod[];
    userEmail: string;
    userName: string;
}

export function OvertimeRequestForm({ payPeriods = [], userEmail, userName }: OvertimeRequestFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // User details state (editable)
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);

    const [selectedPayPeriodId, setSelectedPayPeriodId] = useState("");
    const [overtimeDate, setOvertimeDate] = useState<Date | undefined>(undefined);
    const [overtimeDateOpen, setOvertimeDateOpen] = useState(false);
    const [askedDoctor, setAskedDoctor] = useState<boolean | null>(null);
    const [seniorStaffName, setSeniorStaffName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email) {
            toast.error("Please fill in your name and email");
            return;
        }

        if (!selectedPayPeriodId) {
            toast.error("Please select a pay period");
            return;
        }

        if (!overtimeDate) {
            toast.error("Please select the overtime date");
            return;
        }

        if (askedDoctor === null) {
            toast.error("Please indicate if you asked the doctor for overtime");
            return;
        }

        if (askedDoctor === false && !seniorStaffName.trim()) {
            toast.error("Please enter the name of the senior staff who approved your overtime");
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
                    type: "overtime_request",
                    employeeName: name,
                    employeeEmail: email,
                    payPeriodLabel,
                    overtimeDate: format(overtimeDate, "yyyy-MM-dd"),
                    askedDoctor,
                    seniorStaffName: !askedDoctor ? seniorStaffName : null,
                }),
            });

            toast.success("Overtime submission sent successfully!");

            // Reset form
            setSelectedPayPeriodId("");
            setOvertimeDate(undefined);
            setAskedDoctor(null);
            setSeniorStaffName("");
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
                                    <span>
                                        PP{period.period_number} — {format(parseISO(period.start_date), "MMM d")} to {format(parseISO(period.end_date), "MMM d, yyyy")}
                                    </span>
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

            {/* Overtime Date */}
            <div className="space-y-2">
                <Label>Overtime Date *</Label>
                <Popover open={overtimeDateOpen} onOpenChange={setOvertimeDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {overtimeDate ? format(overtimeDate, "EEEE, MMMM d, yyyy") : "Select the overtime date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={overtimeDate}
                            onSelect={(date) => {
                                setOvertimeDate(date);
                                setOvertimeDateOpen(false);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Asked Doctor */}
            <div className="space-y-3">
                <Label>Did you ask the doctor if they needed you to stay overtime? *</Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="askedDoctorYes"
                            checked={askedDoctor === true}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setAskedDoctor(true);
                                    setSeniorStaffName("");
                                }
                            }}
                        />
                        <label htmlFor="askedDoctorYes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Yes
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="askedDoctorNo"
                            checked={askedDoctor === false}
                            onCheckedChange={(checked) => {
                                if (checked) setAskedDoctor(false);
                            }}
                        />
                        <label htmlFor="askedDoctorNo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            No
                        </label>
                    </div>
                </div>
            </div>

            {/* Senior Staff Name (conditional) */}
            {askedDoctor === false && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    <Label htmlFor="seniorStaffName">
                        If you did not request approval from the doctor to work overtime, which senior staff did you get permission to work overtime?
                    </Label>
                    <Input
                        id="seniorStaffName"
                        placeholder="Enter senior staff name"
                        value={seniorStaffName}
                        onChange={(e) => setSeniorStaffName(e.target.value)}
                        required
                    />
                </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit"
                )}
            </Button>
        </form>
    );
}
