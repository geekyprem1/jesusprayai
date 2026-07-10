import { NextResponse } from "next/server";
import { getVoiceCapabilities, transcribeAudio } from "@/lib/stt";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { LIMITS, isAllowedAudioMime } from "@/lib/security/limits";
import { clientIpFromRequest, rateLimit } from "@/lib/security/rate-limit";
import { consumeAiQuota } from "@/lib/security/ai-quota";

/** GET — which voice modes are available (no secrets). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    ...getVoiceCapabilities(),
  });
}

/** POST — multipart audio → Whisper transcript (auth required). */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const rl = rateLimit(
    `transcribe:${ip}`,
    LIMITS.transcribePerIpPerMin,
    60 * 1000
  );
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many voice requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  // Always require Supabase auth in production; also require when configured
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "Service misconfigured." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Log in required. Configure Supabase for voice." },
      { status: 401 }
    );
  }

  let supabase;
  let userId: string;
  try {
    supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Log in to use Whisper voice." },
        { status: 401 }
      );
    }
    userId = user.id;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Auth check failed." },
      { status: 401 }
    );
  }

  const quota = await consumeAiQuota(supabase, userId, "whisper");
  if (!quota.ok) {
    return NextResponse.json({ ok: false, error: quota.error }, { status: 429 });
  }

  const caps = getVoiceCapabilities();
  if (!caps.whisper) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Whisper not configured. Set OPENAI_API_KEY (and STT_PROVIDER=openai_whisper or auto).",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart form data." },
      { status: 400 }
    );
  }

  const file = form.get("audio");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing audio file field." },
      { status: 400 }
    );
  }

  if (file.size > LIMITS.whisperMaxBytes) {
    return NextResponse.json(
      {
        ok: false,
        error: `Audio too large (max ${Math.floor(LIMITS.whisperMaxBytes / (1024 * 1024))}MB).`,
      },
      { status: 400 }
    );
  }

  const mime = file.type || "audio/webm";
  if (!isAllowedAudioMime(mime)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported audio type." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = mime.includes("mp4")
    ? "mp4"
    : mime.includes("mpeg") || mime.includes("mp3")
      ? "mp3"
      : mime.includes("wav")
        ? "wav"
        : mime.includes("ogg")
          ? "ogg"
          : "webm";

  const result = await transcribeAudio(buffer, mime, `prayer.${ext}`);

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}
