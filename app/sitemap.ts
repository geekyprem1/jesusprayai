import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getAllTopicSlugs } from "@/lib/content/verses-by-topic";
import { getAllGuideSlugs } from "@/lib/content/guides";
import { getAllCharacterSlugs } from "@/lib/content/bible-character-quiz";
import { TOOLS } from "@/lib/content/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/disclaimer`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...TOOLS.map((tool) => ({
      url: `${base}${tool.href}`,
      lastModified: now,
      changeFrequency: tool.sitemap.changeFrequency,
      priority: tool.sitemap.priority,
    })),
    {
      url: `${base}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  const topicPages: MetadataRoute.Sitemap = getAllTopicSlugs().map((slug) => ({
    url: `${base}/tools/verses-for/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = getAllGuideSlugs().map((slug) => ({
    url: `${base}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const characterPages: MetadataRoute.Sitemap = getAllCharacterSlugs().map(
    (slug) => ({
      url: `${base}/tools/bible-character-quiz/result/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...topicPages, ...guidePages, ...characterPages];
}
