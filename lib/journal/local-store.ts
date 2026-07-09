/** Phase 1 local journal store (browser). Phase 2 moves to Supabase. */

export type LocalJournalEntry = {
  id: string;
  body: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const KEY = "praynote.journal.entries.v1";

export function loadEntries(): LocalJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalJournalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: LocalJournalEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function createEntry(body: string): LocalJournalEntry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    body: body.trim(),
    category: "uncategorized",
    createdAt: now,
    updatedAt: now,
  };
}
