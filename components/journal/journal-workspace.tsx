"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bookmark, Cloud, CloudOff, Sparkles, Trash2 } from "lucide-react";
import {
  createPrayerEntry,
  deletePrayerEntry,
  listPrayerEntries,
  updatePrayerEntry,
} from "@/app/journal/actions";
import {
  listEntryVerses,
  runAiForEntry,
  saveEntryVerse,
  updateEntryCategory,
  type EntryVerseRow,
} from "@/app/ai/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  listDrafts,
  listPendingDrafts,
  removeDraft,
  upsertDraft,
  type OfflineDraft,
} from "@/lib/journal/offline-drafts";
import {
  createEntry,
  loadEntries,
  saveEntries,
  type LocalJournalEntry,
} from "@/lib/journal/local-store";
import type { JournalEntryView, PrayerCategory } from "@/types/journal";
import { CATEGORIES } from "@/lib/ai/schemas";
import { VoicePrayerButton } from "@/components/journal/voice-prayer-button";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function toViewFromLocal(e: LocalJournalEntry): JournalEntryView {
  return {
    id: e.id,
    body: e.body,
    category: e.category,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    syncState: "local",
  };
}

type Props = {
  cloudEnabled: boolean;
};

export function JournalWorkspace({ cloudEnabled }: Props) {
  const [entries, setEntries] = useState<JournalEntryView[]>([]);
  const [body, setBody] = useState("");
  const [editBody, setEditBody] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [mode, setMode] = useState<"cloud" | "local">("local");
  const [verses, setVerses] = useState<EntryVerseRow[]>([]);

  const selected = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId]
  );

  const loadCloud = useCallback(async () => {
    const result = await listPrayerEntries();
    if (!result.ok || !result.data) {
      setStatus(result.error ?? "Could not load cloud journal.");
      setMode("local");
      setEntries(loadEntries().map(toViewFromLocal));
      return;
    }

    setMode("cloud");
    setEntries(
      result.data.map((row) => ({
        id: row.id,
        body: row.body_plain,
        category: row.category,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        clientId: row.client_id,
        syncState: "synced" as const,
      }))
    );
  }, []);

  const loadVerses = useCallback(async (entryId: string) => {
    const result = await listEntryVerses(entryId);
    if (result.ok && result.data) {
      setVerses(result.data);
    } else {
      setVerses([]);
    }
  }, []);

  const runAi = useCallback(
    async (entryId: string) => {
      setAiLoading(true);
      const result = await runAiForEntry(entryId);
      if (!result.ok) {
        setStatus(
          result.error
            ? `Entry saved. AI: ${result.error}`
            : "Entry saved. AI unavailable."
        );
        setAiLoading(false);
        return;
      }

      const warnings = result.data?.aiWarnings ?? [];
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                category: result.data?.category ?? e.category,
              }
            : e
        )
      );
      setVerses(result.data?.verses ?? []);
      setStatus(
        warnings.length
          ? `Saved. AI partial: ${warnings.join("; ")}`
          : "Saved + AI category & verses ready."
      );
      setAiLoading(false);
    },
    []
  );

  const syncPending = useCallback(async () => {
    if (!cloudEnabled || !navigator.onLine) return;
    const pending = await listPendingDrafts();
    for (const draft of pending) {
      const result = await createPrayerEntry({
        bodyPlain: draft.body,
        clientId: draft.clientId,
      });
      if (result.ok && result.data) {
        await removeDraft(draft.clientId);
        void runAi(result.data.id);
      } else {
        await upsertDraft({
          ...draft,
          syncState: "error",
          lastError: result.error,
        });
      }
    }
    await loadCloud();
  }, [cloudEnabled, loadCloud, runAi]);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    async function init() {
      if (cloudEnabled && navigator.onLine) {
        await loadCloud();
        await syncPending();
      } else {
        setMode("local");
        setEntries(loadEntries().map(toViewFromLocal));
        const drafts = await listDrafts();
        if (drafts.length) {
          setStatus(
            `${drafts.filter((d) => d.syncState !== "synced").length} offline draft(s) waiting.`
          );
        }
      }
      setHydrated(true);
    }

    void init();

    function onOnline() {
      setOnline(true);
      void syncPending();
    }
    function onOffline() {
      setOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [cloudEnabled, loadCloud, syncPending]);

  useEffect(() => {
    if (!hydrated || mode !== "local") return;
    saveEntries(
      entries.map((e) => ({
        id: e.id,
        body: e.body,
        category: e.category,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    );
  }, [entries, hydrated, mode]);

  useEffect(() => {
    if (selected) {
      setEditBody(selected.body);
      if (mode === "cloud" && selected.syncState === "synced") {
        void loadVerses(selected.id);
      } else {
        setVerses([]);
      }
    } else {
      setVerses([]);
    }
  }, [selected, mode, loadVerses]);

  async function handleSave() {
    if (!body.trim()) return;
    setSaving(true);
    setStatus(null);

    const clientId = crypto.randomUUID();
    const draft: OfflineDraft = {
      clientId,
      body: body.trim(),
      updatedAt: new Date().toISOString(),
      syncState: "pending",
    };
    await upsertDraft(draft);

    if (!cloudEnabled || !navigator.onLine) {
      const local = createEntry(body);
      local.id = clientId;
      const view = toViewFromLocal(local);
      view.clientId = clientId;
      view.syncState = "pending";
      setEntries((prev) => [view, ...prev]);
      setBody("");
      setSelectedId(view.id);
      setStatus(
        !cloudEnabled
          ? "Saved locally. Log in for AI + cloud."
          : "Offline draft saved — AI runs after sync."
      );
      setSaving(false);
      return;
    }

    // Save first — AI is best-effort after
    const result = await createPrayerEntry({
      bodyPlain: body.trim(),
      clientId,
    });

    if (!result.ok || !result.data) {
      const local = createEntry(body);
      local.id = clientId;
      setEntries((prev) => [
        { ...toViewFromLocal(local), clientId, syncState: "pending" },
        ...prev,
      ]);
      setBody("");
      setStatus(result.error ?? "Save failed — kept offline draft.");
      setSaving(false);
      return;
    }

    await removeDraft(clientId);
    setBody("");
    await loadCloud();
    setSelectedId(result.data.id);
    setStatus("Entry saved. Running AI…");
    setSaving(false);

    // AI after successful save (P3-9: entry never lost if AI fails)
    void runAi(result.data.id);
  }

  async function handleUpdate() {
    if (!selected || !editBody.trim()) return;
    setSaving(true);

    if (mode === "cloud" && selected.syncState === "synced" && online) {
      const result = await updatePrayerEntry({
        id: selected.id,
        bodyPlain: editBody.trim(),
      });
      if (!result.ok) {
        setStatus(result.error ?? "Update failed.");
        setSaving(false);
        return;
      }
      await loadCloud();
      setStatus("Entry updated.");
    } else {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === selected.id
            ? {
                ...e,
                body: editBody.trim(),
                updatedAt: new Date().toISOString(),
              }
            : e
        )
      );
      setStatus("Updated locally.");
    }
    setSaving(false);
  }

  async function handleCategoryChange(category: PrayerCategory) {
    if (!selected || mode !== "cloud") return;
    const result = await updateEntryCategory(selected.id, category);
    if (!result.ok) {
      setStatus(result.error ?? "Could not update category.");
      return;
    }
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selected.id ? { ...e, category } : e
      )
    );
    setStatus("Category updated (your choice).");
  }

  async function handleDelete(id: string) {
    if (mode === "cloud" && online) {
      const result = await deletePrayerEntry(id);
      if (!result.ok) {
        setStatus(result.error ?? "Delete failed.");
        return;
      }
      await loadCloud();
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      await removeDraft(id).catch(() => undefined);
    }
    if (selectedId === id) setSelectedId(null);
  }

  async function handleToggleVerse(verseId: string, saved: boolean) {
    const result = await saveEntryVerse(verseId, saved);
    if (!result.ok) {
      setStatus(result.error ?? "Could not update verse.");
      return;
    }
    setVerses((prev) =>
      prev.map((v) => (v.id === verseId ? { ...v, saved } : v))
    );
  }

  return (
    /* Main column = entry (wide). Side column = recent (narrow). DOM order must match. */
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_240px] lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {online ? (
            <span className="inline-flex items-center gap-1">
              <Cloud className="size-3.5" /> Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <CloudOff className="size-3.5" /> Offline
            </span>
          )}
          <span className="hidden sm:inline">·</span>
          <span>Storage: {mode === "cloud" ? "Supabase" : "Local"}</span>
          {aiLoading && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Sparkles className="size-3.5 animate-pulse" /> AI running…
            </span>
          )}
        </div>

        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-base sm:text-lg">New prayer entry</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Saves first, then AI categorizes and suggests verses. If AI fails,
              your entry still stays saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write or speak your prayer here…"
              rows={8}
              className="min-h-[160px] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[200px] sm:text-sm"
            />
            <VoicePrayerButton
              disabled={saving}
              onTranscript={(text) => {
                setBody((prev) => {
                  const next = prev.trim()
                    ? `${prev.trim()}\n\n${text}`
                    : text;
                  return next;
                });
                setStatus("Voice added to your prayer. Edit if needed, then Save.");
              }}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => void handleSave()}
                disabled={!body.trim() || saving}
              >
                {saving ? "Saving…" : "Save entry"}
              </Button>
            </div>
            {status && (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm break-words">
                {status}
              </p>
            )}
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected entry</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {formatDate(selected.createdAt)}
                {selected.syncState === "pending" ? " · pending sync" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {mode === "cloud" && selected.syncState === "synced" && (
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Category (AI or override)
                  </label>
                  <select
                    value={selected.category}
                    onChange={(e) =>
                      void handleCategoryChange(
                        e.target.value as PrayerCategory
                      )
                    }
                    className="h-11 w-full max-w-full rounded-lg border border-input bg-transparent px-3 text-base capitalize outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-9 sm:max-w-xs sm:text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
                className="min-h-[140px] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                {mode === "cloud" && selected.syncState === "synced" && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => void runAi(selected.id)}
                    disabled={aiLoading}
                  >
                    <Sparkles className="size-3.5" />
                    {aiLoading ? "AI…" : "Re-run AI"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => void handleUpdate()}
                  disabled={saving || !editBody.trim()}
                >
                  Save changes
                </Button>
              </div>

              {verses.length > 0 && (
                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                  <h3 className="text-sm font-medium">Suggested verses</h3>
                  {verses.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-lg border border-border bg-muted/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium break-words">
                            {v.reference}
                          </p>
                          <p className="text-xs text-muted-foreground break-words">
                            {v.translation}
                            {v.reason ? ` · ${v.reason}` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          className="size-10 shrink-0 sm:size-8"
                          variant={v.saved ? "default" : "outline"}
                          onClick={() =>
                            void handleToggleVerse(v.id, !v.saved)
                          }
                          aria-label={v.saved ? "Unsave verse" : "Save verse"}
                        >
                          <Bookmark className="size-4" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed break-words">
                        {v.verse_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar: recent list — always second so it stays the narrow column */}
      <aside className="flex min-w-0 flex-col gap-2 md:max-w-[280px]">
        <h2 className="text-sm font-medium text-muted-foreground">
          Recent ({entries.length})
        </h2>
        {!hydrated && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {hydrated && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No entries yet. Write your first prayer.
          </p>
        )}
        <ul className="scroll-touch flex max-h-[40vh] flex-col gap-2 overflow-y-auto pb-1 md:max-h-[calc(100vh-12rem)]">
          {entries.map((entry) => (
            <li key={entry.id} className="w-full min-w-0">
              <div
                className={`group rounded-lg border border-border p-3 transition-colors ${
                  selectedId === entry.id
                    ? "border-primary/40 bg-primary/5"
                    : "hover:bg-muted/40"
                }`}
              >
                <button
                  type="button"
                  className="w-full min-h-0 text-left"
                  onClick={() => setSelectedId(entry.id)}
                >
                  <p className="line-clamp-3 text-sm">{entry.body}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">
                    {entry.category} · {formatDate(entry.createdAt)}
                  </p>
                </button>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 sm:size-8"
                    onClick={() => void handleDelete(entry.id)}
                    aria-label="Delete entry"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
