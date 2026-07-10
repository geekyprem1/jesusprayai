import { NextResponse } from "next/server";
import { getPassage, normalizeReferenceInput } from "@/lib/bible/client";
import type { BibleTranslation } from "@/lib/bible/types";
import { LIMITS } from "@/lib/security/limits";
import { clientIpFromRequest, rateLimit } from "@/lib/security/rate-limit";

const ALLOWED: BibleTranslation[] = ["KJV", "NIV", "ESV"];

export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const rl = rateLimit(
    `bible:${ip}`,
    LIMITS.biblePerIpPerMin,
    60 * 1000
  );
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawRef = searchParams.get("ref") || "";
  if (rawRef.length > LIMITS.bibleRefMax) {
    return NextResponse.json(
      { ok: false, error: "Reference is too long." },
      { status: 400 }
    );
  }

  const ref = normalizeReferenceInput(rawRef);
  if (!ref) {
    return NextResponse.json(
      { ok: false, error: "Enter a reference (e.g. John 3:16)." },
      { status: 400 }
    );
  }

  const translationParam = (
    searchParams.get("translation") || "KJV"
  ).toUpperCase();
  const translation = (
    ALLOWED.includes(translationParam as BibleTranslation)
      ? translationParam
      : "KJV"
  ) as BibleTranslation;

  const result = await getPassage(ref, translation);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { ok: true, passage: result.passage },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "X-RateLimit-Remaining": String(rl.remaining),
      },
    }
  );
}
