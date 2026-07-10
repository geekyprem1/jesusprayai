/** Shared product limits (security + cost control). */

export const LIMITS = {
  /** Max prayer body characters */
  prayerBodyMax: 10_000,
  /** Max prayer request title / description */
  requestTitleMax: 200,
  requestDescriptionMax: 5_000,
  /** Free-tier AI calls per UTC day (categorize+verses counts as 1; insight as 1) */
  aiCallsPerDay: 20,
  /** Whisper transcripts per UTC day */
  whisperPerDay: 10,
  /** Max audio upload for Whisper */
  whisperMaxBytes: 5 * 1024 * 1024,
  /** Bible API: requests per IP per minute */
  biblePerIpPerMin: 60,
  /** Transcribe: requests per IP per minute */
  transcribePerIpPerMin: 10,
  /** Auth attempts per IP per 15 min */
  authPerIpPer15Min: 30,
  /** Min password length */
  passwordMinLength: 10,
  /** Bible reference max length */
  bibleRefMax: 120,
} as const;

export const ALLOWED_AUDIO_MIME = [
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/flac",
  "video/webm", // some browsers label webm audio this way
] as const;

export function isAllowedAudioMime(mime: string): boolean {
  const m = (mime || "").toLowerCase().split(";")[0].trim();
  if (!m) return true; // allow empty; extension still set
  return (ALLOWED_AUDIO_MIME as readonly string[]).includes(m);
}
