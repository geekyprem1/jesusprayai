import Link from "next/link";
import { CrossMark } from "@/components/brand/cross-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-[oklch(0.72_0.1_85/0.3)] bg-[oklch(0.26_0.05_255)] text-[oklch(0.9_0.02_85)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-3 py-10 sm:grid-cols-2 sm:px-4 sm:py-12 lg:grid-cols-3">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="font-display flex items-center gap-2 text-lg font-semibold">
            <CrossMark className="size-7 brightness-125" light />
            PrayNote AI
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[oklch(0.82_0.02_85)]">
            A quiet place for Christians to journal prayer, meet Scripture, and
            remember God&apos;s faithfulness.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-display mb-3 text-base font-semibold tracking-wide text-[oklch(0.78_0.08_85)]">
            Explore
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[oklch(0.85_0.02_85)] sm:block sm:space-y-2">
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

        <div className="text-sm sm:col-span-2 lg:col-span-1">
          <p className="font-display mb-3 text-base font-semibold tracking-wide text-[oklch(0.78_0.08_85)]">
            A word for the road
          </p>
          <p className="font-display text-base italic leading-relaxed text-[oklch(0.88_0.03_85)]">
            “Draw nigh to God, and he will draw nigh to you.”
          </p>
          <p className="mt-2 text-xs tracking-wide text-[oklch(0.72_0.06_85)]">
            — James 4:8 (KJV)
          </p>
        </div>
      </div>

      <div className="gold-divider mx-auto max-w-6xl" />

      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-3 py-4 text-center text-[11px] text-[oklch(0.7_0.02_85)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4 sm:text-left sm:text-xs">
        <span>© {new Date().getFullYear()} PrayNote AI · Made for the Church</span>
        <span>Payments (Lemon Squeezy) coming later</span>
      </div>
    </footer>
  );
}
