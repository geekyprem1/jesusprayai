"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthState } from "@/app/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  nextPath?: string;
  /** Optional error from OAuth callback (?error=) */
  oauthError?: string | null;
};

export function AuthForm({
  mode,
  action,
  nextPath = "/app",
  oauthError,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Primary: Google — lowest friction */}
      <GoogleSignInButton
        nextPath={nextPath}
        label={
          mode === "login" ? "Continue with Google" : "Sign up with Google"
        }
      />

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card px-2 text-muted-foreground">
            or with email
          </span>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="grid gap-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={10}
            placeholder="At least 10 characters"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </div>

        <input type="hidden" name="next" value={nextPath} />

        {(oauthError || state.error) && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {oauthError || state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
            {state.success}{" "}
            {mode === "signup" && (
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Go to login
              </Link>
            )}
          </p>
        )}

        {mode === "signup" && (
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            By creating an account you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Terms
            </Link>
            ,{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            , and{" "}
            <Link
              href="/disclaimer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Disclaimer
            </Link>
            .
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending
            ? "Please wait…"
            : mode === "login"
              ? "Log in with email"
              : "Create account with email"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              No account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
