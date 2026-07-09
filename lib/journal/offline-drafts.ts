/**
 * IndexedDB offline drafts + sync queue (Phase 2).
 * Pending creates use client_id for idempotent server replay.
 */

const DB_NAME = "praynote";
const DB_VERSION = 1;
const STORE = "drafts";

export type OfflineDraft = {
  clientId: string;
  body: string;
  updatedAt: string;
  syncState: "pending" | "synced" | "error";
  lastError?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "clientId" });
      }
    };
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB tx failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
  });
}

export async function listDrafts(): Promise<OfflineDraft[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => {
      const rows = (req.result as OfflineDraft[]) ?? [];
      resolve(
        rows.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
    };
    req.onerror = () => reject(req.error);
  });
}

export async function upsertDraft(
  draft: OfflineDraft
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(draft);
  await txDone(tx);
}

export async function removeDraft(clientId: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(clientId);
  await txDone(tx);
}

export async function listPendingDrafts(): Promise<OfflineDraft[]> {
  const all = await listDrafts();
  return all.filter((d) => d.syncState === "pending" || d.syncState === "error");
}
