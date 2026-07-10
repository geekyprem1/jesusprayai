import Link from "next/link";
import {
  getAdminStats,
  getRecentAdminUsers,
} from "@/app/admin/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPlanTier } from "@/lib/admin/constants";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-display text-3xl tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      {hint && (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      )}
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const [statsRes, recentRes] = await Promise.all([
    getAdminStats(),
    getRecentAdminUsers(8),
  ]);

  const stats = statsRes.ok
    ? statsRes.stats
    : {
        totalUsers: 0,
        newThisWeek: 0,
        paidUsers: 0,
        bannedUsers: 0,
        admins: 0,
      };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage users, plans, and access for PrayNote.
          </p>
        </div>
        <Button render={<Link href="/admin/users" />}>Manage users</Button>
      </div>

      {!statsRes.ok && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
          {statsRes.error}
          {" — "}
          Did you run migration <code className="text-xs">007_admin.sql</code>{" "}
          and set <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code>?
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard
          label="New this week"
          value={stats.newThisWeek}
          hint="Last 7 days"
        />
        <StatCard
          label="Paid plans"
          value={stats.paidUsers}
          hint="Non-free plan_tier"
        />
        <StatCard label="Banned" value={stats.bannedUsers} />
        <StatCard label="Admins" value={stats.admins} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Recent signups</CardTitle>
            <CardDescription>Newest profiles first</CardDescription>
          </div>
          <Button size="sm" variant="outline" render={<Link href="/admin/users" />}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {!recentRes.ok && (
            <p className="text-sm text-muted-foreground">{recentRes.error}</p>
          )}
          {recentRes.ok && recentRes.users.length === 0 && (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          )}
          {recentRes.ok && recentRes.users.length > 0 && (
            <ul className="divide-y divide-border">
              {recentRes.users.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {u.display_name || "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email ?? u.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatPlanTier(u.plan_tier)}</span>
                    {u.account_status === "banned" && (
                      <span className="text-destructive">Banned</span>
                    )}
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
