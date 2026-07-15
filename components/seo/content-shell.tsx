import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href?: string; label: string };

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  crumbs?: Crumb[];
  children: ReactNode;
};

export function ContentShell({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: Props) {
  return (
    <div className="marketing-gradient flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-3xl flex-1 px-3 py-10 sm:px-4 sm:py-14">
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 text-xs text-[oklch(0.5_0.03_255)]"
          >
            <ol className="flex flex-wrap items-center gap-1.5">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>/</span>}
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="underline-offset-2 hover:text-[oklch(0.28_0.05_255)] hover:underline"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-[oklch(0.35_0.04_255)]">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <p className="mb-2 text-[10px] font-medium tracking-[0.2em] text-[oklch(0.55_0.08_85)] uppercase sm:text-xs">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[oklch(0.24_0.05_255)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[oklch(0.4_0.03_255)] sm:text-base">
          {lead}
        </p>
        <div className="gold-divider my-8 w-full" />
        <div className="space-y-8 text-sm leading-relaxed text-[oklch(0.32_0.03_255)] sm:text-[0.95rem]">
          {children}
        </div>
      </article>
    </div>
  );
}
