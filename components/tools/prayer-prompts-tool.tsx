"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import {
  PROMPT_CATEGORIES,
  promptsByCategory,
  type PromptCategory,
} from "@/lib/content/prayer-prompts";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";

type Filter = PromptCategory | "all";

export function PrayerPromptsTool() {
  const [filter, setFilter] = useState<Filter>("all");
  const list = useMemo(() => promptsByCategory(filter), [filter]);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const prompt = list[index % Math.max(list.length, 1)];

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    setCopied(false);
  }, []);

  const setCat = useCallback((cat: Filter) => {
    setFilter(cat);
    setIndex(0);
    setCopied(false);
  }, []);

  const onCopy = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [prompt]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            filter === "all"
              ? "bg-[oklch(0.28_0.05_255)] text-[oklch(0.97_0.01_85)]"
              : "border border-[oklch(0.72_0.1_85/0.45)] bg-white/70 text-[oklch(0.35_0.04_255)]"
          }`}
        >
          All
        </button>
        {PROMPT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === c.id
                ? "bg-[oklch(0.28_0.05_255)] text-[oklch(0.97_0.01_85)]"
                : "border border-[oklch(0.72_0.1_85/0.45)] bg-white/70 text-[oklch(0.35_0.04_255)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/85 p-6 sm:p-8">
        <p className="text-[10px] font-medium tracking-[0.2em] text-[oklch(0.55_0.08_85)] uppercase">
          Prayer prompt
        </p>
        <p className="font-display mt-3 text-xl leading-relaxed text-[oklch(0.24_0.05_255)] sm:text-2xl">
          {prompt?.text}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.72_0.1_85/0.5)] bg-white px-3 py-1.5 text-xs font-medium"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy prompt"}
          </button>
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.28_0.05_255)] px-3 py-1.5 text-xs font-medium text-[oklch(0.97_0.01_85)]"
          >
            <RefreshCw className="size-3.5" />
            Another prompt
          </button>
        </div>
      </div>

      <SoftSignupCta
        headline="Turn this prompt into a saved prayer"
        body="Write freely in PrayNote, link Scripture, and mark answered prayer — free to start, private by design."
        source="tools-prayer-prompts"
      />
    </div>
  );
}
