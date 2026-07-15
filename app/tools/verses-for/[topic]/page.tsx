import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentShell } from "@/components/seo/content-shell";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/seo/faq-section";
import { VerseActions } from "@/components/tools/verse-actions";
import {
  getAllTopicSlugs,
  getTopicBySlug,
  VERSE_TOPICS,
} from "@/lib/content/verses-by-topic";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return getAllTopicSlugs().map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Verses" };
  return {
    title: topic.title,
    description: topic.metaDescription,
    alternates: { canonical: `/tools/verses-for/${topic.slug}` },
    openGraph: {
      title: topic.title,
      description: topic.metaDescription,
      url: `/tools/verses-for/${topic.slug}`,
    },
  };
}

export default async function VersesForTopicPage({ params }: Props) {
  const { topic: slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const faqs = [
    {
      question: `What are the best Bible verses for ${topic.label.toLowerCase()}?`,
      answer: `${topic.intro} This page lists ${topic.verses.length} curated passages, starting with ${topic.verses[0].reference}.`,
    },
    {
      question: "Can I share these verses?",
      answer:
        "Yes. Use Copy or Download verse card on any passage. Your private prayers stay private — only the verse is shared.",
    },
    {
      question: "How do I save verses in a prayer journal?",
      answer:
        "Create a free PrayNote account to save verses, write prayers beside them, and mark answered prayer over time.",
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: topic.title,
            description: topic.metaDescription,
            path: `/tools/verses-for/${topic.slug}`,
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <ContentShell
        eyebrow="Free tool · No signup"
        title={topic.title}
        lead={topic.intro}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools/verses-for", label: "Verses by topic" },
          { label: topic.label },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          {VERSE_TOPICS.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/verses-for/${t.slug}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                t.slug === topic.slug
                  ? "bg-[oklch(0.28_0.05_255)] text-[oklch(0.97_0.01_85)]"
                  : "border border-[oklch(0.72_0.1_85/0.45)] bg-white/70 text-[oklch(0.35_0.04_255)] hover:bg-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <ol className="space-y-4">
          {topic.verses.map((verse, i) => (
            <li
              key={verse.reference}
              className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5"
            >
              <p className="text-[10px] font-medium tracking-widest text-[oklch(0.55_0.08_85)] uppercase">
                {String(i + 1).padStart(2, "0")}
              </p>
              <blockquote className="font-display mt-2 text-lg leading-relaxed text-[oklch(0.24_0.05_255)] italic sm:text-xl">
                “{verse.text}”
              </blockquote>
              <p className="mt-3 text-sm font-medium tracking-wide text-[oklch(0.45_0.06_85)]">
                — {verse.reference} ({verse.translation})
              </p>
              <VerseActions verse={verse} />
            </li>
          ))}
        </ol>

        {topic.relatedGuide && (
          <p className="text-sm">
            Want more context?{" "}
            <Link
              href={topic.relatedGuide}
              className="font-medium text-[oklch(0.32_0.06_255)] underline-offset-2 hover:underline"
            >
              Read our guide on Bible verses for anxiety
            </Link>
            .
          </p>
        )}

        <SoftSignupCta source={`tools-verses-${topic.slug}`} />
      </ContentShell>
      <FaqSection faqs={faqs} />
    </>
  );
}
