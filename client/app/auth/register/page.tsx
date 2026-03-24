"use client";

import { Aperture, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/config";
import { useRegister } from "@/hooks/useAuth";
import { Testimonials } from "@/components/testimonials";
import { useAuth } from "@/context/AuthContext";

function RegisterForm() {
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
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const register = useRegister();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("Password doesn't match");
      return;
    }

    if (!email || !password || !username || !phone) {
      toast.error("All fields are required");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      toast.error("Enter Gmail only");
      return;
    }

    if (phone.length !== 10) {
      toast.error("Invalid Phone Number");
      return;
    }

    toast.promise(
      register.mutateAsync({ email, password, username, phone, plan }),
      {
        loading: "Creating account...",
        success: (data) => {
          setTimeout(() => router.push("/dashboard"), 3000);
          return "Successfully registered!";
        },
        error: (error) => error.message,
      },
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x">
      <div className="flex h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-md px-10 py-14 sm:rounded-2xl sm:border sm:bg-card sm:shadow-2xl/5">
          <Aperture className="mx-auto size-8" />
          <h1 className="mt-3 text-center font-semibold text-2xl">
            Adventure starts here
          </h1>
          <p className="mt-2 text-center text-muted-foreground text-sm">
            Make your tracking management easy and fun!
          </p>

          <div className="mt-10">
            {/* <Button
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
            </div> */}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  className="mt-2"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  className="mt-2"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  className="mt-2"
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  className="mt-2"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password-confirm"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <Input
                  id="password-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={passwordConfirm}
                  className="mt-2"
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-input mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to{" "}
                  <Link href="#" className="text-primary hover:underline">
                    privacy policy & terms
                  </Link>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign up
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              className="text-foreground hover:underline"
              href="/auth/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-muted/50 dark:bg-muted/30 items-center justify-center">
        {/* <Testimonials /> */}
        <h1 className="text-7xl font-bold text-center text-foreground">
          Earning Area
        </h1>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
