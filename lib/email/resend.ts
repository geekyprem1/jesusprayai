/**
 * Resend helpers — welcome + transactional email.
 * No-op when RESEND_API_KEY / RESEND_FROM_EMAIL are unset.
 */

import { BRAND } from "@/lib/brand";

function resendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = resendConfig();
  if (!cfg) {
    return { ok: false, error: "Resend not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
        reply_to: BRAND.supportEmail,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Resend ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "email send failed",
    };
  }
}

/** Welcome email after signup / first Google sign-in */
export async function sendWelcomeEmail(input: {
  to: string;
  displayName?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const name =
    input.displayName?.trim() || input.to.split("@")[0] || "friend";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || BRAND.siteUrl;

  const subject = `Welcome to ${BRAND.shortName} — your prayer journal awaits`;
  const text = [
    `Hi ${name},`,
    "",
    `Welcome to ${BRAND.name}.`,
    "",
    "We're glad you're here. PrayNote is a quiet place to journal prayer,",
    "meet Scripture, and remember God's faithfulness — from the Eternal Faith team.",
    "",
    "Get started:",
    `• Open your journal: ${appUrl}/app/journal`,
    `• Home & AI reflections: ${appUrl}/app`,
    "",
    "If you ever need help, just reply to this email or write to",
    BRAND.supportEmail + ".",
    "",
    "Grace and peace,",
    `The ${BRAND.team} team`,
    BRAND.domain,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, 'Times New Roman', serif; background:#F9F5EC; color:#10233F; padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e8e0d0;">
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;color:#8a7340;text-transform:uppercase;">${BRAND.name}</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;">Welcome, ${escapeHtml(name)}</h1>
    <p style="line-height:1.55;font-size:16px;">
      We're glad you're here. PrayNote is a quiet place to journal prayer,
      meet Scripture, and remember God's faithfulness — from the Eternal Faith team.
    </p>
    <p style="margin:24px 0;">
      <a href="${appUrl}/app/journal" style="display:inline-block;background:#10233F;color:#F9F5EC;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px;">
        Write your first prayer
      </a>
    </p>
    <p style="line-height:1.5;font-size:14px;color:#555;">
      Questions? Email <a href="mailto:${BRAND.supportEmail}" style="color:#10233F;">${BRAND.supportEmail}</a>
    </p>
    <p style="margin-top:28px;font-size:14px;color:#666;">
      Grace and peace,<br/>The ${BRAND.team} team
    </p>
  </div>
</body>
</html>`.trim();

  return sendResendEmail({ to: input.to, subject, text, html });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** True if account was created in the last few minutes (first OAuth session). */
export function isLikelyNewUser(createdAt: string | undefined | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const ageMs = Date.now() - created;
  return ageMs >= 0 && ageMs < 10 * 60 * 1000; // 10 minutes
}
