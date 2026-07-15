import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentShell } from "@/components/seo/content-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { BibleCharacterResultActions } from "@/components/tools/bible-character-result-actions";
import { RelatedTools } from "@/components/tools/related-tools";
import {
  getAllCharacterSlugs,
  getBibleCharacterBySlug,
} from "@/lib/content/bible-character-quiz";
import { webPageJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ character: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllCharacterSlugs().map((character) => ({ character }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { character: slug } = await params;
  const profile = getBibleCharacterBySlug(slug);
  if (!profile) return { title: "Bible Character Quiz Result" };

  const path = `/tools/bible-character-quiz/result/${profile.slug}`;
  return {
    title: `${profile.name} — Bible Character Quiz Result`,
    description: profile.metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: `My Bible Character Quiz Result: ${profile.name}`,
      description: profile.metaDescription,
      url: path,
    },
  };
}

export default async function BibleCharacterResultPage({ params }: Props) {
  const { character: slug } = await params;
  const profile = getBibleCharacterBySlug(slug);
  if (!profile) notFound();

  const path = `/tools/bible-character-quiz/result/${profile.slug}`;

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          title: `${profile.name} — Bible Character Quiz Result`,
          description: profile.metaDescription,
          path,
        })}
      />
      <ContentShell
        eyebrow="Your Bible character reflection"
        title={`${profile.name}: ${profile.title}`}
        lead={profile.summary}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { href: "/tools/bible-character-quiz", label: "Bible character quiz" },
          { label: profile.name },
        ]}
      >
        <section className="rounded-2xl border border-[oklch(0.72_0.1_85/0.45)] bg-white/85 p-5 sm:p-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-[oklch(0.55_0.08_85)] uppercase">
            Why this result may resonate
          </p>
          <p className="mt-3 leading-relaxed text-[oklch(0.32_0.03_255)]">
            {profile.reflection}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Reflected strengths">
            {profile.strengths.map((strength) => (
              <li
                key={strength}
                className="rounded-full border border-[oklch(0.72_0.1_85/0.45)] bg-[oklch(0.97_0.02_85)] px-3 py-1.5 text-xs font-medium text-[oklch(0.32_0.05_255)]"
              >
                {strength}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="growth-heading">
          <h2
            id="growth-heading"
            className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]"
          >
            A possible growth edge
          </h2>
          <p className="mt-2 rounded-2xl border-l-4 border-[oklch(0.62_0.1_85)] bg-white/70 p-4 leading-relaxed">
            {profile.growthArea}
          </p>
        </section>

        <section aria-labelledby="scripture-heading">
          <h2
            id="scripture-heading"
            className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]"
          >
            Scripture to read in context
          </h2>
          <blockquote className="mt-3 rounded-2xl bg-[oklch(0.26_0.05_255)] p-5 text-white sm:p-6">
            <p className="font-display text-lg leading-relaxed italic sm:text-xl">
              “{profile.verse.text}”
            </p>
            <footer className="mt-3 text-sm font-medium text-[oklch(0.82_0.09_85)]">
              — {profile.verse.reference} ({profile.verse.translation})
            </footer>
          </blockquote>
          <p className="mt-3 leading-relaxed">{profile.scriptureContext}</p>
          <p className="mt-3 text-sm">
            Continue with: {profile.storyReferences.join(" · ")}
          </p>
        </section>

        <section aria-labelledby="reflect-heading">
          <h2
            id="reflect-heading"
            className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]"
          >
            Questions for prayer and reflection
          </h2>
          <ol className="mt-3 space-y-2">
            {profile.reflectionQuestions.map((question, index) => (
              <li
                key={question}
                className="flex gap-3 rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/70 p-4"
              >
                <span className="font-semibold text-[oklch(0.55_0.08_85)]">
                  {index + 1}.
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </section>

        <BibleCharacterResultActions profile={profile} />

        <aside className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/65 p-4 text-xs leading-relaxed text-[oklch(0.45_0.03_255)]">
          This quiz compares selected qualities for reflection. It does not reveal
          your identity, calling, future, spiritual maturity, or God’s will. Read
          Scripture in context and seek wise pastoral counsel for important
          decisions. You can also{" "}
          <Link
            href="/tools/bible-character-quiz"
            className="font-semibold underline underline-offset-2"
          >
            retake the quiz
          </Link>
          .
        </aside>

        <RelatedTools currentToolId="bible-character-quiz" />
        <SoftSignupCta
          source={`tools-character-${profile.slug}`}
          headline="Pray through what resonated"
          body="Write a private reflection beside this Scripture and return to it as you grow. Your journal stays private."
        />
      </ContentShell>
    </>
  );
}
