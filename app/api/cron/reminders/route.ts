import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { advanceOneDay } from "@/lib/reminders/schedule";
import { sendReminderNotification } from "@/lib/reminders/notify";

/**
 * Vercel Cron (or manual): GET /api/cron/reminders
 * Header: Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service role not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = new Date().toISOString();
  const { data: due, error } = await supabase
    .from("reminders")
    .select("id, user_id, channel, next_run_at, kind")
    .eq("enabled", true)
    .lte("next_run_at", now)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const row of due ?? []) {
    const { data: userData } = await supabase.auth.admin.getUserById(
      row.user_id as string
    );
    const email = userData?.user?.email ?? null;

    const notify = await sendReminderNotification({
      userId: row.user_id as string,
      title: "Time to pray — PrayNote AI",
      body: "Take a moment to open your prayer journal and talk with God.",
      email,
      channel: row.channel as "push" | "email" | "both",
    });

    const next = advanceOneDay(new Date(row.next_run_at as string));
    await supabase
      .from("reminders")
      .update({ next_run_at: next.toISOString() })
      .eq("id", row.id);

    results.push({
      id: row.id,
      user_id: row.user_id,
      ...notify,
      next_run_at: next.toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
