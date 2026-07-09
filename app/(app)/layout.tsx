import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { SignOutButton } from "@/components/app/sign-out-button";
import { isSupabaseConfigured } from "@/lib/env";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col sm:min-h-[calc(100dvh-4rem)]">
      {!configured && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-900 sm:text-sm dark:text-amber-100">
          Demo mode — Supabase keys missing. Add keys for full login protection.
        </div>
      )}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <aside className="md:sticky md:top-16 md:self-start md:border-r md:border-border">
          <div className="hidden items-center gap-2 border-b border-border px-4 py-3 md:flex">
            <Link href="/app" className="flex items-center gap-2 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="size-3.5" />
              </span>
              App
            </Link>
          </div>
          <AppSidebar />
          <div className="hidden border-t border-border p-3 md:block">
            <SignOutButton />
          </div>
        </aside>
        <div className="app-shell-main flex-1 px-3 py-4 sm:px-5 sm:py-6 md:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
