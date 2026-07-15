import Link from "next/link";

type Props = {
  headline?: string;
  body?: string;
  /** Extra query context e.g. source=verses-anxiety */
  source?: string;
};

export function SoftSignupCta({
  headline = "Keep a private journal of this",
  body = "Save verses, write prayers, and track answered prayer in PrayNote — free to start. Your words stay between you and God.",
  source,
}: Props) {
  const href = source
    ? `/signup?utm_source=${encodeURIComponent(source)}`
    : "/signup";

  return (
    <aside className="rounded-2xl border border-[oklch(0.72_0.1_85/0.4)] bg-[oklch(0.26_0.05_255)] px-5 py-8 text-center text-white sm:px-8">
      <h2 className="font-display text-xl font-semibold sm:text-2xl">
        {headline}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-white/85">{body}</p>
      <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[oklch(0.78_0.08_85)] px-6 py-2.5 text-sm font-semibold text-[oklch(0.22_0.04_255)] transition hover:bg-[oklch(0.84_0.08_85)]"
        >
          Create free account
        </Link>
        <Link
          href="/pricing"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 px-6 py-2.5 text-sm text-white transition hover:bg-white/10"
        >
          See pricing
        </Link>
      </div>
    </aside>
  );
}
