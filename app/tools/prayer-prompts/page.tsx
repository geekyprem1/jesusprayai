import type { Metadata } from "next";
import { ContentShell } from "@/components/seo/content-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/seo/faq-section";
import { PrayerPromptsTool } from "@/components/tools/prayer-prompts-tool";
import { RelatedTools } from "@/components/tools/related-tools";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo";

const faqs = [
  {
    question: "What is a prayer prompt?",
    answer:
      "A prayer prompt is a short starter sentence that helps you begin talking to God when you feel stuck. Fill in the blanks with real names and needs.",
  },
  {
    question: "What is the ACTS prayer method?",
    answer:
      "ACTS stands for Adoration, Confession, Thanksgiving, and Supplication. It is a simple pattern for balanced Christian prayer. See our ACTS guide for a full walkthrough.",
  },
  {
    question: "Do I need to sign up to use these prompts?",
    answer:
      "No. The generator is free without an account. Sign up only if you want to save prayers in a private PrayNote journal.",
  },
];

export const metadata: Metadata = {
  title: "Prayer Prompt Generator — Free Christian Prompts",
  description:
    "Free Christian prayer prompts for gratitude, confession, intercession, praise, and ACTS. No signup required.",
  alternates: { canonical: "/tools/prayer-prompts" },
  openGraph: {
    title: "Prayer Prompt Generator — Free",
    description:
      "Overcome blank-page prayer with free prompts. Gratitude, confession, ACTS, and more.",
    url: "/tools/prayer-prompts",
  },
};

export default function PrayerPromptsPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: "Prayer Prompt Generator",
            description:
              "Free Christian prayer prompts. No account needed.",
            path: "/tools/prayer-prompts",
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <ContentShell
        eyebrow="Free tool · No signup"
        title="Prayer prompt generator"
        lead="Blank page? Pick a category and get a Scripture-shaped prompt you can pray aloud or write in your journal."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { label: "Prayer prompts" },
        ]}
      >
        <PrayerPromptsTool />
        <RelatedTools currentToolId="prayer-prompts" />
      </ContentShell>
      <FaqSection faqs={faqs} />
    </>
  );
}
