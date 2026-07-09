/**
 * OpenRouter model resolution.
 * Feature code must NEVER hard-code a model id — always use getChatModel().
 */

export type AiTask = "categorize" | "verses" | "devotional";

/**
 * Returns the OpenRouter model slug for a task.
 * Order: task-specific env → OPENROUTER_MODEL.
 */
export function getChatModel(task?: AiTask): string {
  const fallback = process.env.OPENROUTER_MODEL?.trim();
  if (!fallback) {
    throw new Error(
      "OPENROUTER_MODEL is not set. Example: deepseek/deepseek-v4-flash"
    );
  }

  if (task === "categorize") {
    return process.env.OPENROUTER_MODEL_CATEGORIZE?.trim() || fallback;
  }
  if (task === "verses") {
    return process.env.OPENROUTER_MODEL_VERSES?.trim() || fallback;
  }
  if (task === "devotional") {
    return process.env.OPENROUTER_MODEL_DEVOTIONAL?.trim() || fallback;
  }

  return fallback;
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(
    process.env.OPENROUTER_API_KEY?.trim() &&
      process.env.OPENROUTER_MODEL?.trim()
  );
}
