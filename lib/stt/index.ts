/**
 * Speech-to-text — separate from OpenRouter chat (DeepSeek is text-only).
 *
 * Providers:
 * - openai_whisper: server-side, needs OPENAI_API_KEY
 * - browser: Web Speech API on the client (no key)
 */

export type SttProvider = "none" | "openai_whisper" | "browser" | "auto";

export function getSttProvider(): SttProvider {
  const p = (process.env.STT_PROVIDER || "auto").toLowerCase();
  if (
    p === "openai_whisper" ||
    p === "browser" ||
    p === "none" ||
    p === "auto"
  ) {
    return p as SttProvider;
  }
  return "auto";
}

export function isWhisperConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** What the server can offer for voice. */
export function getVoiceCapabilities() {
  const provider = getSttProvider();
  const whisper =
    isWhisperConfigured() &&
    (provider === "openai_whisper" ||
      provider === "auto" ||
      (provider !== "browser" && provider !== "none" && isWhisperConfigured()));

  return {
    whisper: Boolean(
      isWhisperConfigured() &&
        provider !== "browser" &&
        provider !== "none"
    ),
    browser: provider !== "none",
    provider,
  };
}

export type TranscribeResult =
  | { ok: true; text: string; provider: "openai_whisper" }
  | { ok: false; error: string };

const MAX_BYTES = 25 * 1024 * 1024; // Whisper limit ~25MB
const MAX_DURATION_HINT = "Keep recordings under ~2 minutes for best results.";

/**
 * OpenAI Whisper transcription (server-only).
 */
export async function transcribeAudio(
  audio: Buffer,
  mimeType: string,
  filename = "prayer.webm"
): Promise<TranscribeResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "OPENAI_API_KEY not set. Add it for Whisper, or use browser voice (no key).",
    };
  }

  if (!audio.length) {
    return { ok: false, error: "Empty audio." };
  }
  if (audio.length > MAX_BYTES) {
    return {
      ok: false,
      error: `Audio too large. ${MAX_DURATION_HINT}`,
    };
  }

  const form = new FormData();
  const blob = new Blob([new Uint8Array(audio)], {
    type: mimeType || "audio/webm",
  });
  form.append("file", blob, filename);
  form.append("model", process.env.OPENAI_WHISPER_MODEL?.trim() || "whisper-1");
  form.append("response_format", "json");
  // Optional language hint for prayer English; leave unset for auto-detect
  const lang = process.env.STT_LANGUAGE?.trim();
  if (lang) form.append("language", lang);

  try {
    const res = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Whisper error ${res.status}: ${errText.slice(0, 200) || res.statusText}`,
      };
    }

    const data = (await res.json()) as { text?: string };
    const text = data.text?.trim();
    if (!text) {
      return { ok: false, error: "No speech detected. Try again closer to the mic." };
    }

    return { ok: true, text, provider: "openai_whisper" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Transcription failed",
    };
  }
}
