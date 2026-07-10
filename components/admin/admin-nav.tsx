"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CrossMark } from "@/components/brand/cross-mark";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
];

export function AdminNav({ adminEmail }: { adminEmail: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[oklch(0.22_0.05_255)] text-[oklch(0.96_0.01_85)] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <CrossMark className="size-9 shrink-0" light />
          <div className="min-w-0">
            <p className="font-display text-base font-semibold tracking-wide sm:text-lg">
              Admin
            </p>
            <p className="truncate text-xs text-[oklch(0.78_0.03_85)]">
              {adminEmail ?? "PrayNote"}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[oklch(0.78_0.1_85/0.2)] text-[oklch(0.9_0.08_85)]"
                    : "text-[oklch(0.82_0.02_85)] hover:bg-white/10"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/app"
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-[oklch(0.88_0.02_85)] hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            App
          </Link>
        </nav>
      </div>
    </header>
  );
}
