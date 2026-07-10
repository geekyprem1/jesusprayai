import type { SupabaseClient } from "@supabase/supabase-js";
import { LIMITS } from "@/lib/security/limits";

function utcDayStart(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

function isMissingTableError(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  return (
    code === "42P01" ||
    (m.includes("ai_usage_daily") && m.includes("does not exist")) ||
    m.includes("could not find the table") ||
    (m.includes("relation") && m.includes("does not exist"))
  );
}

/**
 * Check and consume one AI / Whisper call for the user (DB-backed daily quota).
 * Soft-allows if migration 005 not applied yet (logs warning).
 */
export async function consumeAiQuota(
  supabase: SupabaseClient,
  userId: string,
  kind: "ai" | "whisper" = "ai"
): Promise<{ ok: true; remaining: number } | { ok: false; error: string }> {
  const day = utcDayStart();
  const limit =
    kind === "whisper" ? LIMITS.whisperPerDay : LIMITS.aiCallsPerDay;

  const { data: row, error: readErr } = await supabase
    .from("ai_usage_daily")
    .select("ai_count, whisper_count")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (readErr) {
    if (isMissingTableError(readErr.message, readErr.code)) {
      console.warn(
        "[ai-quota] ai_usage_daily missing — run supabase/migrations/005_security_hardening.sql"
      );
      return { ok: true, remaining: limit };
    }
    return { ok: false, error: readErr.message };
  }

  const aiCount = Number(row?.ai_count ?? 0);
  const whisperCount = Number(row?.whisper_count ?? 0);
  const current = kind === "whisper" ? whisperCount : aiCount;

  if (current >= limit) {
    return {
      ok: false,
      error:
        kind === "whisper"
          ? `Daily voice limit reached (${limit}). Try again tomorrow.`
          : `Daily AI limit reached (${limit}). Try again tomorrow.`,
    };
  }

  const nextAi = kind === "ai" ? aiCount + 1 : aiCount;
  const nextWhisper = kind === "whisper" ? whisperCount + 1 : whisperCount;

  const { error: upErr } = await supabase.from("ai_usage_daily").upsert(
    {
      user_id: userId,
      day,
      ai_count: nextAi,
      whisper_count: nextWhisper,
    },
    { onConflict: "user_id,day" }
  );

  if (upErr) {
    if (isMissingTableError(upErr.message, upErr.code)) {
      return { ok: true, remaining: limit - 1 };
    }
    return { ok: false, error: upErr.message };
  }

  const used = kind === "whisper" ? nextWhisper : nextAi;
  return { ok: true, remaining: Math.max(0, limit - used) };
}
