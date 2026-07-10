import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ title, description, updated, children }: Props) {
  return (
    <div className="marketing-gradient flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-3xl flex-1 px-3 py-10 sm:px-4 sm:py-14">
        <p className="mb-2 text-[10px] font-medium tracking-[0.2em] text-[oklch(0.55_0.08_85)] uppercase sm:text-xs">
          Legal
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[oklch(0.24_0.05_255)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[oklch(0.4_0.03_255)] sm:text-base">
          {description}
        </p>
        <p className="mt-2 text-xs text-[oklch(0.5_0.03_255)]">
          Last updated: {updated}
        </p>

        <div className="gold-divider my-8 w-full" />

        <div className="legal-prose space-y-6 text-sm leading-relaxed text-[oklch(0.32_0.03_255)] sm:text-[0.95rem]">
          {children}
        </div>

        <div className="mt-12 rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/70 p-5 text-sm text-[oklch(0.4_0.03_255)]">
          <p className="font-medium text-[oklch(0.26_0.05_255)]">
            Related documents
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <li>
              <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="text-primary underline-offset-4 hover:underline">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="/" className="text-primary underline-offset-4 hover:underline">
                Home
              </Link>
            </li>
          </ul>
        </div>
      </article>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
