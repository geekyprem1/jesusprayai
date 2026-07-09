import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthOk = { supabase: SupabaseClient; user: User };
export type AuthErr = { errorMessage: string };

export async function requireUser(): Promise<AuthOk | AuthErr> {
  if (!isSupabaseConfigured()) {
    return {
      errorMessage: "Supabase not configured. Add keys to .env.local.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { errorMessage: "You must be logged in." };
  }

  return { supabase, user };
}
