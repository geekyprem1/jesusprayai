"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPrayerRequest,
  deletePrayerRequest,
  listPrayerRequests,
  transitionRequestStatus,
  type PrayerRequest,
  type RequestCategory,
  type RequestStatus,
} from "@/app/requests/actions";
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

const CATEGORIES: RequestCategory[] = [
  "health",
  "family",
  "finances",
  "work",
  "spiritual",
  "community",
  "other",
];

type Tab = "active" | "archive";

export function RequestsWorkspace() {
  const [tab, setTab] = useState<Tab>("active");
  const [items, setItems] = useState<PrayerRequest[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RequestCategory>("other");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflectionFor, setReflectionFor] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await listPrayerRequests({
      status: tab === "archive" ? "archive" : "all",
    });
    if (!result.ok) {
      setStatusMsg(result.error ?? "Load failed");
      setItems([]);
    } else {
      const rows = result.data ?? [];
      setItems(
        tab === "active"
          ? rows.filter((r) => r.status !== "answered")
          : rows.filter((r) => r.status === "answered")
      );
      setStatusMsg(null);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    const result = await createPrayerRequest({
      title,
      description,
      category,
    });
    if (!result.ok) {
      setStatusMsg(result.error ?? "Create failed");
      return;
    }
    setTitle("");
    setDescription("");
    setCategory("other");
    setStatusMsg("Request added.");
    await load();
  }

  async function setStatus(id: string, toStatus: RequestStatus) {
    if (toStatus === "answered") {
      setReflectionFor(id);
      setReflection("");
      return;
    }
    const result = await transitionRequestStatus({ id, toStatus });
    if (!result.ok) {
      setStatusMsg(result.error ?? "Update failed");
      return;
    }
    await load();
  }

  async function confirmAnswered() {
    if (!reflectionFor) return;
    const result = await transitionRequestStatus({
      id: reflectionFor,
      toStatus: "answered",
      reflectionNote: reflection,
    });
    if (!result.ok) {
      setStatusMsg(result.error ?? "Could not mark answered");
      return;
    }
    setReflectionFor(null);
    setReflection("");
    setStatusMsg("Marked answered — God is faithful.");
    setTab("archive");
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2 min-[400px]:flex-row">
        <Button
          type="button"
          size="sm"
          className="w-full min-[400px]:w-auto"
          variant={tab === "active" ? "default" : "outline"}
          onClick={() => setTab("active")}
        >
          Active
        </Button>
        <Button
          type="button"
          size="sm"
          className="w-full min-[400px]:w-auto"
          variant={tab === "archive" ? "default" : "outline"}
          onClick={() => setTab("archive")}
        >
          Answered archive
        </Button>
      </div>

      {tab === "active" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New prayer request</CardTitle>
            <CardDescription>
              Track specific needs over time. Mark answered with a reflection.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Label htmlFor="req-title">Title</Label>
              <Input
                id="req-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mom's health"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="req-desc">Description</Label>
              <textarea
                id="req-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Optional details…"
              />
            </div>
            <div className="grid gap-2 max-w-xs">
              <Label htmlFor="req-cat">Category</Label>
              <select
                id="req-cat"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as RequestCategory)
                }
                className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm capitalize outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!title.trim()}
              className="w-full sm:w-fit"
            >
              Add request
            </Button>
          </CardContent>
        </Card>
      )}

      {statusMsg && (
        <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          {statusMsg}
        </p>
      )}

      {reflectionFor && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">Answered — add reflection</CardTitle>
            <CardDescription>
              How did you see God work? Required to archive.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Thank You Lord for…"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => void confirmAnswered()}
                disabled={!reflection.trim()}
              >
                Save as answered
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setReflectionFor(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {!loading && items.length === 0 && (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {tab === "archive"
                  ? "No answered prayers yet"
                  : "Every answered prayer begins with one request"}
              </CardTitle>
              <CardDescription>
                {tab === "archive"
                  ? "When God moves, mark a request answered — your timeline of faithfulness grows here."
                  : "Write down what you're trusting God for. Health, family, work — bring it all."}
              </CardDescription>
            </CardHeader>
            {tab === "active" && (
              <CardContent>
                <Button
                  type="button"
                  onClick={() => {
                    document.getElementById("req-title")?.focus();
                  }}
                >
                  Add a request
                </Button>
              </CardContent>
            )}
          </Card>
        )}
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="capitalize">
                    {item.category} · {item.status}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void deletePrayerRequest(item.id).then(load)}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              {item.reflection_note && (
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="font-medium">Reflection: </span>
                  {item.reflection_note}
                </p>
              )}
              {item.status !== "answered" && (
                <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap">
                  {item.status !== "pending" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full min-[420px]:w-auto"
                      onClick={() => void setStatus(item.id, "pending")}
                    >
                      Pending
                    </Button>
                  )}
                  {item.status !== "ongoing" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full min-[420px]:w-auto"
                      onClick={() => void setStatus(item.id, "ongoing")}
                    >
                      Ongoing
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    className="w-full min-[420px]:w-auto"
                    onClick={() => void setStatus(item.id, "answered")}
                  >
                    Mark answered
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
