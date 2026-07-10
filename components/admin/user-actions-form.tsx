"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  adminBanUser,
  adminUnbanUser,
  adminUpdateNotes,
  adminUpdatePlan,
  adminUpdateRole,
} from "@/app/admin/actions";
import { PLAN_TIERS, USER_ROLES, formatPlanTier } from "@/lib/admin/constants";
import type { AdminUserRow } from "@/app/admin/actions";

type Props = {
  user: AdminUserRow;
  isSelf: boolean;
};

export function UserActionsForm({ user, isSelf }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [plan, setPlan] = useState(user.plan_tier);
  const [role, setRole] = useState(user.role);
  const [notes, setNotes] = useState(user.admin_notes ?? "");
  const [banReason, setBanReason] = useState(user.ban_reason ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setMessage(okMsg);
      router.refresh();
    });
  }

  const banned = user.account_status === "banned";

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100">
          {message}
        </p>
      )}

      {/* Plan */}
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-base font-semibold">Plan</h3>
        <p className="text-xs text-muted-foreground">
          Changes apply immediately. Lemon Squeezy remains source of truth when
          billing is live.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="plan">Plan tier</Label>
            <select
              id="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {PLAN_TIERS.map((t) => (
                <option key={t} value={t}>
                  {formatPlanTier(t)}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            disabled={pending || plan === user.plan_tier}
            onClick={() =>
              run(() => adminUpdatePlan(user.id, plan), "Plan updated.")
            }
          >
            Save plan
          </Button>
        </div>
      </section>

      {/* Role */}
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-base font-semibold">Role</h3>
        <p className="text-xs text-muted-foreground">
          Admins can open /admin. Keep at least one admin account.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSelf}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r === "admin" ? "Admin" : "User"}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            disabled={pending || isSelf || role === user.role}
            onClick={() =>
              run(() => adminUpdateRole(user.id, role), "Role updated.")
            }
          >
            Save role
          </Button>
        </div>
        {isSelf && (
          <p className="text-xs text-amber-800 dark:text-amber-200">
            You cannot change your own role here.
          </p>
        )}
      </section>

      {/* Ban */}
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-base font-semibold">
          Access {banned ? "(banned)" : ""}
        </h3>
        <p className="text-xs text-muted-foreground">
          Ban blocks login via Supabase Auth. They cannot use the app until
          unbanned.
        </p>
        {banned ? (
          <div className="flex flex-col gap-2">
            {user.ban_reason && (
              <p className="text-sm">
                <span className="text-muted-foreground">Reason: </span>
                {user.ban_reason}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(() => adminUnbanUser(user.id), "User unbanned.")
              }
            >
              Unban user
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="ban-reason">Ban reason (optional)</Label>
              <input
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. abuse, spam…"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                maxLength={500}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || isSelf}
              onClick={() => {
                if (
                  !window.confirm(
                    `Ban ${user.email ?? user.display_name ?? "this user"}? They will be signed out and cannot log in.`
                  )
                ) {
                  return;
                }
                run(
                  () => adminBanUser(user.id, banReason),
                  "User banned."
                );
              }}
            >
              Ban user
            </Button>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-base font-semibold">Admin notes</h3>
        <p className="text-xs text-muted-foreground">
          Private notes — only visible to admins. Not shown to the user.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Internal notes…"
        />
        <Button
          type="button"
          variant="outline"
          className="self-start"
          disabled={pending || notes === (user.admin_notes ?? "")}
          onClick={() =>
            run(() => adminUpdateNotes(user.id, notes), "Notes saved.")
          }
        >
          Save notes
        </Button>
      </section>
    </div>
  );
}
