import { NextResponse } from "next/server";
import {
  getVoiceCapabilities,
  transcribeAudio,
} from "@/lib/stt";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** GET — which voice modes are available (no secrets). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    ...getVoiceCapabilities(),
  });
}

/** POST — multipart audio → Whisper transcript (auth required when Supabase on). */
export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "Log in to use Whisper voice." },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "Auth check failed." },
        { status: 401 }
      );
    }
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

  // ~60s of audio is plenty for a prayer; hard size cap in lib
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: "Audio too large (max 25MB)." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "audio/webm";
  const ext = mime.includes("mp4")
    ? "mp4"
    : mime.includes("mpeg")
      ? "mp3"
      : mime.includes("wav")
        ? "wav"
        : "webm";

  const result = await transcribeAudio(buffer, mime, `prayer.${ext}`);

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}
