"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen } from "lucide-react";
import {
  listSavedVerses,
  saveEntryVerse,
  type SavedVerseRow,
} from "@/app/ai/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShareVerseButton } from "@/components/verses/share-verse-button";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return iso.slice(0, 10);
  }
}

export function SavedVersesList() {
  const [verses, setVerses] = useState<SavedVerseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listSavedVerses();
    if (!result.ok) {
      setError(result.error ?? "Could not load saved verses.");
      setVerses([]);
    } else {
      setError(null);
      setVerses(result.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function unsave(id: string) {
    setBusyId(id);
    const result = await saveEntryVerse(id, false);
    if (!result.ok) {
      setError(result.error ?? "Could not remove bookmark.");
    } else {
      setVerses((prev) => prev.filter((v) => v.id !== id));
    }
    setBusyId(null);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your verses…</p>;
  }

  if (error && verses.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
        {error}
      </p>
    );
  }

  if (verses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">
            Scripture waits to be collected
          </CardTitle>
          <CardDescription>
            Write a prayer, let AI suggest verses, then bookmark the ones that
            speak to your heart — share them as beautiful story cards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/app/journal" />}>
            <BookOpen className="size-4" />
            Write a prayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {verses.length} saved verse{verses.length === 1 ? "" : "s"}
      </p>
      <ul className="flex flex-col gap-3">
        {verses.map((v) => {
          const prayer = Array.isArray(v.prayer_entries)
            ? v.prayer_entries[0]
            : v.prayer_entries;
          return (
            <li key={v.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base break-words">
                        {v.reference}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {v.translation}
                        {v.reason ? ` · ${v.reason}` : ""}
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="default"
                      className="size-10 shrink-0 sm:size-8"
                      disabled={busyId === v.id}
                      onClick={() => void unsave(v.id)}
                      aria-label="Remove from saved"
                      title="Unsave"
                    >
                      <Bookmark className="size-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm leading-relaxed break-words">
                    {v.verse_text}
                  </p>
                  {prayer && (
                    <p className="text-xs text-muted-foreground">
                      From prayer on {formatDate(prayer.created_at)}
                      {prayer.body_plain
                        ? ` — “${prayer.body_plain.slice(0, 80)}${prayer.body_plain.length > 80 ? "…" : ""}”`
                        : ""}
                    </p>
                  )}
                  <ShareVerseButton
                    variant="full"
                    verse={{
                      reference: v.reference,
                      verseText: v.verse_text,
                      translation: v.translation,
                    }}
                  />
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
