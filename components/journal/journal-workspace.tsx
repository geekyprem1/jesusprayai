"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Bookmark, Cloud, CloudOff, Sparkles, Trash2 } from "lucide-react";
import { ShareVerseButton } from "@/components/verses/share-verse-button";
import Link from "next/link";
import {
  createPrayerEntry,
  deletePrayerEntry,
  getPrayerEntryQuota,
  listPrayerEntries,
  updatePrayerEntry,
  type PrayerEntryQuota,
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
import { LoadingScreen } from "@/components/brand/loading-screen";

const MOODS = [
  { id: "peaceful", label: "Peaceful", emoji: "😌" },
  { id: "grateful", label: "Grateful", emoji: "🙏" },
  { id: "hopeful", label: "Hopeful", emoji: "🌅" },
  { id: "anxious", label: "Anxious", emoji: "😟" },
  { id: "heavy", label: "Heavy", emoji: "😔" },
  { id: "joyful", label: "Joyful", emoji: "😊" },
] as const;

type MoodId = (typeof MOODS)[number]["id"] | "";

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

function wordStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return {
    words,
    reading:
      words === 0
        ? "—"
        : words < 40
          ? "< 1 min read"
          : `~${minutes} min read`,
  };
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

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

type Props = {
  cloudEnabled: boolean;
};

export function JournalWorkspace({ cloudEnabled }: Props) {
  const [entries, setEntries] = useState<JournalEntryView[]>([]);
  const [body, setBody] = useState("");
  const [editDraft, setEditDraft] = useState<{
    entryId: string;
    body: string;
  } | null>(null);
  const [mood, setMood] = useState<MoodId>("");
  const [draftCategory, setDraftCategory] =
    useState<PrayerCategory>("uncategorized");
  const [tagsInput, setTagsInput] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mode, setMode] = useState<"cloud" | "local">("local");
  const [versesByEntry, setVersesByEntry] = useState<
    Record<string, EntryVerseRow[]>
  >({});
  const [quota, setQuota] = useState<PrayerEntryQuota | null>(null);

  const selected = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId]
  );
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  );
  const editBody = selected
    ? editDraft?.entryId === selected.id
      ? editDraft.body
      : selected.body
    : "";
  const verses =
    selected && mode === "cloud" && selected.syncState === "synced"
      ? (versesByEntry[selected.id] ?? [])
      : [];

  const draftStats = useMemo(() => wordStats(body), [body]);
  const editStats = useMemo(() => wordStats(editBody), [editBody]);

  const draftTags = useMemo(
    () =>
      tagsInput
        .split(/[,#]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8),
    [tagsInput]
  );

  const refreshQuota = useCallback(async () => {
    if (!cloudEnabled) {
      setQuota(null);
      return;
    }
    const result = await getPrayerEntryQuota();
    if (result.ok && result.data) {
      setQuota(result.data);
    }
  }, [cloudEnabled]);

  const loadCloud = useCallback(async () => {
    const result = await listPrayerEntries();
    setEditDraft(null);
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
    void refreshQuota();
  }, [refreshQuota]);

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
      setEditDraft((current) =>
        current?.entryId === entryId ? null : current
      );
      setVersesByEntry((current) => ({
        ...current,
        [entryId]: result.data?.verses ?? [],
      }));
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
    async function init() {
      if (cloudEnabled && navigator.onLine) {
        await loadCloud();
        await syncPending();
      } else {
        const drafts = await listDrafts();
        setMode("local");
        setEntries(loadEntries().map(toViewFromLocal));
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
      void syncPending();
    }
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
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
    if (!selected || mode !== "cloud" || selected.syncState !== "synced") {
      return;
    }

    const entryId = selected.id;
    let cancelled = false;
    void listEntryVerses(entryId).then((result) => {
      if (cancelled) return;
      setVersesByEntry((current) => ({
        ...current,
        [entryId]: result.ok && result.data ? result.data : [],
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [selected, mode]);

  function composeBodyWithMeta(raw: string) {
    const parts: string[] = [];
    if (mood) {
      const m = MOODS.find((x) => x.id === mood);
      if (m) parts.push(`${m.emoji} ${m.label}`);
    }
    if (draftTags.length) {
      parts.push(draftTags.map((t) => `#${t}`).join(" "));
    }
    if (parts.length) {
      return `${parts.join(" · ")}\n\n${raw.trim()}`;
    }
    return raw.trim();
  }

  function resetComposer() {
    setBody("");
    setMood("");
    setDraftCategory("uncategorized");
    setTagsInput("");
  }

  async function handleSave() {
    if (!body.trim()) return;

    // Free plan: block new entries when cloud quota is full
    if (
      cloudEnabled &&
      mode === "cloud" &&
      quota?.atLimit &&
      navigator.onLine
    ) {
      setStatus(
        quota.limit != null
          ? `Free plan allows ${quota.limit} prayer entries. Delete an older one or upgrade for unlimited.`
          : "Entry limit reached."
      );
      return;
    }

    setSaving(true);
    setStatus(null);

    const plain = composeBodyWithMeta(body);
    const clientId = crypto.randomUUID();
    const draft: OfflineDraft = {
      clientId,
      body: plain,
      updatedAt: new Date().toISOString(),
      syncState: "pending",
    };
    await upsertDraft(draft);

    if (!cloudEnabled || !navigator.onLine) {
      const local = createEntry(plain);
      local.id = clientId;
      local.category = draftCategory;
      const view = toViewFromLocal(local);
      view.clientId = clientId;
      view.syncState = "pending";
      setEntries((prev) => [view, ...prev]);
      resetComposer();
      setEditDraft(null);
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
      bodyPlain: plain,
      clientId,
      category: draftCategory,
    });

    if (!result.ok || !result.data) {
      // Don't keep a local phantom entry when free-plan limit blocked the save
      const isLimit =
        result.error?.toLowerCase().includes("free plan allows") ?? false;
      if (isLimit) {
        await removeDraft(clientId).catch(() => undefined);
        setStatus(result.error ?? "Free entry limit reached.");
        void refreshQuota();
        setSaving(false);
        return;
      }

      const local = createEntry(plain);
      local.id = clientId;
      local.category = draftCategory;
      setEntries((prev) => [
        { ...toViewFromLocal(local), clientId, syncState: "pending" },
        ...prev,
      ]);
      resetComposer();
      setStatus(result.error ?? "Save failed — kept offline draft.");
      setSaving(false);
      return;
    }

    await removeDraft(clientId);
    resetComposer();
    await loadCloud();
    setEditDraft(null);
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
    setEditDraft(null);
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
    setEditDraft(null);
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
    setVersesByEntry((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (selectedId === id) {
      setEditDraft(null);
      setSelectedId(null);
    }
    void refreshQuota();
  }

  async function handleToggleVerse(verseId: string, saved: boolean) {
    if (!selected) return;
    const entryId = selected.id;
    const result = await saveEntryVerse(verseId, saved);
    if (!result.ok) {
      setStatus(result.error ?? "Could not update verse.");
      return;
    }
    setVersesByEntry((current) => ({
      ...current,
      [entryId]: (current[entryId] ?? []).map((verse) =>
        verse.id === verseId ? { ...verse, saved } : verse
      ),
    }));
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
          <span>{mode === "cloud" ? "Synced account" : "On this device"}</span>
          {quota?.limit != null && (
            <>
              <span className="hidden sm:inline">·</span>
              <span
                className={
                  quota.atLimit
                    ? "font-medium text-amber-800 dark:text-amber-200"
                    : undefined
                }
              >
                Free plan {quota.count}/{quota.limit} entries
              </span>
            </>
          )}
          {aiLoading && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Sparkles className="size-3.5 animate-pulse" /> AI running…
            </span>
          )}
        </div>

        {quota?.atLimit && (
          <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            Free plan allows {quota.limit} prayer entries. Delete an older entry
            to free a slot, or{" "}
            <Link href="/pricing" className="font-medium underline underline-offset-2">
              see Premium
            </Link>{" "}
            (coming soon) for unlimited journal.
          </p>
        )}

        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-base sm:text-lg">New prayer entry</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Capture the moment — mood, category, and tags help AI know you better.
              {quota?.limit != null && !quota.atLimit && (
                <span className="mt-1 block text-muted-foreground">
                  Free plan: {quota.remaining} of {quota.limit} entries remaining.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                😊 Mood
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setMood((prev) => (prev === m.id ? "" : m.id))
                    }
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      mood === m.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  htmlFor="draft-category"
                  className="text-xs font-medium text-muted-foreground"
                >
                  🙏 Category
                </label>
                <select
                  id="draft-category"
                  value={draftCategory}
                  onChange={(e) =>
                    setDraftCategory(e.target.value as PrayerCategory)
                  }
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm capitalize outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label
                  htmlFor="draft-tags"
                  className="text-xs font-medium text-muted-foreground"
                >
                  🏷 Tags
                </label>
                <input
                  id="draft-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="family, work, health"
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
            {draftTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {draftTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write or speak your prayer here…"
              rows={8}
              className="min-h-[160px] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[200px] sm:text-sm"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {draftStats.words} word{draftStats.words === 1 ? "" : "s"}
                <span className="mx-1.5">·</span>
                {draftStats.reading}
              </span>
            </div>
            <VoicePrayerButton
              disabled={saving || Boolean(quota?.atLimit && mode === "cloud")}
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
                disabled={
                  !body.trim() ||
                  saving ||
                  Boolean(quota?.atLimit && mode === "cloud" && online)
                }
              >
                {saving
                  ? "Saving…"
                  : quota?.atLimit && mode === "cloud"
                    ? "Limit reached"
                    : "Save entry"}
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
                onChange={(e) =>
                  setEditDraft({ entryId: selected.id, body: e.target.value })
                }
                rows={6}
                className="min-h-[140px] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {editStats.words} word{editStats.words === 1 ? "" : "s"}
                <span className="mx-1.5">·</span>
                {editStats.reading}
              </p>
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
                      <div className="mt-2">
                        <ShareVerseButton
                          verse={{
                            reference: v.reference,
                            verseText: v.verse_text,
                            translation: v.translation,
                          }}
                        />
                      </div>
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
          <LoadingScreen
            label="Loading journal…"
            size="sm"
            delayMs={280}
            className="min-h-[6rem] py-4"
          />
        )}
        {hydrated && entries.length === 0 && (
          <Card className="border-dashed">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">
                Your first prayer starts here
              </CardTitle>
              <CardDescription className="text-xs">
                Even one honest sentence before God is enough.
              </CardDescription>
            </CardHeader>
          </Card>
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
                  onClick={() => {
                    setEditDraft(null);
                    setSelectedId(entry.id);
                  }}
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
