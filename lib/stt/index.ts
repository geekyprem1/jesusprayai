/**
 * Speech-to-text interface (Phase 3 stub).
 * DeepSeek/OpenRouter chat is text-only — STT is a separate provider.
 */

export type SttProvider = "none" | "openai_whisper" | "browser";

export function getSttProvider(): SttProvider {
  const p = (process.env.STT_PROVIDER || "none").toLowerCase();
  if (p === "openai_whisper" || p === "browser") return p;
  return "none";
}

export type TranscribeResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/**
 * Server-side Whisper path (when STT_PROVIDER=openai_whisper + OPENAI_API_KEY).
 * Not wired to UI until audio upload is enabled.
 */
export async function transcribeAudio(
  _audio: Buffer,
  _mimeType: string
): Promise<TranscribeResult> {
  const provider = getSttProvider();
  if (provider === "none") {
    return {
      ok: false,
      error:
        "STT not configured. Set STT_PROVIDER=openai_whisper and OPENAI_API_KEY, or use browser speech (future).",
    };
  }

  if (provider === "browser") {
    return {
      ok: false,
      error: "Browser STT runs client-side only.",
    };
  }

  // Whisper hook — implement when voice UI ships fully
  return {
    ok: false,
    error: "Whisper transcription not fully wired yet — stub for Phase 3.",
  };
}
