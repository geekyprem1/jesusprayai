"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPlanTier } from "@/lib/admin/constants";
import type { AdminUserRow } from "@/app/admin/actions";

type Props = {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  q: string;
  status: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function UsersTable({
  users,
  total,
  page,
  pageSize,
  q: initialQ,
  status: initialStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus || "all");
  const [pending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushFilters(next: {
    q?: string;
    status?: string;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const nq = next.q ?? q;
    const ns = next.status ?? status;
    const np = next.page ?? 1;
    if (nq.trim()) params.set("q", nq.trim());
    else params.delete("q");
    if (ns && ns !== "all") params.set("status", ns);
    else params.delete("status");
    if (np > 1) params.set("page", String(np));
    else params.delete("page");
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          pushFilters({ page: 1 });
        }}
      >
        <div className="grid flex-1 gap-1">
          <label htmlFor="admin-q" className="text-xs text-muted-foreground">
            Search name or email
          </label>
          <Input
            id="admin-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="name or email@…"
            className="h-9"
          />
        </div>
        <div className="grid gap-1">
          <label
            htmlFor="admin-status"
            className="text-xs text-muted-foreground"
          >
            Status
          </label>
          <select
            id="admin-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <Button type="submit" disabled={pending} className="h-9">
          Search
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        {total} user{total === 1 ? "" : "s"}
        {pending ? " · updating…" : ""}
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium">Plan</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Joined</th>
              <th className="px-3 py-2.5 font-medium" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border/70 last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2.5">
                  <div className="font-medium">
                    {u.display_name || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    {u.email ?? u.id.slice(0, 8)}
                  </div>
                </td>
                <td className="px-3 py-2.5">{formatPlanTier(u.plan_tier)}</td>
                <td className="px-3 py-2.5 capitalize">{u.role}</td>
                <td className="px-3 py-2.5">
                  {u.account_status === "banned" ? (
                    <span className="inline-flex rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(u.created_at)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/admin/users/${u.id}`} />}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || pending}
            onClick={() => pushFilters({ page: page - 1 })}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || pending}
            onClick={() => pushFilters({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
