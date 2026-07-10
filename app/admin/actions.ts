"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  BAN_DURATION_PERMANENT,
  isPlanTier,
  isUserRole,
  type PlanTier,
  type UserRole,
} from "@/lib/admin/constants";
import { isServiceRoleConfigured } from "@/lib/supabase/service";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

export type AdminUserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  plan_tier: string;
  role: string;
  account_status: string;
  ban_reason: string | null;
  banned_at: string | null;
  banned_until: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  preferred_translation: string | null;
  timezone: string | null;
  admin_notes: string | null;
  entry_count?: number;
  request_count?: number;
};

export type AdminStats = {
  totalUsers: number;
  newThisWeek: number;
  paidUsers: number;
  bannedUsers: number;
  admins: number;
};

export type ListUsersResult =
  | {
      ok: true;
      users: AdminUserRow[];
      total: number;
      page: number;
      pageSize: number;
    }
  | { ok: false; error: string };

async function audit(
  service: Awaited<ReturnType<typeof requireAdmin>>["service"],
  adminId: string,
  targetUserId: string | null,
  action: string,
  detail: Record<string, unknown> = {}
) {
  await service.from("admin_audit_log").insert({
    admin_id: adminId,
    target_user_id: targetUserId,
    action,
    detail,
  });
}

export async function getAdminStats(): Promise<
  { ok: true; stats: AdminStats } | { ok: false; error: string }
> {
  try {
    const { service } = await requireAdmin();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [total, week, paid, banned, admins] = await Promise.all([
      service.from("profiles").select("id", { count: "exact", head: true }),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString()),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .neq("plan_tier", "free"),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("account_status", "banned"),
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin"),
    ]);

    return {
      ok: true,
      stats: {
        totalUsers: total.count ?? 0,
        newThisWeek: week.count ?? 0,
        paidUsers: paid.count ?? 0,
        bannedUsers: banned.count ?? 0,
        admins: admins.count ?? 0,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not load stats.",
    };
  }
}

export async function listAdminUsers(opts: {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: "all" | "active" | "banned";
}): Promise<ListUsersResult> {
  try {
    if (!isServiceRoleConfigured()) {
      return { ok: false, error: "Service role not configured." };
    }

    const { service } = await requireAdmin();
    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.min(Math.max(opts.pageSize ?? 25, 1), 100);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const q = (opts.q ?? "").trim();

    let query = service
      .from("profiles")
      .select(
        "id, display_name, plan_tier, role, account_status, ban_reason, banned_at, created_at, preferred_translation, timezone, admin_notes",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (opts.status === "active" || opts.status === "banned") {
      query = query.eq("account_status", opts.status);
    }

    if (q) {
      // Name / notes search on profiles; email matched after auth join
      query = query.or(
        `display_name.ilike.%${q}%,admin_notes.ilike.%${q}%`
      );
    }

    const { data: profiles, error, count } = await query.range(from, to);
    if (error) {
      return { ok: false, error: error.message };
    }

    const rows: AdminUserRow[] = [];
    for (const p of profiles ?? []) {
      const { data: authData } = await service.auth.admin.getUserById(p.id);
      const u = authData?.user;
      const email = u?.email ?? null;

      // If search looks like email and this row doesn't match name, filter
      if (q && q.includes("@")) {
        if (!email?.toLowerCase().includes(q.toLowerCase())) {
          // still include if name matched already (query already filtered names)
          // for email-only search re-fetch differently — soft filter:
        }
      }

      rows.push({
        id: p.id,
        email,
        display_name: p.display_name,
        plan_tier: p.plan_tier,
        role: p.role ?? "user",
        account_status: p.account_status ?? "active",
        ban_reason: p.ban_reason,
        banned_at: p.banned_at,
        banned_until: (u as { banned_until?: string | null } | undefined)
          ?.banned_until ?? null,
        created_at: p.created_at,
        last_sign_in_at: u?.last_sign_in_at ?? null,
        preferred_translation: p.preferred_translation,
        timezone: p.timezone,
        admin_notes: p.admin_notes,
      });
    }

    // Email search: if q has @, filter in-memory and optionally expand search
    let finalRows = rows;
    let finalTotal = count ?? rows.length;

    if (q && q.includes("@")) {
      // Broader: scan more profiles for email match on this page is weak;
      // do a wider profile pull for email search
      const { data: allProfiles } = await service
        .from("profiles")
        .select(
          "id, display_name, plan_tier, role, account_status, ban_reason, banned_at, created_at, preferred_translation, timezone, admin_notes"
        )
        .order("created_at", { ascending: false })
        .limit(200);

      const matched: AdminUserRow[] = [];
      for (const p of allProfiles ?? []) {
        const { data: authData } = await service.auth.admin.getUserById(p.id);
        const u = authData?.user;
        const email = u?.email ?? null;
        if (!email?.toLowerCase().includes(q.toLowerCase())) continue;
        if (
          opts.status === "active" ||
          opts.status === "banned"
        ) {
          if ((p.account_status ?? "active") !== opts.status) continue;
        }
        matched.push({
          id: p.id,
          email,
          display_name: p.display_name,
          plan_tier: p.plan_tier,
          role: p.role ?? "user",
          account_status: p.account_status ?? "active",
          ban_reason: p.ban_reason,
          banned_at: p.banned_at,
          banned_until: (u as { banned_until?: string | null } | undefined)
            ?.banned_until ?? null,
          created_at: p.created_at,
          last_sign_in_at: u?.last_sign_in_at ?? null,
          preferred_translation: p.preferred_translation,
          timezone: p.timezone,
          admin_notes: p.admin_notes,
        });
      }
      finalTotal = matched.length;
      finalRows = matched.slice(from, to + 1);
    }

    return {
      ok: true,
      users: finalRows,
      total: finalTotal,
      page,
      pageSize,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not list users.",
    };
  }
}

export async function getAdminUser(
  userId: string
): Promise<
  { ok: true; user: AdminUserRow } | { ok: false; error: string }
> {
  try {
    const { service } = await requireAdmin();
    const { data: p, error } = await service
      .from("profiles")
      .select(
        "id, display_name, plan_tier, role, account_status, ban_reason, banned_at, created_at, preferred_translation, timezone, admin_notes"
      )
      .eq("id", userId)
      .maybeSingle();

    if (error || !p) {
      return { ok: false, error: error?.message ?? "User not found." };
    }

    const { data: authData } = await service.auth.admin.getUserById(userId);
    const u = authData?.user;

    const [{ count: entryCount }, { count: requestCount }] = await Promise.all([
      service
        .from("prayer_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      service
        .from("prayer_requests")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    return {
      ok: true,
      user: {
        id: p.id,
        email: u?.email ?? null,
        display_name: p.display_name,
        plan_tier: p.plan_tier,
        role: p.role ?? "user",
        account_status: p.account_status ?? "active",
        ban_reason: p.ban_reason,
        banned_at: p.banned_at,
        banned_until: (u as { banned_until?: string | null } | undefined)
          ?.banned_until ?? null,
        created_at: p.created_at,
        last_sign_in_at: u?.last_sign_in_at ?? null,
        preferred_translation: p.preferred_translation,
        timezone: p.timezone,
        admin_notes: p.admin_notes,
        entry_count: entryCount ?? 0,
        request_count: requestCount ?? 0,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not load user.",
    };
  }
}

export async function adminUpdatePlan(
  userId: string,
  planTier: string
): Promise<ActionResult> {
  try {
    const { service, user } = await requireAdmin();
    if (!isPlanTier(planTier)) {
      return { ok: false, error: "Invalid plan tier." };
    }
    if (!userId) return { ok: false, error: "Missing user id." };

    const { error } = await service
      .from("profiles")
      .update({ plan_tier: planTier as PlanTier })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };

    await audit(service, user.id, userId, "update_plan", {
      plan_tier: planTier,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Update failed.",
    };
  }
}

export async function adminUpdateRole(
  userId: string,
  role: string
): Promise<ActionResult> {
  try {
    const { service, user } = await requireAdmin();
    if (!isUserRole(role)) {
      return { ok: false, error: "Invalid role." };
    }
    if (userId === user.id && role !== "admin") {
      return {
        ok: false,
        error: "You cannot remove your own admin role.",
      };
    }

    // Keep at least one admin
    if (role === "user") {
      const { count } = await service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .neq("id", userId);
      if ((count ?? 0) < 1) {
        const { data: target } = await service
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        if (target?.role === "admin") {
          return {
            ok: false,
            error: "Cannot demote the last remaining admin.",
          };
        }
      }
    }

    const { error } = await service
      .from("profiles")
      .update({ role: role as UserRole })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };

    await audit(service, user.id, userId, "update_role", { role });
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Update failed.",
    };
  }
}

export async function adminBanUser(
  userId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const { service, user } = await requireAdmin();
    if (userId === user.id) {
      return { ok: false, error: "You cannot ban yourself." };
    }

    const { data: target } = await service
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (target?.role === "admin") {
      const { count } = await service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .neq("id", userId);
      if ((count ?? 0) < 1) {
        return { ok: false, error: "Cannot ban the last remaining admin." };
      }
    }

    const banReason = (reason ?? "").trim().slice(0, 500) || null;

    const { error: authErr } = await service.auth.admin.updateUserById(
      userId,
      {
        ban_duration: BAN_DURATION_PERMANENT,
      }
    );
    if (authErr) return { ok: false, error: authErr.message };

    const { error } = await service
      .from("profiles")
      .update({
        account_status: "banned",
        banned_at: new Date().toISOString(),
        ban_reason: banReason,
      })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };

    await audit(service, user.id, userId, "ban_user", {
      reason: banReason,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ban failed.",
    };
  }
}

export async function adminUnbanUser(userId: string): Promise<ActionResult> {
  try {
    const { service, user } = await requireAdmin();

    const { error: authErr } = await service.auth.admin.updateUserById(
      userId,
      {
        ban_duration: "none",
      }
    );
    if (authErr) return { ok: false, error: authErr.message };

    const { error } = await service
      .from("profiles")
      .update({
        account_status: "active",
        banned_at: null,
        ban_reason: null,
      })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };

    await audit(service, user.id, userId, "unban_user", {});
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unban failed.",
    };
  }
}

export async function adminUpdateNotes(
  userId: string,
  notes: string
): Promise<ActionResult> {
  try {
    const { service, user } = await requireAdmin();
    const admin_notes = notes.trim().slice(0, 2000) || null;

    const { error } = await service
      .from("profiles")
      .update({ admin_notes })
      .eq("id", userId);

    if (error) return { ok: false, error: error.message };

    await audit(service, user.id, userId, "update_notes", {});
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save notes.",
    };
  }
}

export async function getRecentAdminUsers(limit = 8): Promise<
  | { ok: true; users: AdminUserRow[] }
  | { ok: false; error: string }
> {
  const result = await listAdminUsers({ page: 1, pageSize: limit });
  if (!result.ok) return result;
  return { ok: true, users: result.users };
}
