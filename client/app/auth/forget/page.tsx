"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/config";
import { useForgetPassword } from "@/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";

export default function ForgetPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return null;
  }
  const forget = useForgetPassword();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    toast.promise(forget.mutateAsync(email), {
      loading: "Sending mail...",
      success: (data) => data.msg,
      error: (error) => error.message,
    });
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl">Forgot Password? 🔒</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you instructions to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={forget.isPending}>
            {forget.isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            ← Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
