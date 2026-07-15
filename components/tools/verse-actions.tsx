"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  buildVerseShareText,
  downloadBlob,
  renderVerseCardPng,
  safeFilename,
} from "@/lib/share/verse-card";
import { BRAND } from "@/lib/brand";
import type { CuratedVerse } from "@/lib/content/verses-by-topic";

type Props = {
  verse: CuratedVerse;
};

export function VerseActions({ verse }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const onCopy = useCallback(async () => {
    const text = buildVerseShareText(
      {
        reference: verse.reference,
        verseText: verse.text,
        translation: verse.translation,
      },
      BRAND.siteUrl
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [verse]);

  const onCard = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await renderVerseCardPng(
        {
          reference: verse.reference,
          verseText: verse.text,
          translation: verse.translation,
        },
        "story"
      );
      downloadBlob(blob, safeFilename(verse.reference, "story"));
    } finally {
      setBusy(false);
    }
  }, [verse]);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.1_85/0.5)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[oklch(0.28_0.05_255)] hover:bg-white"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        onClick={onCard}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.1_85/0.5)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[oklch(0.28_0.05_255)] hover:bg-white disabled:opacity-60"
      >
        {busy ? "Preparing…" : "Download verse card"}
      </button>
    </div>
  );
}
