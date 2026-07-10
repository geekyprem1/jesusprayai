"use server";

import { requireUser } from "@/lib/auth/require-user";
import { isOpenRouterConfigured } from "@/lib/openrouter";
import { createOpenRouterClient, getChatModel } from "@/lib/openrouter";
import { consumeAiQuota } from "@/lib/security/ai-quota";

export type WeeklyInsight = {
  weekStart: string;
  weekEnd: string;
  entryCount: number;
  categoryCounts: Record<string, number>;
  topCategory: string | null;
  answeredCount: number;
  activeRequests: number;
  savedVersesCount: number;
  /** Optional one-liner from AI; null if skipped/failed */
  encouragement: string | null;
};

/** Full home dashboard: AI reflection + retention stats */
export type HomeDashboard = {
  week: WeeklyInsight;
  /** Consecutive days with at least one prayer (ending today or yesterday) */
  prayerStreak: number;
  totalEntries: number;
  totalAnswered: number;
  favoriteVerse: { reference: string; verseText: string } | null;
  /** Pattern-aware reflection for the big home card */
  aiReflection: {
    title: string;
    body: string;
    source: "ai" | "pattern" | "empty";
  };
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Count consecutive calendar days with entries, allowing "today or yesterday" start. */
function computePrayerStreak(createdAts: string[]): number {
  if (!createdAts.length) return 0;

  const days = new Set(createdAts.map(dayKey));
  const sorted = [...days].sort();
  const today = dayKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate.toISOString());

  let cursor = sorted.includes(today)
    ? today
    : sorted.includes(yesterday)
      ? yesterday
      : null;
  if (!cursor) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    const d = new Date(`${cursor}T12:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = dayKey(d.toISOString());
  }
  return streak;
}

function buildPatternReflection(input: {
  entryCount: number;
  topCategory: string | null;
  topN: number;
  streak: number;
  answeredCount: number;
  totalEntries: number;
}): HomeDashboard["aiReflection"] {
  if (input.totalEntries === 0 && input.entryCount === 0) {
    return {
      title: "AI Reflection",
      body: "Write your first prayer — AI will notice patterns and meet you with Scripture.",
      source: "empty",
    };
  }

  if (input.topCategory && input.topN >= 3) {
    return {
      title: "AI Reflection",
      body: `AI noticed that you've prayed about ${input.topCategory} for ${input.topN} times this week. God is near to those who keep bringing the same cares before Him.`,
      source: "pattern",
    };
  }

  if (input.streak >= 3) {
    return {
      title: "AI Reflection",
      body: `A ${input.streak}-day prayer streak — faithfulness in small daily moments shapes a life of trust. Keep showing up.`,
      source: "pattern",
    };
  }

  if (input.answeredCount > 0) {
    return {
      title: "AI Reflection",
      body: `You've marked ${input.answeredCount} answered prayer${input.answeredCount === 1 ? "" : "s"} recently. Pause and thank Him — remembrance fuels faith.`,
      source: "pattern",
    };
  }

  if (input.entryCount > 0) {
    return {
      title: "AI Reflection",
      body: `Today's encouragement from your prayers: you brought ${input.entryCount} prayer${input.entryCount === 1 ? "" : "s"} before the Lord this week. He hears every one.`,
      source: "pattern",
    };
  }

  return {
    title: "AI Reflection",
    body: "This week is a blank page. Even a short prayer of thanks draws you near to Him.",
    source: "empty",
  };
}

export async function getWeeklyInsight(): Promise<{
  ok: boolean;
  data?: WeeklyInsight;
  error?: string;
}> {
  const dash = await getHomeDashboard();
  if (!dash.ok || !dash.data) {
    return { ok: false, error: dash.error };
  }
  return { ok: true, data: dash.data.week };
}

export async function getHomeDashboard(): Promise<{
  ok: boolean;
  data?: HomeDashboard;
  error?: string;
}> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const weekEnd = new Date();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const startIso = weekStart.toISOString();
  const endIso = weekEnd.toISOString();

  // Last ~90 days of entry dates for streak + week slice
  const streakWindow = new Date();
  streakWindow.setDate(streakWindow.getDate() - 90);

  const { data: recentEntries, error: e1 } = await supabase
    .from("prayer_entries")
    .select("category, created_at")
    .eq("user_id", user.id)
    .gte("created_at", streakWindow.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  if (e1) {
    return { ok: false, error: e1.message };
  }

  const allRecent = recentEntries ?? [];
  const weekEntries = allRecent.filter(
    (row) => row.created_at >= startIso && row.created_at <= endIso
  );

  const categoryCounts: Record<string, number> = {};
  for (const row of weekEntries) {
    const c = (row.category as string) || "uncategorized";
    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
  }

  let topCategory: string | null = null;
  let topN = 0;
  for (const [k, v] of Object.entries(categoryCounts)) {
    if (v > topN) {
      topN = v;
      topCategory = k;
    }
  }

  const { count: weekAnsweredCount } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "answered")
    .gte("answered_at", startIso);

  const { count: totalAnswered } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "answered");

  const { count: activeRequests } = await supabase
    .from("prayer_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["pending", "ongoing"]);

  const { count: savedVersesCount } = await supabase
    .from("prayer_entry_verses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("saved", true);

  const { count: totalEntries } = await supabase
    .from("prayer_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: favVerse } = await supabase
    .from("prayer_entry_verses")
    .select("reference, verse_text")
    .eq("user_id", user.id)
    .eq("saved", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const entryCount = weekEntries.length;
  const prayerStreak = computePrayerStreak(
    allRecent.map((r) => r.created_at as string)
  );

  let encouragement: string | null = null;
  let aiBody: string | null = null;

  if (isOpenRouterConfigured() && entryCount > 0) {
    const quota = await consumeAiQuota(supabase, user.id, "ai");
    if (quota.ok) {
      try {
        const gen = await generateEncouragement({
          entryCount,
          categoryCounts,
          topCategory,
          answeredCount: weekAnsweredCount ?? 0,
          streak: prayerStreak,
        });
        encouragement = gen;
        aiBody = gen;
      } catch {
        encouragement = null;
      }
    }
  }

  if (!encouragement && entryCount === 0) {
    encouragement =
      "This week is a blank page. Even a short prayer of thanks draws you near to Him.";
  } else if (!encouragement && entryCount > 0) {
    encouragement = `You brought ${entryCount} prayer${entryCount === 1 ? "" : "s"} before the Lord this week. He hears you.`;
  }

  const pattern = buildPatternReflection({
    entryCount,
    topCategory,
    topN,
    streak: prayerStreak,
    answeredCount: weekAnsweredCount ?? 0,
    totalEntries: totalEntries ?? 0,
  });

  const aiReflection: HomeDashboard["aiReflection"] = aiBody
    ? {
        title: "AI Reflection",
        body: aiBody,
        source: "ai",
      }
    : pattern;

  return {
    ok: true,
    data: {
      week: {
        weekStart: startIso.slice(0, 10),
        weekEnd: endIso.slice(0, 10),
        entryCount,
        categoryCounts,
        topCategory,
        answeredCount: weekAnsweredCount ?? 0,
        activeRequests: activeRequests ?? 0,
        savedVersesCount: savedVersesCount ?? 0,
        encouragement,
      },
      prayerStreak,
      totalEntries: totalEntries ?? 0,
      totalAnswered: totalAnswered ?? 0,
      favoriteVerse: favVerse
        ? {
            reference: favVerse.reference as string,
            verseText: (favVerse.verse_text as string) ?? "",
          }
        : null,
      aiReflection,
    },
  };
}

async function generateEncouragement(input: {
  entryCount: number;
  categoryCounts: Record<string, number>;
  topCategory: string | null;
  answeredCount: number;
  streak: number;
}): Promise<string> {
  const client = createOpenRouterClient();
  const model = getChatModel("devotional");

  const completion = await Promise.race([
    client.chat.completions.create({
      model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: `You write a short AI prayer reflection (2–3 sentences) for a Christian journal app.
If a category dominates, say "I noticed you've prayed about X…" and point gently to God's character or a well-known verse reference (e.g. Isaiah 41:10) without long quotes.
Base only on the stats given. No medical advice. Tone: pastoral, warm, hopeful. Plain text only.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            prayer_entries_last_7_days: input.entryCount,
            category_counts: input.categoryCounts,
            top_category: input.topCategory,
            prayer_streak_days: input.streak,
            requests_marked_answered_this_week: input.answeredCount,
          }),
        },
      ],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    ),
  ]);

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("empty");
  return text.replace(/^["']|["']$/g, "");
}
