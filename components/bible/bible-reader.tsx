"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BiblePassage, BibleTranslation } from "@/lib/bible/types";

const EXAMPLES = [
  "John 3:16",
  "Psalm 23:1-3",
  "Philippians 4:6-7",
  "Romans 8:28",
];

const TRANSLATIONS: BibleTranslation[] = ["KJV", "NIV", "ESV"];

export function BibleReader() {
  const [ref, setRef] = useState("John 3:16");
  const [translation, setTranslation] = useState<BibleTranslation>("KJV");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passage, setPassage] = useState<BiblePassage | null>(null);

  async function lookup(nextRef?: string) {
    const reference = (nextRef ?? ref).trim();
    if (!reference) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ref: reference,
        translation,
      });
      const res = await fetch(`/api/bible/passage?${params.toString()}`);
      const json = (await res.json()) as
        | { ok: true; passage: BiblePassage }
        | { ok: false; error: string };

      if (!json.ok) {
        setPassage(null);
        setError(json.error);
      } else {
        setPassage(json.passage);
        setRef(reference);
      }
    } catch {
      setError("Network error loading passage.");
      setPassage(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Look up a passage</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Free via bible-api.com (KJV). NIV/ESV need API.Bible key when set.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="ref">Reference</Label>
              <Input
                id="ref"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. John 3:16"
                className="h-11 text-base sm:h-9 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void lookup();
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="translation">Translation</Label>
              <select
                id="translation"
                value={translation}
                onChange={(e) =>
                  setTranslation(e.target.value as BibleTranslation)
                }
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-9 sm:text-sm"
              >
                {TRANSLATIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              className="h-11 w-full sm:h-9 lg:w-auto"
              onClick={() => void lookup()}
              disabled={loading || !ref.trim()}
            >
              {loading ? "Loading…" : "Search"}
            </Button>
          </div>

          <div className="scroll-touch flex gap-2 overflow-x-auto pb-1">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex}
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  setRef(ex);
                  void lookup(ex);
                }}
              >
                {ex}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive break-words">
          {error}
        </p>
      )}

      {passage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base break-words sm:text-lg">
              {passage.reference}
            </CardTitle>
            <CardDescription>
              {passage.translation} · via {passage.provider}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words sm:text-[1.05rem]">
              {passage.text}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
