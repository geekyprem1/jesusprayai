import type { Metadata } from "next";
import { ContentShell } from "@/components/seo/content-shell";
import { FaqSection } from "@/components/seo/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { SoftSignupCta } from "@/components/seo/soft-signup-cta";
import { BibleVerseWallpaperMaker } from "@/components/tools/bible-verse-wallpaper-maker";
import { RelatedTools } from "@/components/tools/related-tools";
import { WALLPAPER_VERSES } from "@/lib/content/bible-verse-wallpapers";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo";

const faqs = [
  {
    question: "Is the Bible verse wallpaper maker free?",
    answer:
      "Yes. Choose a verse, customize the design, and download or share the PNG without signing up.",
  },
  {
    question: "Which Bible translation is used?",
    answer:
      "The 30 curated wallpapers use the King James Version (KJV), a public-domain translation in the United States.",
  },
  {
    question: "Which image sizes can I create?",
    answer:
      "You can create a 1080×1080 square post, 1080×1920 Story or WhatsApp Status, 1000×1500 Pinterest pin, or 1440×2560 phone wallpaper.",
  },
  {
    question: "Are uploaded photos or an image API required?",
    answer:
      "No. The original backgrounds are drawn in your browser with gradients and shapes, so no photo upload or external image API is needed.",
  },
];

export const metadata: Metadata = {
  title: "Bible Verse Wallpaper Maker — Free KJV Generator",
  description:
    "Create free Bible verse wallpapers and Christian social cards. Choose a KJV verse, background, typography, and four PNG sizes. No signup.",
  alternates: { canonical: "/tools/bible-verse-wallpaper" },
  openGraph: {
    title: "Free Bible Verse Wallpaper Maker",
    description:
      "Create a Bible verse wallpaper, Instagram Story, WhatsApp Status, or Pinterest image for free.",
    url: "/tools/bible-verse-wallpaper",
  },
};

export default function BibleVerseWallpaperPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            title: "Bible Verse Wallpaper Maker",
            description:
              "Create free KJV Bible verse wallpapers and social cards in four PNG sizes.",
            path: "/tools/bible-verse-wallpaper",
          }),
          faqPageJsonLd(faqs),
        ]}
      />
      <ContentShell
        eyebrow="Free design tool · No signup"
        title="Bible verse wallpaper maker"
        lead="Choose one of 30 curated KJV passages, customize an original background and typography, then create a phone wallpaper or social image entirely in your browser."
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/tools", label: "Tools" },
          { label: "Bible verse wallpaper" },
        ]}
      >
        <BibleVerseWallpaperMaker verses={WALLPAPER_VERSES} />

        <section aria-labelledby="wallpaper-uses">
          <h2
            id="wallpaper-uses"
            className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]"
          >
            One verse, four useful formats
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              ["Phone wallpaper", "Create a tall lock-screen reminder with generous safe margins."],
              ["WhatsApp Status", "Use the 9:16 Story size, download it, and add it from your gallery."],
              ["Instagram or Facebook", "Choose square for a feed post or Story for full-screen sharing."],
              ["Pinterest", "Export a 2:3 vertical pin with the verse reference and subtle PrayNote credit."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/70 p-4"
              >
                <h3 className="font-display text-base font-semibold text-[oklch(0.26_0.05_255)]">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[oklch(0.44_0.03_255)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools currentToolId="bible-verse-wallpaper" />
        <SoftSignupCta
          source="tools-bible-verse-wallpaper"
          headline="Keep the verse close in prayer"
          body="Save Scripture beside a private prayer and return to it later in PrayNote. Your words stay private."
        />
      </ContentShell>
      <FaqSection faqs={faqs} />
    </>
  );
}
