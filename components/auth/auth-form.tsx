"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthFormProps {
  mode: "signIn" | "signUp";
}

export function AuthForm({ mode }: AuthFormProps) {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  console.log("isAuthenticated: ", isAuthenticated);
  console.log("AuthLoading: ", authLoading);
  console.log("Mode: ", mode);
  const router = useRouter();
  const searchParams = useSearchParams();
  // const redirectTo = searchParams.get("redirect") || "/";
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const params: Record<string, string> = {
        email,
        password,
        flow: mode,
      };
      if (mode === "signUp" && name) {
        params.name = name;
      }
      await signIn("password", params);
      toast(mode === "signIn" ? "Welcome back!" : "Account created!");

      window.location.href = redirectTo;

    } catch (err) {
      console.error("Authentication Error: ", err);

      let message = "An unexpected error occured. Please try again.";

      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        if (errorMsg.includes("InvalidSecret") || errorMsg.includes("invalid password")) {
          message = "Invalid email or password. Please try again.";
        } else if (errorMsg.includes("already exists")) {
          message = "An account with this email already exists. Please sign in instead.";
        } else if (errorMsg.includes("timed out") || errorMsg.includes("timeout")) {
          message = "The request took too long to process. Please try again.";
        } else if (errorMsg.includes("network error") || errorMsg.includes("failed to fetch")) {
          message = "Please check your internet connecton and try again."
        } else {
          message = err.message
        }
      }

      setError(message);
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="pt-6">
            <div className="text-center">Loading...</div>
            <Skeleton className="h-12" />
          </CardTitle>
        </CardHeader>

      </Card>
    );
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "signIn" ? "Sign in" : "Create account"}</CardTitle>
        <CardDescription>
          {mode === "signIn"
            ? "Welcome back to StudyFlow"
            : "Get started with StudyFlow"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signUp" && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="mt-1"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            {mode === "signIn" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}