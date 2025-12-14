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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, Eye, EyeOff, Home, Loader2, Building2, CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgValidated, setOrgValidated] = useState<boolean | null>(null);
  const [validatedOrgId, setValidatedOrgId] = useState<string | null>(null);
  const [, setValidatedOrgSlug] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Validate org name when user finishes typing
  const validateOrg = async (name: string) => {
    if (!name.trim()) {
      setOrgValidated(null);
      setValidatedOrgId(null);
      setValidatedOrgSlug(null);
      return;
    }

    setIsValidating(true);
    try {
      // Search by name (case-insensitive) or slug
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("organizations")
        .select("id, name, slug")
        .or(`name.ilike.${name.trim()},slug.eq.${name.trim().toLowerCase().replace(/\s+/g, '-')}`)
        .limit(1)
        .single();

      if (error || !data) {
        setOrgValidated(false);
        setValidatedOrgId(null);
        setValidatedOrgSlug(null);
      } else {
        setOrgValidated(true);
        setValidatedOrgId(data.id);
        setValidatedOrgSlug(data.slug);
      }
    } catch {
      setOrgValidated(false);
      setValidatedOrgId(null);
      setValidatedOrgSlug(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgValidated || !validatedOrgId) {
      toast.error("Please enter a valid organization name");
      return;
    }

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "staff",
            organization_id: validatedOrgId,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created! You can now sign in.");
      router.push("/login");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle className="text-2xl text-center">
              Join Your Organization
            </CardTitle>
            <CardDescription className="text-center">
              Register as a staff member to manage your time-off requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleEmailRegister} className="space-y-4">
              {/* Organization Name Input */}
              <div className="space-y-2">
                <Label htmlFor="organization">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Organization Name *
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Enter your clinic/organization name"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setOrgValidated(null); // Reset validation on change
                    }}
                    onBlur={() => validateOrg(orgName)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidating && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!isValidating && orgValidated === true && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {!isValidating && orgValidated === false && (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {orgValidated === false && (
                  <p className="text-xs text-red-500">
                    Organization not found. Check the name or ask your admin.
                  </p>
                )}
                {orgValidated === true && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ Organization found
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ask your clinic administrator for the exact organization name.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !orgValidated}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Join Organization
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
            <Separator />
            <div className="text-center text-sm text-muted-foreground">
              Are you a clinic administrator?{" "}
              <Link
                href="/register-org"
                className="text-primary hover:underline font-medium"
              >
                Register your organization
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
