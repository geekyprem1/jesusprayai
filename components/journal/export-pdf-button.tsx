"use client";

import { useState } from "react";
import { listPrayerEntries } from "@/app/journal/actions";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

/**
 * Stretch PDF/print export — opens a print-friendly window (Save as PDF).
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
<h1>PrayNote AI — Prayer Journal</h1>
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
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full sm:w-auto"
      onClick={() => void exportJournal()}
      disabled={busy}
    >
      {busy ? "Preparing…" : "Export / Print PDF"}
    </Button>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
