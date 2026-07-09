import { NextResponse } from "next/server";
import { getPassage, normalizeReferenceInput } from "@/lib/bible/client";
import type { BibleTranslation } from "@/lib/bible/types";

const ALLOWED: BibleTranslation[] = ["KJV", "NIV", "ESV"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = normalizeReferenceInput(searchParams.get("ref") || "");
  const translationParam = (searchParams.get("translation") || "KJV").toUpperCase();
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
      },
    }
  );
}
