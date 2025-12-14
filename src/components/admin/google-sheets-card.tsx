"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Organization } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    ExternalLink,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Copy,
    Check,
    Link2,
    TableProperties,
    ChevronRight,
} from "lucide-react";

// Google Sheets icon SVG component
function GoogleSheetsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#0F9D58"/>
            <path d="M14 2V8H20L14 2Z" fill="#87CEAC"/>
            <path d="M8 13H16V14.5H8V13Z" fill="white"/>
            <path d="M8 16H16V17.5H8V16Z" fill="white"/>
            <path d="M8 10H16V11.5H8V10Z" fill="white"/>
        </svg>
    );
}

// Column headers for each form type (tab-separated for easy paste into Google Sheets)
const SHEET_COLUMN_HEADERS = {
    dayOff: {
        label: "Day Off Requests",
        tabName: "Day Off Requests",
        columns: "Submission Date\tTime of Day\tDay of Week\tType\tName\tEmail\tLeave Type\tStart Date\tEnd Date\tTotal Days\tReason\tPay Period\tCoverage Name\tCoverage Person's Email",
    },
    timeClock: {
        label: "Time Clock Adjustments",
        tabName: "Time Clock Adjustments",
        columns: "Submission Date\tTime of Day\tDay of Week\tType\tName\tEmail\tClock In\tClock Out\tReason In\tReason Out\tPay Period",
    },
    overtime: {
        label: "Overtime Requests",
        tabName: "Overtime Requests",
        columns: "Submission Date\tTime of Day\tDay of Week\tType\tName\tEmail\tOvertime Date\tAsked Doctor?\tAsked Senior Staff Name\tPay Period",
    },
    vacation: {
        label: "Vacation Requests",
        tabName: "Vacation Requests",
        columns: "Submission Date\tTime\tDay of Week\tType\tName\tEmail\tStart Date Vacation\tEnd Date Vacation\t# of Days\tPay Period\tCover Name\tCover Email\tNotes / Reason (optional)",
    },
    sickDay: {
        label: "Sick Days",
        tabName: "Sick Days",
        columns: "Submission Date\tTime of Day\tDay of Week\tName\tEmail\tPay Period\tDate Sick\tDoc Note?\tLink to PDF of Doc's Note",
    },
};

interface GoogleSheetsCardProps {
    organization: Organization;
    serviceAccountEmail?: string;
}

export function GoogleSheetsCard({ organization, serviceAccountEmail }: GoogleSheetsCardProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [copiedServiceEmail, setCopiedServiceEmail] = useState(false);
    const [copiedColumns, setCopiedColumns] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<"link" | "columns" | null>(null);

    // Link existing sheet state
    const [sheetIdInput, setSheetIdInput] = useState("");
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [isSavingSheetId, setIsSavingSheetId] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const hasSheet = !!organization.google_sheet_id;

    const handleCopyServiceEmail = async () => {
        if (!serviceAccountEmail) return;
        try {
            await navigator.clipboard.writeText(serviceAccountEmail);
            setCopiedServiceEmail(true);
            toast.success("Email copied!");
            setTimeout(() => setCopiedServiceEmail(false), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    const sheetUrl = hasSheet
        ? `https://docs.google.com/spreadsheets/d/${organization.google_sheet_id}`
        : null;

    const handleCopySheetUrl = async () => {
        if (!sheetUrl) return;

        try {
            await navigator.clipboard.writeText(sheetUrl);
            setCopied(true);
            toast.success("Sheet URL copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy to clipboard");
        }
    };

    const handleOpenSheet = () => {
        if (sheetUrl) {
            window.open(sheetUrl, "_blank", "noopener,noreferrer");
        }
    };

    const handleCopyColumns = async (key: keyof typeof SHEET_COLUMN_HEADERS) => {
        try {
            await navigator.clipboard.writeText(SHEET_COLUMN_HEADERS[key].columns);
            setCopiedColumns(key);
            toast.success(`${SHEET_COLUMN_HEADERS[key].label} columns copied!`, {
                description: "Paste into row 1 of your Google Sheet tab",
            });
            setTimeout(() => setCopiedColumns(null), 2000);
        } catch {
            toast.error("Failed to copy");
        }
    };

    // Extract sheet ID from URL or use raw ID
    const parseSheetId = (input: string): string => {
        const trimmed = input.trim();
        const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }
        return trimmed;
    };

    const handleTestConnection = async () => {
        const sheetId = parseSheetId(sheetIdInput);
        if (!sheetId) {
            toast.error("Please enter a Sheet ID or URL");
            return;
        }

        setIsTestingConnection(true);
        setConnectionStatus("idle");
        setConnectionError(null);

        try {
            const response = await fetch("/api/admin/test-sheet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sheetId,
                    organizationId: organization.id,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setConnectionStatus("error");
                setConnectionError(data.error || "Failed to connect to sheet");
                toast.error(data.error || "Failed to connect to sheet");
            } else {
                setConnectionStatus("success");
                toast.success("Connection successful!", {
                    description: `Found sheet: "${data.sheetTitle}"`,
                });
            }
        } catch {
            setConnectionStatus("error");
            setConnectionError("Network error - please try again");
            toast.error("Network error - please try again");
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleSaveSheetId = async () => {
        const sheetId = parseSheetId(sheetIdInput);
        if (!sheetId) {
            toast.error("Please enter a Sheet ID or URL");
            return;
        }

        if (connectionStatus !== "success") {
            toast.error("Please test the connection first");
            return;
        }

        setIsSavingSheetId(true);

        try {
            const response = await fetch("/api/admin/link-sheet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sheetId,
                    organizationId: organization.id,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to save sheet ID");
            }

            toast.success("Google Sheet linked successfully!");
            setSheetIdInput("");
            setConnectionStatus("idle");
            setExpandedSection(null);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save");
        } finally {
            setIsSavingSheetId(false);
        }
    };

    const toggleSection = (section: "link" | "columns") => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/30">
            {/* Green accent bar at top */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-50 flex items-center justify-center border border-emerald-200/50 shadow-sm">
                            <GoogleSheetsIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-emerald-950">Google Sheets</h2>
                            <p className="text-sm text-emerald-700/70">
                                Automatic form submission logging
                            </p>
                        </div>
                    </div>

                    {/* Connection Status Badge */}
                    {hasSheet ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/60">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-700">Connected</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 border border-amber-200/60">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Not linked</span>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {hasSheet ? (
                    /* Connected State */
                    <div className="space-y-4">
                        {/* Sheet URL Display */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground font-medium">
                                Linked Spreadsheet
                            </Label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Input
                                        value={sheetUrl || ""}
                                        readOnly
                                        className="pr-10 font-mono text-xs bg-emerald-50/50 border-emerald-200/50 focus-visible:ring-emerald-500/30"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCopySheetUrl}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-emerald-100"
                                        title="Copy URL"
                                    >
                                        {copied ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleOpenSheet}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open Sheet
                                </Button>
                            </div>
                        </div>

                        {/* Info text */}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            All form submissions (vacation, sick days, overtime, etc.) are automatically logged to this spreadsheet.
                        </p>
                    </div>
                ) : (
                    /* Not Connected State - Setup Prompt */
                    <div className="rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-200/50 p-4">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-amber-900">
                                    No Google Sheet Connected
                                </p>
                                <p className="text-xs text-amber-700/80 leading-relaxed">
                                    Link a Google Sheet to automatically track all employee form submissions in one place.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expandable Sections */}
                <div className="space-y-2 pt-2">
                    {/* Link Sheet Section */}
                    <div className="rounded-xl border border-border/50 overflow-hidden bg-white/50">
                        <button
                            onClick={() => toggleSection("link")}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center">
                                    <Link2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{hasSheet ? "Change linked sheet" : "Link your Google Sheet"}</p>
                                    <p className="text-xs text-muted-foreground">Connect a spreadsheet for automatic logging</p>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expandedSection === "link" ? "rotate-90" : ""}`} />
                        </button>

                        {expandedSection === "link" && (
                            <div className="px-4 pb-4 space-y-5 border-t border-border/50">
                                <div className="pt-4 space-y-4">
                                    {/* Step 1 */}
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                            1
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-medium">Create a Google Sheet</p>
                                            <p className="text-xs text-muted-foreground">
                                                Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium">sheets.new</a> to create a new spreadsheet, or use an existing one.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                            2
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-medium">Share it with our system</p>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Click &quot;Share&quot; in your Google Sheet, then add this email as an <strong>Editor</strong>:
                                            </p>
                                            {serviceAccountEmail ? (
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 p-2.5 bg-muted/50 rounded-lg text-xs break-all select-all border border-border/50 font-mono">
                                                        {serviceAccountEmail}
                                                    </code>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCopyServiceEmail}
                                                        className="flex-shrink-0 h-9"
                                                    >
                                                        {copiedServiceEmail ? (
                                                            <Check className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-destructive">Service account not configured</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                            3
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <p className="text-sm font-medium">Paste the link below</p>
                                            <Input
                                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                                value={sheetIdInput}
                                                onChange={(e) => {
                                                    setSheetIdInput(e.target.value);
                                                    setConnectionStatus("idle");
                                                    setConnectionError(null);
                                                }}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Connection Status */}
                                {connectionStatus === "success" && (
                                    <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-emerald-50 border border-emerald-200/50">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span className="text-emerald-700 font-medium">Connected! Ready to save.</span>
                                    </div>
                                )}
                                {connectionStatus === "error" && connectionError && (
                                    <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-destructive" />
                                        <div>
                                            <p className="font-medium text-destructive">Connection failed</p>
                                            <p className="text-xs opacity-80">{connectionError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleTestConnection}
                                        disabled={!sheetIdInput.trim() || isTestingConnection}
                                        className="flex-1"
                                    >
                                        {isTestingConnection ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Testing...
                                            </>
                                        ) : (
                                            "Test Connection"
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleSaveSheetId}
                                        disabled={connectionStatus !== "success" || isSavingSheetId}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isSavingSheetId ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Link Sheet"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column Headers Section */}
                    <div className="rounded-xl border border-border/50 overflow-hidden bg-white/50">
                        <button
                            onClick={() => toggleSection("columns")}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center">
                                    <TableProperties className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Column Headers</p>
                                    <p className="text-xs text-muted-foreground">Copy headers for each form type</p>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expandedSection === "columns" ? "rotate-90" : ""}`} />
                        </button>

                        {expandedSection === "columns" && (
                            <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                                <p className="text-xs text-muted-foreground pt-4 leading-relaxed">
                                    Copy these column headers and paste them into row 1 of each tab in your Google Sheet.
                                    Create a tab for each form type you want to track.
                                </p>

                                <div className="space-y-2">
                                    {(Object.keys(SHEET_COLUMN_HEADERS) as Array<keyof typeof SHEET_COLUMN_HEADERS>).map((key) => {
                                        const { label, tabName } = SHEET_COLUMN_HEADERS[key];
                                        const isCopied = copiedColumns === key;
                                        return (
                                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-medium">{label}</p>
                                                    <p className="text-xs text-muted-foreground">Tab: &quot;{tabName}&quot;</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCopyColumns(key)}
                                                    className={`flex-shrink-0 transition-colors ${isCopied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : ""}`}
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 mr-1.5" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                            Copy
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="text-xs text-muted-foreground bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg">
                                    <strong className="text-emerald-700">Tip:</strong> After pasting, the columns will auto-separate into cells.
                                    Make sure your tab names match exactly (case-sensitive).
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
