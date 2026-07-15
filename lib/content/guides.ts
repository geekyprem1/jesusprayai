export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
};

export const GUIDES: GuideMeta[] = [
  {
    slug: "how-to-start-a-prayer-journal",
    title: "How to Start a Prayer Journal",
    description:
      "A simple, Scripture-centered way to begin writing prayers and remembering God’s faithfulness.",
    metaDescription:
      "Learn how to start a Christian prayer journal in 5 clear steps. Free guide from PrayNote AI — plus prayer prompts and verse tools.",
  },
  {
    slug: "acts-prayer-method",
    title: "The ACTS Prayer Method Explained",
    description:
      "Adoration, Confession, Thanksgiving, Supplication — a balanced pattern for daily prayer.",
    metaDescription:
      "What is the ACTS prayer method? Clear explanation with examples, then try free ACTS prayer prompts in PrayNote.",
  },
  {
    slug: "bible-verses-for-anxiety",
    title: "Bible Verses for Anxiety (and How to Pray Them)",
    description:
      "Key Scriptures for anxious seasons, with a simple way to turn each verse into prayer.",
    metaDescription:
      "Bible verses for anxiety with prayer tips. Read Philippians 4:6-7 and more, then use PrayNote’s free verse tool.",
  },
  {
    slug: "how-to-track-answered-prayer",
    title: "How to Track Answered Prayer",
    description:
      "Build a testimony timeline so dry seasons don’t erase what God has already done.",
    metaDescription:
      "How to track answered prayer in a journal. Practical steps for Christians — and how PrayNote helps you remember.",
  },
  {
    slug: "digital-vs-paper-prayer-journal",
    title: "Digital vs Paper Prayer Journal",
    description:
      "Honest comparison so you can choose the tool that helps you actually pray consistently.",
    metaDescription:
      "Digital vs paper prayer journal: pros, cons, and when an AI Christian journal like PrayNote helps.",
  },
];

export function getGuideBySlug(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
