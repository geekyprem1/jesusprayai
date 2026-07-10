"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { LIMITS } from "@/lib/security/limits";

export type RequestStatus = "pending" | "ongoing" | "answered";
export type RequestCategory =
  | "health"
  | "family"
  | "finances"
  | "work"
  | "spiritual"
  | "community"
  | "other";

export type PrayerRequest = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: RequestCategory;
  status: RequestStatus;
  answered_at: string | null;
  reflection_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ActionResult<T = null> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export async function listPrayerRequests(opts?: {
  status?: RequestStatus | "all" | "archive";
}): Promise<ActionResult<PrayerRequest[]>> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  let q = supabase
    .from("prayer_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (opts?.status === "archive") {
    q = q.eq("status", "answered");
  } else if (opts?.status && opts.status !== "all") {
    q = q.eq("status", opts.status);
  }

  const { data, error } = await q;
  if (error) {
    return {
      ok: false,
      error: `${error.message} (Run 003_phase3_ai_requests.sql if missing.)`,
    };
  }
  return { ok: true, data: (data ?? []) as PrayerRequest[] };
}

export async function createPrayerRequest(input: {
  title: string;
  description?: string;
  category?: RequestCategory;
}): Promise<ActionResult<PrayerRequest>> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > LIMITS.requestTitleMax) {
    return {
      ok: false,
      error: `Title is too long (max ${LIMITS.requestTitleMax} characters).`,
    };
  }
  const description = input.description?.trim() || "";
  if (description.length > LIMITS.requestDescriptionMax) {
    return {
      ok: false,
      error: `Description is too long (max ${LIMITS.requestDescriptionMax} characters).`,
    };
  }

  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      category: input.category ?? "other",
      status: "pending",
    })
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };

  const row = data as PrayerRequest;
  await supabase.from("prayer_request_events").insert({
    request_id: row.id,
    from_status: null,
    to_status: "pending",
    note: "Created",
  });

  revalidatePath("/app/requests");
  return { ok: true, data: row };
}

export async function transitionRequestStatus(input: {
  id: string;
  toStatus: RequestStatus;
  reflectionNote?: string;
}): Promise<ActionResult<PrayerRequest>> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { data: current, error: curErr } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("id", input.id)
    .eq("user_id", user.id)
    .single();

  if (curErr || !current) {
    return { ok: false, error: curErr?.message ?? "Request not found." };
  }

  if (input.toStatus === "answered") {
    const note = input.reflectionNote?.trim();
    if (!note) {
      return {
        ok: false,
        error: "Add a short reflection note when marking answered.",
      };
    }
  }

  const patch: Record<string, unknown> = {
    status: input.toStatus,
  };
  if (input.toStatus === "answered") {
    patch.answered_at = new Date().toISOString();
    patch.reflection_note = input.reflectionNote!.trim();
  }

  const { data, error } = await supabase
    .from("prayer_requests")
    .update(patch)
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };

  await supabase.from("prayer_request_events").insert({
    request_id: input.id,
    from_status: current.status,
    to_status: input.toStatus,
    note:
      input.toStatus === "answered"
        ? input.reflectionNote?.trim()
        : `Status → ${input.toStatus}`,
  });

  revalidatePath("/app/requests");
  return { ok: true, data: data as PrayerRequest };
}

export async function deletePrayerRequest(
  id: string
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("prayer_requests")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/requests");
  return { ok: true, data: null };
}
