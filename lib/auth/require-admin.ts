import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth/require-user";
import {
  createServiceClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/service";

export type AdminOk = {
  supabase: SupabaseClient;
  service: SupabaseClient;
  user: User;
  role: "admin";
};

export type AdminProfile = {
  id: string;
  display_name: string | null;
  role: string;
  plan_tier: string;
  account_status: string;
};

/**
 * Ensures the current session is an admin. Redirects otherwise.
 * Uses service client for privileged admin operations.
 */
export async function requireAdmin(): Promise<AdminOk> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    redirect(`/login?next=${encodeURIComponent("/admin")}`);
  }

  if (!isServiceRoleConfigured()) {
    redirect("/app?error=admin_misconfigured");
  }

  const service = createServiceClient();
  const { data: profile, error } = await service
    .from("profiles")
    .select("id, role, account_status")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== "admin") {
    redirect("/app");
  }

  if (profile.account_status === "banned") {
    redirect("/login?error=banned");
  }

  return {
    supabase: auth.supabase,
    service,
    user: auth.user,
    role: "admin",
  };
}

/** Soft check for UI (nav link) — does not redirect. */
export async function getIsAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId || !isServiceRoleConfigured()) return false;
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}
