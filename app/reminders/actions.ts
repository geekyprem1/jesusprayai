"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { nextDailyRunAt } from "@/lib/reminders/schedule";
import { trackEvent } from "@/lib/analytics";

export type ActionResult<T = null> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export async function getReminderSettings(): Promise<
  ActionResult<{
    timezone: string;
    dailyReminderTime: string | null;
    reminderChannel: string;
    nextRunAt: string | null;
    enabled: boolean;
  }>
> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("timezone, daily_reminder_time, reminder_channel")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      error: `${error.message} (Run 004_reminders.sql if needed.)`,
    };
  }

  const { data: reminder } = await supabase
    .from("reminders")
    .select("next_run_at, enabled")
    .eq("user_id", user.id)
    .eq("kind", "daily_prayer")
    .maybeSingle();

  const time = profile?.daily_reminder_time as string | null | undefined;
  // Postgres time may come as "08:00:00"
  const dailyReminderTime = time ? time.slice(0, 5) : null;

  return {
    ok: true,
    data: {
      timezone: (profile?.timezone as string) || "UTC",
      dailyReminderTime,
      reminderChannel:
        (profile?.reminder_channel as string) || "email",
      nextRunAt: (reminder?.next_run_at as string) ?? null,
      enabled: Boolean(reminder?.enabled),
    },
  };
}

export async function saveReminderSettings(input: {
  timezone: string;
  dailyReminderTime: string; // HH:MM
  reminderChannel: "push" | "email" | "both" | "none";
  enabled: boolean;
}): Promise<ActionResult> {
  const auth = await requireUser();
  if ("errorMessage" in auth) {
    return { ok: false, error: auth.errorMessage };
  }
  const { supabase, user } = auth;

  const timezone = input.timezone.trim() || "UTC";
  const time = input.dailyReminderTime.trim();

  const { error: profErr } = await supabase
    .from("profiles")
    .update({
      timezone,
      daily_reminder_time: time ? `${time}:00` : null,
      reminder_channel: input.reminderChannel,
    })
    .eq("id", user.id);

  if (profErr) {
    return { ok: false, error: profErr.message };
  }

  if (!input.enabled || !time || input.reminderChannel === "none") {
    await supabase
      .from("reminders")
      .delete()
      .eq("user_id", user.id)
      .eq("kind", "daily_prayer");
    revalidatePath("/app/settings");
    return { ok: true, data: null };
  }

  let nextRun: Date;
  try {
    nextRun = nextDailyRunAt(time, timezone);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid time",
    };
  }

  const { data: existing } = await supabase
    .from("reminders")
    .select("id")
    .eq("user_id", user.id)
    .eq("kind", "daily_prayer")
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("reminders")
      .update({
        next_run_at: nextRun.toISOString(),
        channel:
          input.reminderChannel === "both"
            ? "both"
            : input.reminderChannel === "push"
              ? "push"
              : "email",
        enabled: true,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("reminders").insert({
      user_id: user.id,
      kind: "daily_prayer",
      next_run_at: nextRun.toISOString(),
      channel:
        input.reminderChannel === "both"
          ? "both"
          : input.reminderChannel === "push"
            ? "push"
            : "email",
      enabled: true,
    });
    if (error) return { ok: false, error: error.message };
  }

  trackEvent("reminder_settings_saved", { channel: input.reminderChannel });
  revalidatePath("/app/settings");
  return { ok: true, data: null };
}
