export type ToolId =
  | "bible-character-quiz"
  | "bible-verse-wallpaper"
  | "verses-by-topic"
  | "random-verse"
  | "prayer-prompts";

export type ToolDefinition = {
  id: ToolId;
  href: `/tools/${string}`;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  sitemap: {
    changeFrequency: "weekly" | "monthly";
    priority: number;
  };
};

export const TOOLS: readonly ToolDefinition[] = [
  {
    id: "bible-character-quiz",
    href: "/tools/bible-character-quiz",
    title: "Bible character personality quiz",
    shortTitle: "Bible character quiz",
    description:
      "Answer 10 thoughtful questions and discover which biblical character profile your choices resemble.",
    shortDescription: "Which Bible character reflects your answers?",
    sitemap: { changeFrequency: "monthly", priority: 0.9 },
  },
  {
    id: "bible-verse-wallpaper",
    href: "/tools/bible-verse-wallpaper",
    title: "Bible verse wallpaper maker",
    shortTitle: "Verse wallpaper maker",
    description:
      "Create KJV phone wallpapers, social posts, Stories, and Pinterest images with original backgrounds.",
    shortDescription: "Design and share Scripture in four free image sizes.",
    sitemap: { changeFrequency: "monthly", priority: 0.9 },
  },
  {
    id: "verses-by-topic",
    href: "/tools/verses-for",
    title: "Bible verses by topic",
    shortTitle: "Verses by topic",
    description:
      "Anxiety, healing, strength, hope, gratitude, and more curated Scripture lists.",
    shortDescription: "Anxiety, healing, strength, hope, and more.",
    sitemap: { changeFrequency: "weekly", priority: 0.85 },
  },
  {
    id: "random-verse",
    href: "/tools/random-verse",
    title: "Random Bible verse",
    shortTitle: "Random Bible verse",
    description:
      "Draw a verse for quiet time, then copy or download a shareable card.",
    shortDescription: "A fresh verse for prayer or encouragement.",
    sitemap: { changeFrequency: "weekly", priority: 0.85 },
  },
  {
    id: "prayer-prompts",
    href: "/tools/prayer-prompts",
    title: "Prayer prompt generator",
    shortTitle: "Prayer prompts",
    description:
      "Gratitude, confession, intercession, praise, and ACTS starters — no blank page.",
    shortDescription: "Gratitude, confession, intercession, ACTS.",
    sitemap: { changeFrequency: "weekly", priority: 0.85 },
  },
];

export function getToolById(id: ToolId): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getRelatedTools(
  currentToolId: ToolId,
  limit = 2
): readonly ToolDefinition[] {
  return TOOLS.filter((tool) => tool.id !== currentToolId).slice(0, limit);
}
