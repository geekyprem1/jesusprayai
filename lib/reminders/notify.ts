/**
 * Notification senders — email (Resend) and web-push (optional).
 * Missing keys → no-op with logged skip (cron still advances schedule).
 */

import { sendResendEmail } from "@/lib/email/resend";

export type NotifyPayload = {
  userId: string;
  title: string;
  body: string;
  email?: string | null;
  channel: "push" | "email" | "both" | "none";
};

export async function sendReminderNotification(
  payload: NotifyPayload
): Promise<{ emailed: boolean; pushed: boolean; notes: string[] }> {
  const notes: string[] = [];
  let emailed = false;
  let pushed = false;

  const wantEmail =
    payload.channel === "email" || payload.channel === "both";
  const wantPush =
    payload.channel === "push" || payload.channel === "both";

  if (wantEmail && payload.email) {
    const result = await sendResendEmail({
      to: payload.email,
      subject: payload.title,
      text: payload.body,
    });
    emailed = result.ok;
    if (!result.ok) {
      notes.push(result.error ?? "email failed");
    }
  }

  if (wantPush) {
    // Full web-push needs VAPID + web-push lib; Phase 4 records intent
    const vapid = process.env.VAPID_PUBLIC_KEY?.trim();
    if (!vapid) {
      notes.push("push skipped (VAPID keys unset — use email or set later)");
    } else {
      notes.push(
        "push: subscription delivery stub — enable web-push package when VAPID ready"
      );
    }
  }

  return { emailed, pushed, notes };
}
