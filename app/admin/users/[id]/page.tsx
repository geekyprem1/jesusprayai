import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { UserActionsForm } from "@/components/admin/user-actions-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPlanTier } from "@/lib/admin/constants";

type Params = Promise<{ id: string }>;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const { user: adminUser } = await requireAdmin();
  const result = await getAdminUser(id);

  if (!result.ok) {
    if (result.error === "User not found.") notFound();
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {result.error}
      </p>
    );
  }

  const u = result.user;
  const isSelf = u.id === adminUser.id;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to users
        </Link>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {u.display_name || "User"}
        </h1>
        <p className="break-all text-sm text-muted-foreground">
          {u.email ?? u.id}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>
              Activity counts only — prayer content is private.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <Row label="User ID" value={u.id} mono />
            <Row label="Email" value={u.email ?? "—"} />
            <Row label="Display name" value={u.display_name ?? "—"} />
            <Row label="Plan" value={formatPlanTier(u.plan_tier)} />
            <Row label="Role" value={u.role} />
            <Row
              label="Status"
              value={
                u.account_status === "banned" ? "Banned" : "Active"
              }
            />
            <Row label="Joined" value={formatDate(u.created_at)} />
            <Row
              label="Last sign-in"
              value={formatDate(u.last_sign_in_at)}
            />
            <Row
              label="Translation"
              value={u.preferred_translation ?? "—"}
            />
            <Row label="Timezone" value={u.timezone ?? "—"} />
            <Row
              label="Journal entries"
              value={String(u.entry_count ?? 0)}
            />
            <Row
              label="Prayer requests"
              value={String(u.request_count ?? 0)}
            />
          </CardContent>
        </Card>

        <UserActionsForm user={u} isSelf={isSelf} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          mono
            ? "break-all font-mono text-xs sm:text-right"
            : "break-words sm:text-right"
        }
      >
        {value}
      </span>
    </div>
  );
}
