"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { LIMITS } from "@/lib/security/limits";
import { rateLimit } from "@/lib/security/rate-limit";
import { safeNextPath } from "@/lib/security/safe-next";
import { headers } from "next/headers";

export type AuthState = {
  error?: string;
  success?: string;
};

function notConfigured(): AuthState {
  return {
    error:
      "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to praynote/.env.local, then restart the dev server.",
  };
}

async function authRateLimitKey(email: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown";
  return `auth:${ip}:${email.toLowerCase().slice(0, 64)}`;
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return notConfigured();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < LIMITS.passwordMinLength) {
    return {
      error: `Password must be at least ${LIMITS.passwordMinLength} characters.`,
    };
  }

  const rl = rateLimit(
    await authRateLimitKey(email),
    LIMITS.authPerIpPer15Min,
    15 * 60 * 1000
  );
  if (!rl.ok) {
    return {
      error: `Too many attempts. Try again in ${rl.retryAfterSec}s.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || undefined },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Account created. Check your email to confirm if required, then log in.",
  };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return notConfigured();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), "/app");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const rl = rateLimit(
    await authRateLimitKey(email),
    LIMITS.authPerIpPer15Min,
    15 * 60 * 1000
  );
  if (!rl.ok) {
    return {
      error: `Too many attempts. Try again in ${rl.retryAfterSec}s.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(next);
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
