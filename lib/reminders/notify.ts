/**
 * Notification senders — email (Resend) and web-push (optional).
 * Missing keys → no-op with logged skip (cron still advances schedule).
 */

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
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (resendKey && from) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [payload.email],
            subject: payload.title,
            text: payload.body,
          }),
        });
        emailed = res.ok;
        if (!res.ok) {
          notes.push(`email failed: ${res.status}`);
        }
      } catch (e) {
        notes.push(
          `email error: ${e instanceof Error ? e.message : "unknown"}`
        );
      }
    } else {
      notes.push("email skipped (RESEND_API_KEY / RESEND_FROM_EMAIL unset)");
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
