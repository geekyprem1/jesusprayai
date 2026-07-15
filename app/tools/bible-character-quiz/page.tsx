import type { Metadata } from "next";
import { ContentShell } from "@/components/seo/content-shell";
import { FaqSection } from "@/components/seo/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { BibleCharacterQuiz } from "@/components/tools/bible-character-quiz";
import { RelatedTools } from "@/components/tools/related-tools";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo";

const faqs = [
  {
    question: "Is this quiz a spiritual assessment?",
    answer:
      "No. It is a light reflection based on qualities seen in eight Bible characters. It does not reveal your identity, calling, future, or God’s will for you.",
  },
  {
    question: "How is my Bible character result calculated?",
    answer:
      "Each answer adds weight to qualities such as courage, faith, wisdom, loyalty, compassion, and encouragement. A deterministic score finds the closest profile; there is no random result.",
  },
  {
    question: "Are my quiz answers saved?",
    answer:
      "No. The quiz runs in your browser. PrayNote does not send your individual answers to analytics or place them in the result URL.",
  },
  {
    question: "Is the Bible character quiz free?",
    answer:
      "Yes. You can take the quiz, read your reflection, download the result card, and share it without creating an account.",
  },
];

export const metadata: Metadata = {
  title: "Bible Character Quiz — Which Character Reflects You?",
  description:
    "Take a free 10-question Bible character quiz and discover which of eight biblical character profiles your answers resemble. No signup required.",
  alternates: { canonical: "/tools/bible-character-quiz" },
  openGraph: {
    title: "Which Bible Character Reflects You?",
    description:
      "Take the free PrayNote Bible Character Quiz and share your reflection.",
    url: "/tools/bible-character-quiz",
  },
};

export default function BibleCharacterQuizPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: "Bible Character Quiz",
            description:
              "A free 10-question reflection comparing your answers with qualities seen in eight Bible characters.",
            path: "/tools/bible-character-quiz",
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <ContentShell
        eyebrow="Free quiz · No signup"
        title="Which Bible character reflects your answers?"
        lead="Answer 10 thoughtful questions and explore the biblical character profile your choices most closely resemble. This is a light reflection—not prophecy, a spiritual diagnosis, or a statement about your identity."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { label: "Bible character quiz" },
        ]}
      >
        <BibleCharacterQuiz />

        <section aria-labelledby="how-quiz-works">
          <h2
            id="how-quiz-works"
            className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]"
          >
            How this reflection works
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Choose honestly", "Select the response closest to your healthy instinct—not the answer that sounds most impressive."],
              ["02", "Compare qualities", "Your choices build a local score across courage, faith, wisdom, loyalty, compassion, and other qualities."],
              ["03", "Read in context", "Use your result as an invitation to read the character’s story and reflect—not as a label from God."],
            ].map(([number, title, body]) => (
              <div
                key={number}
                className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/70 p-4"
              >
                <p className="text-xs font-semibold tracking-widest text-[oklch(0.55_0.08_85)]">
                  {number}
                </p>
                <h3 className="font-display mt-2 text-base font-semibold text-[oklch(0.26_0.05_255)]">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[oklch(0.44_0.03_255)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentToolId="bible-character-quiz" />
        <SoftSignupCta
          source="tools-bible-character-quiz"
          headline="Turn reflection into private prayer"
          body="Write what resonated, pray through the related Scripture, and keep the entry private in PrayNote."
        />
      </ContentShell>
      <FaqSection faqs={faqs} />
    </>
  );
}
