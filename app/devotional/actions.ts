"use server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type DailyDevotional = {
  id: string;
  publish_date: string;
  verse_reference: string;
  verse_text: string;
  translation: string;
  reflection: string;
};

export async function getTodayDevotional(): Promise<{
  ok: boolean;
  data?: DailyDevotional | null;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase not configured." };
  }

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("daily_devotionals")
      .select("*")
      .eq("publish_date", today)
      .maybeSingle();

    if (error) {
      return { ok: false, error: error.message };
    }

    if (data) {
      return { ok: true, data: data as DailyDevotional };
    }

    // Fallback: latest available
    const { data: latest, error: latestErr } = await supabase
      .from("daily_devotionals")
      .select("*")
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestErr) {
      return { ok: false, error: latestErr.message };
    }

    return { ok: true, data: (latest as DailyDevotional) ?? null };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to load devotional",
    };
  }
}
