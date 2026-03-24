"use client";

import { Aperture, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/config";
import { useLogin } from "@/hooks/useAuth";
import { Testimonials } from "@/components/testimonials";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return null;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await login.mutateAsync({ email, password });
      if (data.status === true) {
        toast.success(data.msg || "Login successful!");
        setTimeout(() => router.push("/dashboard"), 500);
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 lg:divide-x">
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-md px-10 py-14 sm:rounded-2xl sm:border sm:bg-card sm:shadow-2xl/5">
          <Aperture className="mx-auto size-8" />
          <h1 className="mt-3 text-center font-semibold text-2xl">
            Welcome to {siteConfig.name}
          </h1>

          <div className="mt-10">
            <Button
              className="w-full"
              size="lg"
              type="button"
              variant="outline"
            >
              Continue with Google
            </Button>

            <div className="my-6 flex items-center justify-center gap-2 overflow-hidden">
              <Separator />
              <span className="text-muted-foreground text-sm">OR</span>
              <Separator />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email or Username
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/auth/forget"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="rounded border-input"
                />
                <label htmlFor="remember-me" className="text-sm">
                  Remember Me
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            New on our platform?{" "}
            <Link
              className="text-foreground hover:underline"
              href="/auth/register"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden lg:flex min-h-screen flex-col overflow-hidden bg-muted/50 dark:bg-muted/30">
        <Testimonials />

        <div
          className="absolute inset-0 -top-px -left-px -z-1 dark:opacity-70"
          style={{
            backgroundImage: `
          linear-gradient(to right, color-mix(in srgb,var(--foreground) 20%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb,var(--foreground) 20%, transparent) 1px, transparent 1px)
        `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: `
          repeating-linear-gradient(
            to right,
            black 0px,
            black 3px,
            transparent 3px,
            transparent 8px
          ),
          repeating-linear-gradient(
            to bottom,
            black 0px,
            black 3px,
            transparent 3px,
            transparent 8px
          )
        `,
            WebkitMaskImage: `
          repeating-linear-gradient(
            to right,
            black 0px,
            black 3px,
            transparent 3px,
            transparent 8px
          ),
          repeating-linear-gradient(
            to bottom,
            black 0px,
            black 3px,
            transparent 3px,
            transparent 8px
          )
        `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
      </div>
    </div>
  );
}
