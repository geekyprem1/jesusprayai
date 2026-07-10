import { Suspense } from "react";
import { listAdminUsers } from "@/app/admin/actions";
import { UsersTable } from "@/components/admin/users-table";
import { LoadingScreen } from "@/components/brand/loading-screen";

type SearchParams = Promise<{
  q?: string;
  page?: string;
  status?: string;
}>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const status =
    sp.status === "active" || sp.status === "banned" ? sp.status : "all";

  const result = await listAdminUsers({
    q,
    page,
    pageSize: 25,
    status,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Search, change plans, ban, or promote admins.
        </p>
      </div>

      {!result.ok ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {result.error}
        </p>
      ) : (
        <Suspense
          fallback={<LoadingScreen label="Loading users…" delayMs={0} size="sm" />}
        >
          <UsersTable
            users={result.users}
            total={result.total}
            page={result.page}
            pageSize={result.pageSize}
            q={q}
            status={status}
          />
        </Suspense>
      )}
    </div>
  );
}
