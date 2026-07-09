import { z } from "zod";

export const CATEGORIES = [
  "gratitude",
  "intercession",
  "petition",
  "confession",
  "praise",
  "uncategorized",
] as const;

export const categorizeSchema = z.object({
  category: z.enum(CATEGORIES),
  confidence: z.number().min(0).max(1).optional(),
  rationale: z.string().optional(),
});

export const verseSuggestSchema = z.object({
  topics: z.array(z.string()).default([]),
  sentiment: z
    .enum([
      "hopeful",
      "anxious",
      "grateful",
      "repentant",
      "neutral",
      "other",
    ])
    .default("neutral"),
  suggestions: z
    .array(
      z.object({
        reference: z.string(),
        reason: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
      })
    )
    .min(0)
    .max(3),
});

export type CategorizeResult = z.infer<typeof categorizeSchema>;
export type VerseSuggestResult = z.infer<typeof verseSuggestSchema>;
