import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/security/safe-next";

/**
 * OAuth / magic-link callback — exchanges ?code= for a session cookie.
 * Configure in Supabase: Authentication → URL Configuration → Redirect URLs
 *   http://localhost:3000/auth/callback
 *   https://YOUR_DOMAIN/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/app");
  const err = searchParams.get("error");
  const errDesc = searchParams.get("error_description");

  if (err) {
    const login = new URL("/login", origin);
    login.searchParams.set(
      "error",
      errDesc || err || "Google sign-in was cancelled."
    );
    return NextResponse.redirect(login);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=Auth+not+configured", origin));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    const login = new URL("/login", origin);
    login.searchParams.set(
      "error",
      error.message || "Could not complete sign-in."
    );
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(
    new URL("/login?error=Missing+auth+code.+Try+again.", origin)
  );
}
