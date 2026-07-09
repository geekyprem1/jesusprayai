"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { PrayerCategory, PrayerEntry } from "@/types/journal";

export type JournalActionResult<T = null> = {
  ok: boolean;
  error?: string;
  data?: T;
};

type AuthOk = { supabase: SupabaseClient; user: User };
type AuthErr = { errorMessage: string };

async function requireUser(): Promise<AuthOk | AuthErr> {
  if (!isSupabaseConfigured()) {
    return {
      errorMessage:
        "Supabase not configured. Entries stay local until you add keys and run migrations.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      errorMessage: "You must be logged in to sync journal entries.",
    };
  }

  return { supabase, user };
}

export async function listPrayerEntries(): Promise<
  JournalActionResult<PrayerEntry[]>
> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }

  const { supabase, user } = auth;
  const { data, error } = await supabase
    .from("prayer_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return {
      ok: false,
      error: `${error.message} (Run supabase/migrations/002_prayer_entries.sql if tables are missing.)`,
    };
  }

  return { ok: true, data: (data ?? []) as PrayerEntry[] };
}

export async function createPrayerEntry(input: {
  bodyPlain: string;
  bodyHtml?: string;
  clientId?: string;
  category?: PrayerCategory;
}): Promise<JournalActionResult<PrayerEntry>> {
  const bodyPlain = input.bodyPlain.trim();
  if (!bodyPlain) {
    return { ok: false, error: "Prayer text is required." };
  }

  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }

  const { supabase, user } = auth;
  const bodyHtml = (input.bodyHtml ?? bodyPlain).trim();
  const category = input.category ?? "uncategorized";
  const clientId = input.clientId ?? crypto.randomUUID();

  if (input.clientId) {
    const { data: existing } = await supabase
      .from("prayer_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("client_id", input.clientId)
      .maybeSingle();

    if (existing) {
      return { ok: true, data: existing as PrayerEntry };
    }
  }

  const { data, error } = await supabase
    .from("prayer_entries")
    .insert({
      user_id: user.id,
      body_plain: bodyPlain,
      body_html: bodyHtml,
      category,
      category_source: "user",
      source: "text",
      client_id: clientId,
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const entry = data as PrayerEntry;

  await supabase.from("prayer_entry_versions").insert({
    entry_id: entry.id,
    body_html: entry.body_html,
    body_plain: entry.body_plain,
    category: entry.category,
    edited_by: user.id,
  });

  revalidatePath("/app/journal");
  return { ok: true, data: entry };
}

export async function updatePrayerEntry(input: {
  id: string;
  bodyPlain: string;
  bodyHtml?: string;
  category?: PrayerCategory;
}): Promise<JournalActionResult<PrayerEntry>> {
  const bodyPlain = input.bodyPlain.trim();
  if (!bodyPlain) {
    return { ok: false, error: "Prayer text is required." };
  }

  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }

  const { supabase, user } = auth;
  const bodyHtml = (input.bodyHtml ?? bodyPlain).trim();

  const { data, error } = await supabase
    .from("prayer_entries")
    .update({
      body_plain: bodyPlain,
      body_html: bodyHtml,
      ...(input.category ? { category: input.category } : {}),
      category_source: "user",
    })
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const entry = data as PrayerEntry;

  await supabase.from("prayer_entry_versions").insert({
    entry_id: entry.id,
    body_html: entry.body_html,
    body_plain: entry.body_plain,
    category: entry.category,
    edited_by: user.id,
  });

  revalidatePath("/app/journal");
  return { ok: true, data: entry };
}

export async function deletePrayerEntry(
  id: string
): Promise<JournalActionResult> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }

  const { supabase, user } = auth;
  const { error } = await supabase
    .from("prayer_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app/journal");
  return { ok: true, data: null };
}
