"use client";

import { useState, useRef } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2, Upload, X, FileText } from "lucide-react";
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

interface SickDayFormProps {
    payPeriods?: PayPeriod[];
    userEmail: string;
    userName: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export function SickDayForm({ payPeriods = [], userEmail, userName }: SickDayFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User details state (editable)
    const [name, setName] = useState(userName);
    const [email, setEmail] = useState(userEmail);

    const [selectedPayPeriodId, setSelectedPayPeriodId] = useState("");
    const [sickDate, setSickDate] = useState<Date | undefined>(undefined);
    const [sickDateOpen, setSickDateOpen] = useState(false);
    const [hasDoctorNote, setHasDoctorNote] = useState<boolean | null>(null);
    const [doctorNoteFile, setDoctorNoteFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            toast.error("Please upload a PDF or image file (JPEG, PNG)");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setDoctorNoteFile(file);
    };

    const handleRemoveFile = () => {
        setDoctorNoteFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            toast.error("Please upload a PDF or image file (JPEG, PNG)");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setDoctorNoteFile(file);
    };

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

        if (!sickDate) {
            toast.error("Please select the sick day date");
            return;
        }

        if (hasDoctorNote === null) {
            toast.error("Please indicate if you have a doctor note");
            return;
        }

        if (hasDoctorNote && !doctorNoteFile) {
            toast.error("Please upload your doctor note");
            return;
        }

        setIsLoading(true);

        try {
            const selectedPayPeriod = payPeriods.find(p => p.id === selectedPayPeriodId);
            const payPeriodLabel = selectedPayPeriod
                ? `Period ${selectedPayPeriod.period_number} (${format(parseISO(selectedPayPeriod.start_date), "MMM d")} - ${format(parseISO(selectedPayPeriod.end_date), "MMM d, yyyy")})`
                : null;

            // Create FormData to send file
            const formData = new FormData();
            formData.append("type", "sick_day_request");
            formData.append("employeeName", name);
            formData.append("employeeEmail", email);
            formData.append("payPeriodLabel", payPeriodLabel || "");
            formData.append("submissionDate", format(new Date(), "yyyy-MM-dd"));
            formData.append("sickDate", format(sickDate, "yyyy-MM-dd"));
            formData.append("hasDoctorNote", hasDoctorNote ? "true" : "false");

            if (doctorNoteFile) {
                formData.append("doctorNote", doctorNoteFile);
            }

            const response = await fetch("/api/sick-day/submit", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to submit sick day request");
            }

            toast.success("Sick day submission sent successfully!");

            // Reset form
            setSelectedPayPeriodId("");
            setSickDate(undefined);
            setHasDoctorNote(null);
            setDoctorNoteFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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

            {/* Sick Day Date */}
            <div className="space-y-2">
                <Label>Sick Day Date *</Label>
                <Popover open={sickDateOpen} onOpenChange={setSickDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {sickDate ? format(sickDate, "EEEE, MMMM d, yyyy") : "Select the sick day date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={sickDate}
                            onSelect={(date) => {
                                setSickDate(date);
                                setSickDateOpen(false);
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Has Doctor Note */}
            <div className="space-y-3">
                <Label>Do you have a doctor note to submit? *</Label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hasDoctorNoteYes"
                            checked={hasDoctorNote === true}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setHasDoctorNote(true);
                                }
                            }}
                        />
                        <label htmlFor="hasDoctorNoteYes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Yes
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hasDoctorNoteNo"
                            checked={hasDoctorNote === false}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setHasDoctorNote(false);
                                    setDoctorNoteFile(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }
                            }}
                        />
                        <label htmlFor="hasDoctorNoteNo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            No
                        </label>
                    </div>
                </div>
            </div>

            {/* Doctor Note Upload (conditional) */}
            {hasDoctorNote === true && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    <Label htmlFor="doctorNote">
                        Upload Doctor Note (PDF or Image, max 10MB) *
                    </Label>

                    {!doctorNoteFile ? (
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50"
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload className={`mx-auto h-8 w-8 mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                            <p className="text-sm text-muted-foreground">
                                {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PDF, JPEG, or PNG (max 10MB)
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {doctorNoteFile.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({(doctorNoteFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        id="doctorNote"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
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
