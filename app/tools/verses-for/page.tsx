import type { Metadata } from "next";
import Link from "next/link";
import { ContentShell } from "@/components/seo/content-shell";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/seo/faq-section";
import { RelatedTools } from "@/components/tools/related-tools";
import { VERSE_TOPICS } from "@/lib/content/verses-by-topic";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo";

const faqs = [
  {
    question: "Do I need an account to read these Bible verses?",
    answer:
      "No. PrayNote’s verses-by-topic tool is free and requires no signup. Create an account only if you want a private prayer journal to save verses and prayers.",
  },
  {
    question: "Which Bible translation do you use?",
    answer:
      "These curated lists use the King James Version (KJV) for public domain clarity. Inside the PrayNote app you can also read passages via the Bible reader.",
  },
  {
    question: "Are these verses a substitute for pastoral care?",
    answer:
      "No. Scripture comforts and guides, but ongoing anxiety, trauma, or illness may also need wise counsel, medical care, and your local church.",
  },
];

export const metadata: Metadata = {
  title: "Bible Verses by Topic — Free Scripture Lists",
  description:
    "Free Bible verses by topic: anxiety, worry, healing, strength, peace, hope, gratitude, and forgiveness. No signup required.",
  alternates: { canonical: "/tools/verses-for" },
  openGraph: {
    title: "Bible Verses by Topic — Free Scripture Lists",
    description:
      "Browse curated Bible verses for anxiety, healing, strength, and more. Free, no account needed.",
    url: "/tools/verses-for",
  },
};

export default function VersesForIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: "Bible Verses by Topic",
            description:
              "Free curated Bible verse lists by topic for prayer and encouragement.",
            path: "/tools/verses-for",
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <ContentShell
        eyebrow="Free tool · No signup"
        title="Bible verses by topic"
        lead="Choose a topic to read curated Scripture for prayer and encouragement. Every list is free — save favorites later in a private PrayNote journal if you want."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { label: "Verses by topic" },
        ]}
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {VERSE_TOPICS.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/tools/verses-for/${topic.slug}`}
                className="block rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5 transition hover:border-[oklch(0.72_0.1_85/0.55)] hover:shadow-sm"
              >
                <span className="font-display text-lg font-semibold text-[oklch(0.24_0.05_255)]">
                  {topic.title}
                </span>
                <p className="mt-1.5 text-sm text-[oklch(0.42_0.03_255)]">
                  {topic.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <RelatedTools currentToolId="verses-by-topic" />
        <SoftSignupCta source="tools-verses-index" />
      </ContentShell>
      <FaqSection faqs={faqs} />
    </>
  );
}
