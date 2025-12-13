"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarDays, Eye, EyeOff, Home, Loader2, Building2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterOrgPage() {
    const [organizationName, setOrganizationName] = useState("");
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [orgSlug, setOrgSlug] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/register-org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationName,
                    adminName,
                    adminEmail,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to create organization");
                return;
            }

            // Sign in the user
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: adminEmail,
                password,
            });

            if (signInError) {
                console.error("Sign-in error:", signInError);
                // Still show success - they can sign in manually
            }

            setOrgSlug(data.organization.slug);
            setRegistrationComplete(true);

            toast.success("Organization created successfully!");

        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (registrationComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <Card className="border-border/40 shadow-xl shadow-primary/5">
                        <CardHeader className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl">Welcome to StaffHub!</CardTitle>
                            <CardDescription>
                                Your organization <strong>{organizationName}</strong> has been created.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <p className="text-sm font-medium">Your dashboard URL:</p>
                                <code className="text-xs block p-2 bg-background rounded border break-all">
                                    {typeof window !== "undefined" ? window.location.origin : ""}/org/{orgSlug}/dashboard
                                </code>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 space-y-2">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Next step: Link your Google Sheet
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Go to Admin Settings to link your Google Sheet. All form submissions will be logged there automatically.
                                </p>
                            </div>

                            <Button
                                className="w-full"
                                onClick={() => router.push(`/org/${orgSlug}/dashboard`)}
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 shadow-sm">
                            <CalendarDays className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">StaffHub</h1>
                        <p className="text-muted-foreground mt-2">Time Off Portal</p>
                    </Link>
                </div>

                <Card className="border-border/40 shadow-xl shadow-primary/5">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <CardTitle className="text-2xl">Register Your Clinic</CardTitle>
                        </div>
                        <CardDescription className="text-center">
                            Create an organization account to manage your team&apos;s time-off requests
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="organizationName">Organization / Clinic Name</Label>
                                <Input
                                    id="organizationName"
                                    type="text"
                                    placeholder="Acme Medical Clinic"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminName">Your Name (Admin)</Label>
                                <Input
                                    id="adminName"
                                    type="text"
                                    placeholder="Dr. Jane Smith"
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adminEmail">Email Address</Label>
                                <Input
                                    id="adminEmail"
                                    type="email"
                                    placeholder="admin@clinic.com"
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={isLoading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        disabled={isLoading}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Organization...
                                    </>
                                ) : (
                                    <>
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Create Organization
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an organization?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Want to join an existing organization?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Register as staff
                            </Link>
                        </div>
                    </CardFooter>
                </Card>

                <Link href="/">
                    <Button variant="outline" className="mt-6 w-full h-11">
                        <Home className="mr-2 h-4 w-4" />
                        Go to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
