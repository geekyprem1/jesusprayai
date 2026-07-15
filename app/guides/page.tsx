import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/seo/content-shell";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { GUIDES } from "@/lib/content/guides";
import { webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Prayer & Scripture Guides",
  description:
    "Practical Christian guides on prayer journaling, the ACTS method, Bible verses for anxiety, and tracking answered prayer. From PrayNote AI.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Prayer & Scripture Guides",
    description:
      "How-to guides for prayer journals, ACTS prayer, and Scripture for anxious seasons.",
    url: "/guides",
  },
};

export default function GuidesIndexPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          title: "Prayer & Scripture Guides",
          description:
            "Christian guides on prayer journaling and Scripture.",
          path: "/guides",
        })}
      />
      <ContentShell
        eyebrow="Guides"
        title="Prayer and Scripture guides"
        lead="Answer-first articles for building a prayer habit, praying with Scripture, and remembering what God has done. Written by Eternal Faith for PrayNote."
        crumbs={[
          { href: "/", label: "Home" },
          { label: "Guides" },
        ]}
      >
        <ul className="space-y-3">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="block rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5 transition hover:border-[oklch(0.72_0.1_85/0.55)]"
              >
                <span className="font-display text-lg font-semibold text-[oklch(0.24_0.05_255)]">
                  {guide.title}
                </span>
                <p className="mt-1.5 text-sm text-[oklch(0.42_0.03_255)]">
                  {guide.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-[oklch(0.42_0.03_255)]">
          Prefer a tool? Try{" "}
          <Link
            href="/tools/verses-for"
            className="font-medium underline-offset-2 hover:underline"
          >
            Bible verses by topic
          </Link>
          ,{" "}
          <Link
            href="/tools/random-verse"
            className="font-medium underline-offset-2 hover:underline"
          >
            random verse
          </Link>
          , or{" "}
          <Link
            href="/tools/prayer-prompts"
            className="font-medium underline-offset-2 hover:underline"
          >
            prayer prompts
          </Link>
          .
        </p>
        <SoftSignupCta source="guides-index" />
      </ContentShell>
    </>
  );
}
