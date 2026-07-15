import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/seo/content-shell";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free Christian Tools — Verses, Prompts & More",
  description:
    "Free PrayNote tools with no signup: Bible verses by topic, random verse generator, and Christian prayer prompts.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free Christian Tools — PrayNote",
    description:
      "Bible verses by topic, random verse, and prayer prompts. Free, no account required.",
    url: "/tools",
  },
};

const tools = [
  {
    href: "/tools/verses-for",
    title: "Bible verses by topic",
    text: "Anxiety, healing, strength, hope, gratitude, and more curated Scripture lists.",
  },
  {
    href: "/tools/random-verse",
    title: "Random Bible verse",
    text: "Draw a verse for quiet time, then copy or download a shareable card.",
  },
  {
    href: "/tools/prayer-prompts",
    title: "Prayer prompt generator",
    text: "Gratitude, confession, intercession, praise, and ACTS starters — no blank page.",
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          title: "Free Christian Tools",
          description:
            "Free PrayNote tools: verses by topic, random verse, prayer prompts.",
          path: "/tools",
        })}
      />
      <ContentShell
        eyebrow="Free · No signup"
        title="Christian tools for prayer and Scripture"
        lead="Use these tools without an account. When you are ready, save verses and prayers in a private PrayNote journal."
        crumbs={[
          { href: "/", label: "Home" },
          { label: "Tools" },
        ]}
      >
        <ul className="space-y-3">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="block rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5 transition hover:border-[oklch(0.72_0.1_85/0.55)] hover:shadow-sm"
              >
                <span className="font-display text-lg font-semibold text-[oklch(0.24_0.05_255)]">
                  {tool.title}
                </span>
                <p className="mt-1.5 text-sm text-[oklch(0.42_0.03_255)]">
                  {tool.text}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <SoftSignupCta source="tools-index" />
      </ContentShell>
    </>
  );
}
