"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CrossMark } from "@/components/brand/cross-mark";
import { BRAND, supportMailto } from "@/lib/brand";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-[oklch(0.72_0.1_85/0.3)] bg-[oklch(0.26_0.05_255)] text-[oklch(0.9_0.02_85)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-3 py-10 sm:grid-cols-2 sm:px-4 sm:py-12 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="font-display flex items-center gap-3 text-xl font-semibold">
            <CrossMark className="size-10 sm:size-11" light />
            <span>
              PrayNote{" "}
              <span className="italic text-[oklch(0.82_0.1_85)]">AI</span>
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[oklch(0.82_0.02_85)]">
            A quiet place for Christians to journal prayer, meet Scripture, and
            remember God&apos;s faithfulness. A project by the Eternal Faith
            team.
          </p>
          <p className="text-sm text-[oklch(0.85_0.02_85)]">
            <span className="text-[oklch(0.72_0.04_85)]">Contact: </span>
            <a
              href={supportMailto}
              className="font-medium text-[oklch(0.88_0.08_85)] underline-offset-4 hover:text-white hover:underline"
            >
              {BRAND.supportEmail}
            </a>
          </p>
        </div>

        <div className="text-sm">
          <p className="font-display mb-3 text-base font-semibold tracking-wide text-[oklch(0.78_0.08_85)]">
            Explore
          </p>
          <ul className="space-y-2 text-[oklch(0.85_0.02_85)]">
            <li>
              <Link href="/#features" className="inline-block py-1 hover:text-white">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="inline-block py-1 hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/signup" className="inline-block py-1 hover:text-white">
                Create free account
              </Link>
            </li>
            <li>
              <Link href="/app" className="inline-block py-1 hover:text-white">
                Open app
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-display mb-3 text-base font-semibold tracking-wide text-[oklch(0.78_0.08_85)]">
            Legal
          </p>
          <ul className="space-y-2 text-[oklch(0.85_0.02_85)]">
            <li>
              <Link href="/privacy" className="inline-block py-1 hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="inline-block py-1 hover:text-white">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-block py-1 hover:text-white">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm sm:col-span-2 lg:col-span-1">
          <p className="font-display mb-3 text-base font-semibold tracking-wide text-[oklch(0.78_0.08_85)]">
            A word for the road
          </p>
          <p className="font-display text-base italic leading-relaxed text-[oklch(0.88_0.03_85)]">
            &ldquo;Draw nigh to God, and he will draw nigh to you.&rdquo;
          </p>
          <p className="mt-2 text-xs tracking-wide text-[oklch(0.72_0.06_85)]">
            — James 4:8 (KJV)
          </p>
        </div>
      </div>

      <div className="gold-divider mx-auto max-w-6xl" />

      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-4 text-center text-[11px] text-[oklch(0.7_0.02_85)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4 sm:text-left sm:text-xs">
        <span>
          © {new Date().getFullYear()} PrayNote · From Eternal Faith · Made for
          the Church
        </span>
        <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
          <a href={supportMailto} className="hover:text-white">
            {BRAND.supportEmail}
          </a>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/disclaimer" className="hover:text-white">
            Disclaimer
          </Link>
          <span aria-hidden>·</span>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
        </span>
      </div>
    </footer>
  );
}
