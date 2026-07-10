import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  isLikelyNewUser,
  sendWelcomeEmail,
} from "@/lib/email/resend";
import { safeNextPath } from "@/lib/security/safe-next";

/**
 * OAuth / magic-link callback — exchanges ?code= for a session cookie.
 * New Google users also get a welcome email (best-effort).
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
    return NextResponse.redirect(
      new URL("/login?error=Auth+not+configured", origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Welcome email for brand-new OAuth accounts only
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email && isLikelyNewUser(user.created_at)) {
          const meta = user.user_metadata ?? {};
          void sendWelcomeEmail({
            to: user.email,
            displayName:
              (meta.full_name as string | undefined) ||
              (meta.name as string | undefined) ||
              (meta.display_name as string | undefined),
          }).catch(() => undefined);
        }
      } catch {
        /* never block login on email */
      }

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
