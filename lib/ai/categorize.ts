import { createOpenRouterClient, getChatModel } from "@/lib/openrouter";
import { categorizeSchema, type CategorizeResult } from "@/lib/ai/schemas";

const SYSTEM = `You are a careful assistant for a Christian prayer journal.
Classify the user's prayer into exactly one category:
- gratitude: thanking God for blessings
- intercession: praying for other people
- petition: asking God for something for oneself
- confession: admitting sin / seeking forgiveness
- praise: worshipping God for who He is
- uncategorized: unclear or mixed without a primary focus

Respond with JSON only:
{"category":"...","confidence":0.0-1.0,"rationale":"short"}

Be respectful and non-judgmental. Do not give medical, legal, or financial advice.`;

export async function categorizePrayerText(
  bodyPlain: string
): Promise<CategorizeResult> {
  const client = createOpenRouterClient();
  const model = getChatModel("categorize");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: bodyPlain.slice(0, 4000) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned non-JSON categorization");
  }

  return categorizeSchema.parse(parsed);
}
