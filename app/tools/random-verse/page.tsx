import type { Metadata } from "next";
import { ContentShell } from "@/components/seo/content-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { FaqSection } from "@/components/seo/faq-section";
import { RandomVerseTool } from "@/components/tools/random-verse-tool";
import { RelatedTools } from "@/components/tools/related-tools";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo";

const faqs = [
  {
    question: "Is this random Bible verse generator free?",
    answer:
      "Yes. It runs in your browser with no signup. You can copy the verse or download a verse card anytime.",
  },
  {
    question: "Where do the verses come from?",
    answer:
      "Verses are drawn from PrayNote’s curated public-domain KJV lists across topics like peace, hope, strength, and gratitude.",
  },
];

export const metadata: Metadata = {
  title: "Random Bible Verse Generator — Free",
  description:
    "Get a random Bible verse for encouragement and prayer. Free, no signup. Copy or download a verse card from PrayNote.",
  alternates: { canonical: "/tools/random-verse" },
  openGraph: {
    title: "Random Bible Verse Generator — Free",
    description:
      "Free random Bible verse tool. No account required. Share hope with a verse card.",
    url: "/tools/random-verse",
  },
};

export default function RandomVersePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: "Random Bible Verse Generator",
            description:
              "Free random Bible verse for prayer and encouragement. No signup.",
            path: "/tools/random-verse",
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <ContentShell
        eyebrow="Free tool · No signup"
        title="Random Bible verse"
        lead="Need a starting point for quiet time? Draw a verse from our curated Scripture pool, then copy it or download a shareable card."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { label: "Random verse" },
        ]}
      >
        <RandomVerseTool />
        <RelatedTools currentToolId="random-verse" />
      </ContentShell>
      <FaqSection faqs={faqs} />
    </>
  );
}
