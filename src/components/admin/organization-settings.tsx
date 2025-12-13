"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Organization } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ExternalLink,
    FileSpreadsheet,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Copy,
    Check,
    Building2,
    Link2,
} from "lucide-react";

interface OrganizationSettingsProps {
    organization: Organization;
    serviceAccountEmail?: string;
}

export function OrganizationSettings({ organization, serviceAccountEmail }: OrganizationSettingsProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [copiedServiceEmail, setCopiedServiceEmail] = useState(false);

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

    const handleCopySheetId = async () => {
        if (!organization.google_sheet_id) return;

        try {
            await navigator.clipboard.writeText(organization.google_sheet_id);
            setCopied(true);
            toast.success("Sheet ID copied to clipboard");
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

    // Extract sheet ID from URL or use raw ID
    const parseSheetId = (input: string): string => {
        const trimmed = input.trim();
        // Match Google Sheets URL pattern
        const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }
        // Assume it's a raw sheet ID
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
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save");
        } finally {
            setIsSavingSheetId(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Organization Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{organization.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            /{organization.slug}
                        </p>
                    </div>
                </div>
            </div>

            {/* Google Sheet Connection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Google Sheets Integration</Label>
                </div>

                {hasSheet ? (
                    <div className="space-y-4">
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="text-success font-medium">Connected</span>
                        </div>

                        {/* Sheet URL */}
                        <div className="space-y-2">
                            <Label htmlFor="sheetUrl" className="text-xs text-muted-foreground">
                                Spreadsheet URL
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="sheetUrl"
                                    value={sheetUrl || ""}
                                    readOnly
                                    className="font-mono text-xs bg-muted/50"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopySheetId}
                                    title="Copy Sheet ID"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-success" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Action Button */}
                        <Button onClick={handleOpenSheet} className="w-full sm:w-auto">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Google Sheets
                        </Button>

                        {/* Info */}
                        <p className="text-xs text-muted-foreground">
                            All form submissions (vacation, sick days, overtime, etc.) are automatically logged to this spreadsheet.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                        <AlertTriangle className="w-5 h-5 text-warning-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-warning-foreground">
                                No Google Sheet Connected
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Link a Google Sheet below to start tracking all employee form submissions.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Link Existing Sheet Section */}
            <div className="pt-4 border-t border-border/50">
                <details className="group" open={!hasSheet}>
                    <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none">
                        <Link2 className="w-4 h-4" />
                        <span>Link your Google Sheet</span>
                        <span className="ml-auto text-xs opacity-50 group-open:rotate-90 transition-transform">▶</span>
                    </summary>
                    <div className="mt-4 space-y-5">
                        {/* Step-by-step instructions */}
                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    1
                                </div>
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-medium">Create a Google Sheet</p>
                                    <p className="text-xs text-muted-foreground">
                                        Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">sheets.new</a> to create a new spreadsheet, or use an existing one.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    2
                                </div>
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-medium">Share it with our system</p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Click &quot;Share&quot; in your Google Sheet, then add this email as an <strong>Editor</strong>:
                                    </p>
                                    {serviceAccountEmail ? (
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 p-2 bg-muted rounded text-xs break-all select-all border">
                                                {serviceAccountEmail}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyServiceEmail}
                                                className="flex-shrink-0"
                                            >
                                                {copiedServiceEmail ? (
                                                    <Check className="w-4 h-4" />
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
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    3
                                </div>
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm font-medium">Paste the link below</p>
                                    <Input
                                        id="sheetIdInput"
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
                            <div className="flex items-center gap-2 text-sm text-success p-3 rounded-lg bg-success/10">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Connected! Ready to save.</span>
                            </div>
                        )}
                        {connectionStatus === "error" && connectionError && (
                            <div className="flex items-start gap-2 text-sm text-destructive p-3 rounded-lg bg-destructive/10">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Connection failed</p>
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
                                className="flex-1"
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
                </details>
            </div>

        </div>
    );
}
