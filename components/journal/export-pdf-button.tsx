"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { listPrayerEntries } from "@/app/journal/actions";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

/**
 * Journal PDF/print export — Premium feature (soft badge until paywall enforces).
 */
export function ExportPdfButton() {
  const [busy, setBusy] = useState(false);

  async function exportJournal() {
    setBusy(true);
    const result = await listPrayerEntries();
    if (!result.ok || !result.data) {
      alert(result.error ?? "Could not load entries for export.");
      setBusy(false);
      return;
    }

    const entries = result.data;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>PrayNote Journal Export</title>
<style>
  body { font-family: Georgia, serif; max-width: 720px; margin: 2rem auto; color: #111; }
  h1 { font-size: 1.5rem; }
  .meta { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
  article { border-top: 1px solid #ddd; padding: 1rem 0; page-break-inside: avoid; }
  .cat { text-transform: capitalize; color: #444; font-size: 0.8rem; }
  p { white-space: pre-wrap; line-height: 1.5; }
</style></head><body>
<h1>PrayNote — Prayer Journal</h1>
<p class="meta">Exported ${new Date().toLocaleString()} · ${entries.length} entries</p>
${entries
  .map(
    (e) => `<article>
  <div class="cat">${e.category} · ${new Date(e.created_at).toLocaleString()}</div>
  <p>${escapeHtml(e.body_plain)}</p>
</article>`
  )
  .join("")}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) {
      alert("Allow pop-ups to export / print your journal.");
      setBusy(false);
      return;
    }
    w.document.write(html);
    w.document.close();
    trackEvent("journal_export_print", { count: entries.length });
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        onClick={() => void exportJournal()}
        disabled={busy}
      >
        <Crown className="size-3.5 text-[oklch(0.55_0.1_85)]" />
        {busy ? "Preparing…" : "Export PDF"}
      </Button>
      <p className="text-center text-[10px] text-muted-foreground sm:text-right">
        Premium ·{" "}
        <Link href="/pricing" className="underline-offset-2 hover:underline">
          See plans
        </Link>
      </p>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
