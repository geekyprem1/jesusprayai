import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentShell } from "@/components/seo/content-shell";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/seo/faq-section";
import {
  getAllGuideSlugs,
  getGuideBySlug,
  type GuideMeta,
} from "@/lib/content/guides";
import { faqPageJsonLd, webPageJsonLd, type FaqItem } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

type GuideBody = {
  paragraphs: string[];
  steps?: { title: string; text: string }[];
  bullets?: string[];
  related: { href: string; label: string }[];
  faqs: FaqItem[];
};

const BODIES: Record<string, GuideBody> = {
  "how-to-start-a-prayer-journal": {
    paragraphs: [
      "A prayer journal is a private place to write what you say to God and what you notice Him doing over time. You do not need fancy supplies — only honesty and a habit you can keep.",
      "Start small: one short entry most days beats a perfect system you abandon in a week. Link each prayer to Scripture when you can, so journaling returns you to the Word.",
    ],
    steps: [
      {
        title: "Pick one place",
        text: "Choose a notebook or a private digital journal like PrayNote. Consistency matters more than the format.",
      },
      {
        title: "Set a tiny rhythm",
        text: "Aim for 5 minutes — morning, lunch, or before bed. Attach the habit to something you already do.",
      },
      {
        title: "Write one honest prayer",
        text: "Gratitude, worry, confession, or praise. Use a prompt if the page feels blank.",
      },
      {
        title: "Add one verse",
        text: "Read a short passage and write how it speaks into your prayer. Our free verse tools help you find a starting text.",
      },
      {
        title: "Review weekly",
        text: "Mark what God answered. A testimony trail strengthens faith in dry seasons.",
      },
    ],
    related: [
      { href: "/tools/prayer-prompts", label: "Free prayer prompts" },
      { href: "/tools/verses-for", label: "Bible verses by topic" },
      { href: "/guides/acts-prayer-method", label: "ACTS prayer method" },
    ],
    faqs: [
      {
        question: "How do I start a prayer journal as a beginner?",
        answer:
          "Choose one notebook or app, write for five minutes most days, and link each entry to one Bible verse. Review answered prayer once a week.",
      },
      {
        question: "Is a digital prayer journal okay?",
        answer:
          "Yes. Digital journals are searchable and harder to lose. Choose a private tool — PrayNote is built so prayers are not a public feed.",
      },
    ],
  },
  "acts-prayer-method": {
    paragraphs: [
      "The ACTS prayer method is a simple pattern: Adoration, Confession, Thanksgiving, and Supplication. It keeps prayer from becoming only a wish list.",
      "Use ACTS as a scaffold, not a rigid script. Move through each letter briefly, then linger where the Spirit leads.",
    ],
    steps: [
      {
        title: "Adoration",
        text: "Praise God for who He is — holy, faithful, near — before asking for anything.",
      },
      {
        title: "Confession",
        text: "Name sin honestly and receive forgiveness in Christ (1 John 1:9).",
      },
      {
        title: "Thanksgiving",
        text: "Thank Him for specific mercies, answered prayer, and daily bread.",
      },
      {
        title: "Supplication",
        text: "Bring requests for yourself and others. Ask boldly and trust His wisdom.",
      },
    ],
    related: [
      { href: "/tools/prayer-prompts", label: "ACTS prayer prompts" },
      {
        href: "/guides/how-to-start-a-prayer-journal",
        label: "How to start a prayer journal",
      },
    ],
    faqs: [
      {
        question: "What does ACTS stand for in prayer?",
        answer:
          "Adoration, Confession, Thanksgiving, and Supplication — four movements that balance worship, repentance, gratitude, and requests.",
      },
      {
        question: "How long should an ACTS prayer take?",
        answer:
          "As little as five minutes. Spend about a minute on each letter, or longer when one area needs more honesty.",
      },
    ],
  },
  "bible-verses-for-anxiety": {
    paragraphs: [
      "Bible verses for anxiety do not erase every feeling overnight, but they reframe fear under God’s care. Philippians 4:6-7 calls you to pray with thanksgiving and promises peace that guards heart and mind in Christ.",
      "When you feel anxious, read one verse slowly, then turn it into a short prayer: ‘Lord, Your Word says… help me trust You with…’",
      "If anxiety is persistent or severe, seek pastoral care and professional help. Scripture and wise counsel work together.",
    ],
    bullets: [
      "Philippians 4:6-7 — pray instead of rehearsing worry",
      "1 Peter 5:7 — cast every care on Him",
      "Isaiah 41:10 — He strengthens and upholds",
      "Psalm 94:19 — His comforts delight the soul",
      "John 14:27 — Christ’s peace, not the world’s",
    ],
    related: [
      { href: "/tools/verses-for/anxiety", label: "Full verses for anxiety list" },
      { href: "/tools/verses-for/worry", label: "Verses for worry" },
      { href: "/tools/prayer-prompts", label: "Prayer prompts" },
    ],
    faqs: [
      {
        question: "What Bible verse helps with anxiety?",
        answer:
          "Philippians 4:6-7 is a primary passage: bring every request to God with thanksgiving, and the peace of God will guard your heart and mind in Christ Jesus.",
      },
      {
        question: "How should I pray Bible verses for anxiety?",
        answer:
          "Read the verse aloud, name your specific fear, and ask God to apply His promise. Write the prayer in a journal so you can look back later.",
      },
    ],
  },
  "how-to-track-answered-prayer": {
    paragraphs: [
      "Tracking answered prayer turns vague memory into a testimony you can revisit. Write the request, the date, and — when God answers — what happened and how you responded in praise.",
      "Not every answer looks like ‘yes.’ Sometimes God redirects, delays, or gives grace to endure. Record those too; they still reveal His faithfulness.",
    ],
    steps: [
      {
        title: "Log the request clearly",
        text: "One sentence: who, what, and when you started praying.",
      },
      {
        title: "Add Scripture",
        text: "Note a verse that shaped how you prayed.",
      },
      {
        title: "Mark the answer",
        text: "When something changes, update the entry with a short story of God’s help.",
      },
      {
        title: "Review monthly",
        text: "Skim answered entries. Thank God out loud. Share a verse (not private details) to encourage someone else.",
      },
    ],
    related: [
      {
        href: "/guides/how-to-start-a-prayer-journal",
        label: "Start a prayer journal",
      },
      { href: "/signup", label: "Track answers in PrayNote" },
    ],
    faqs: [
      {
        question: "Why track answered prayer?",
        answer:
          "A written record fights forgetfulness. In dry seasons you can reread concrete ways God has already cared for you.",
      },
      {
        question: "What if a prayer seems unanswered?",
        answer:
          "Keep praying and note what you are learning. God may be shaping character, timing, or a different good. Update the entry when clarity comes.",
      },
    ],
  },
  "digital-vs-paper-prayer-journal": {
    paragraphs: [
      "Paper journals feel tactile and distraction-light. Digital journals are searchable, backed up, and easier to keep on a phone you already carry.",
      "Choose the format that helps you pray more often. Many people use both: paper for deep quiet time, digital for quick captures and verse saving on the go.",
      "If you go digital, prefer a private Christian prayer journal — not a public social feed. PrayNote is built so prayers stay yours while verse cards can still encourage others.",
    ],
    bullets: [
      "Paper: fewer notifications, keepsake feel, no battery",
      "Digital: search, reminders, verse tools, harder to lose",
      "Hybrid: paper for Sundays, app for weekday moments",
    ],
    related: [
      {
        href: "/guides/how-to-start-a-prayer-journal",
        label: "How to start either way",
      },
      { href: "/pricing", label: "PrayNote free vs Premium" },
      { href: "/tools/prayer-prompts", label: "Free prompts to try now" },
    ],
    faqs: [
      {
        question: "Is a digital prayer journal as spiritual as paper?",
        answer:
          "Yes. The medium is a tool. What matters is honest prayer before God and returning to Scripture — not whether ink or pixels hold the words.",
      },
      {
        question: "Is PrayNote private?",
        answer:
          "PrayNote is designed as a journal, not a public wall. You can share verse cards without sharing your private prayers.",
      },
    ],
  },
};

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide" };
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url: `/guides/${guide.slug}`,
      type: "article",
    },
  };
}

function GuideContent({ guide, body }: { guide: GuideMeta; body: GuideBody }) {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: guide.title,
            description: guide.metaDescription,
            path: `/guides/${guide.slug}`,
          }),
          faqPageJsonLd(body.faqs),
        ]}
      />
      <ContentShell
        eyebrow="Guide"
        title={guide.title}
        lead={guide.description}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/guides", label: "Guides" },
          { label: guide.title },
        ]}
      >
        {body.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}

        {body.steps && (
          <ol className="space-y-4">
            {body.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5"
              >
                <p className="text-[10px] font-medium tracking-widest text-[oklch(0.55_0.08_85)] uppercase">
                  Step {i + 1}
                </p>
                <h2 className="font-display mt-1 text-xl font-semibold text-[oklch(0.24_0.05_255)]">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm text-[oklch(0.42_0.03_255)]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        )}

        {body.bullets && (
          <ul className="list-disc space-y-2 pl-5">
            {body.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}

        <div>
          <h2 className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]">
            Related
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {body.related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="inline-flex rounded-full border border-[oklch(0.72_0.1_85/0.45)] bg-white/80 px-3 py-1.5 text-xs font-medium text-[oklch(0.28_0.05_255)] hover:bg-white"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <SoftSignupCta source={`guide-${guide.slug}`} />
      </ContentShell>
      <FaqSection faqs={body.faqs} />
    </>
  );
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  const body = BODIES[slug];
  if (!guide || !body) notFound();
  return <GuideContent guide={guide} body={body} />;
}
