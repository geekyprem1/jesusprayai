"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CrossMark } from "@/components/brand/cross-mark";
import { InstallButton } from "@/components/pwa/install-button";

type Props = {
  email: string | null;
  signOutSlot: React.ReactNode;
};

export function SiteHeaderClient({ email, signOutSlot }: Props) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[oklch(0.72_0.1_85/0.25)] bg-[oklch(0.98_0.015_85/0.95)] backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:px-4">
        <Link
          href="/"
          onClick={close}
          className="font-display flex min-w-0 items-center gap-2.5 text-lg font-semibold tracking-wide text-[oklch(0.22_0.05_255)] sm:gap-3 sm:text-xl"
        >
          <CrossMark className="size-9 shrink-0 sm:size-10" />
          <span className="truncate leading-none">
            PrayNote{" "}
            <span className="font-semibold italic text-[oklch(0.48_0.1_85)]">
              AI
            </span>
          </span>
        </Link>

        {/* Desktop / tablet nav */}
        <nav className="hidden items-center gap-1 md:flex md:gap-2">
          <InstallButton className="mr-1 hidden lg:inline-flex" />
          <Link
            href="/#features"
            className="rounded-full px-3 py-2 text-sm text-[oklch(0.35_0.04_255)] transition hover:bg-[oklch(0.94_0.02_85)]"
          >
            Features
          </Link>
          <Link
            href="/#scripture"
            className="rounded-full px-3 py-2 text-sm text-[oklch(0.35_0.04_255)] transition hover:bg-[oklch(0.94_0.02_85)]"
          >
            Scripture
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-3 py-2 text-sm text-[oklch(0.35_0.04_255)] transition hover:bg-[oklch(0.94_0.02_85)]"
          >
            Pricing
          </Link>
          {email ? (
            <>
              <Link
                href="/app"
                className="rounded-full bg-[oklch(0.28_0.05_255)] px-4 py-2 text-sm font-medium text-[oklch(0.97_0.01_85)]"
              >
                Open app
              </Link>
              {signOutSlot}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[oklch(0.72_0.1_85/0.5)] bg-white/60 px-4 py-2 text-sm"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[oklch(0.28_0.05_255)] px-4 py-2 text-sm font-medium text-[oklch(0.97_0.01_85)]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {email ? (
            <Link
              href="/app"
              className="rounded-full bg-[oklch(0.28_0.05_255)] px-3 py-2 text-xs font-medium text-[oklch(0.97_0.01_85)] sm:text-sm"
            >
              App
            </Link>
          ) : (
            <Link
              href="/signup"
              className="rounded-full bg-[oklch(0.28_0.05_255)] px-3 py-2 text-xs font-medium text-[oklch(0.97_0.01_85)] sm:text-sm"
            >
              Sign up
            </Link>
          )}
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[oklch(0.72_0.1_85/0.4)] bg-white/70"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-[oklch(0.72_0.1_85/0.25)] bg-[oklch(0.98_0.015_85)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { href: "/#features", label: "Features" },
              { href: "/#scripture", label: "Scripture" },
              { href: "/pricing", label: "Pricing" },
              ...(email
                ? [{ href: "/app", label: "Open app" }]
                : [
                    { href: "/login", label: "Log in" },
                    { href: "/signup", label: "Sign up" },
                  ]),
            ].map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={close}
                className="rounded-xl px-3 py-3 text-base text-[oklch(0.28_0.05_255)] hover:bg-[oklch(0.94_0.02_85)]"
              >
                {item.label}
              </Link>
            ))}
            {email && <div className="mt-2 px-1">{signOutSlot}</div>}
          </nav>
        </div>
      )}
    </header>
  );
}
