import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="flex min-h-[calc(100dvh-0px)] flex-col bg-[oklch(0.97_0.012_85)]">
      <AdminNav adminEmail={user.email ?? null} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </div>
    </div>
  );
}
