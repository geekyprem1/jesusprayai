"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { VerseActions } from "@/components/tools/verse-actions";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import {
  getAllCuratedVerses,
  type CuratedVerse,
} from "@/lib/content/verses-by-topic";

function pickRandom(verses: CuratedVerse[], exclude?: string): CuratedVerse {
  if (verses.length === 0) {
    return {
      reference: "John 3:16",
      text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      translation: "KJV",
    };
  }
  let next = verses[Math.floor(Math.random() * verses.length)]!;
  if (exclude && verses.length > 1) {
    let guard = 0;
    while (next.reference === exclude && guard < 8) {
      next = verses[Math.floor(Math.random() * verses.length)]!;
      guard += 1;
    }
  }
  return next;
}

export function RandomVerseTool() {
  const pool = useMemo(() => getAllCuratedVerses(), []);
  // Stable SSR default; first random pick runs on the client only
  const [verse, setVerse] = useState<CuratedVerse>(
    () =>
      pool[0] ?? {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        translation: "KJV",
      }
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      setVerse(pickRandom(pool));
    }, 0);
    return () => window.clearTimeout(id);
  }, [pool]);

  const another = useCallback(() => {
    setVerse((current) => pickRandom(pool, current.reference));
  }, [pool]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/85 p-6 sm:p-8">
        <blockquote className="font-display text-xl leading-relaxed text-[oklch(0.24_0.05_255)] italic sm:text-2xl">
          “{verse.text}”
        </blockquote>
        <p className="mt-4 text-sm font-medium tracking-wide text-[oklch(0.45_0.06_85)]">
          — {verse.reference} ({verse.translation})
        </p>
        <VerseActions verse={verse} />
        <button
          type="button"
          onClick={another}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[oklch(0.28_0.05_255)] px-5 py-2.5 text-sm font-medium text-[oklch(0.97_0.01_85)] transition hover:bg-[oklch(0.34_0.05_255)]"
        >
          <RefreshCw className="size-4" />
          Another verse
        </button>
      </div>
      <SoftSignupCta source="tools-random-verse" />
    </div>
  );
}
