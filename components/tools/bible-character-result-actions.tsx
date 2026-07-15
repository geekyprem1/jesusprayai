"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Download, MessageCircle, RotateCcw, Share2 } from "lucide-react";
import { captureError, trackEvent } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import type { CharacterProfile } from "@/lib/content/bible-character-quiz";
import {
  buildCharacterShareText,
  renderCharacterResultPng,
  safeCharacterFilename,
} from "@/lib/share/bible-character-card";
import { downloadBlob, whatsappShareUrl } from "@/lib/share/verse-card";

const TOOL_ID = "bible-character-quiz";
const QUIZ_PATH = "/tools/bible-character-quiz";

type Props = {
  profile: CharacterProfile;
};

export function BibleCharacterResultActions({ profile }: Props) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultUrl = `${BRAND.siteUrl}${QUIZ_PATH}/result/${profile.slug}`;
  const quizUrl = `${BRAND.siteUrl}${QUIZ_PATH}`;

  async function createCard() {
    return renderCharacterResultPng(profile);
  }

  async function shareResult() {
    setBusy(true);
    setError(null);
    try {
      const text = buildCharacterShareText(profile, resultUrl);
      const blob = await createCard();
      const file = new File([blob], safeCharacterFilename(profile.slug), {
        type: "image/png",
      });

      if (navigator.share) {
        const data: ShareData = { title: `My result: ${profile.name}`, text, url: resultUrl };
        if (navigator.canShare?.({ files: [file] })) data.files = [file];
        await navigator.share(data);
        trackEvent("result_share", {
          tool_id: TOOL_ID,
          character_id: profile.id,
          share_method: "native",
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
        trackEvent("result_share", {
          tool_id: TOOL_ID,
          character_id: profile.id,
          share_method: "copy",
        });
      }
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") return;
      captureError(caught, "bible-character-result-share");
      setError("Sharing is not available. Try WhatsApp or download the card.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadCard() {
    setBusy(true);
    setError(null);
    try {
      const blob = await createCard();
      downloadBlob(blob, safeCharacterFilename(profile.slug));
      trackEvent("result_download", {
        tool_id: TOOL_ID,
        character_id: profile.id,
      });
    } catch (caught) {
      captureError(caught, "bible-character-result-download");
      setError("The result card could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function challengeFriend() {
    const text = [
      `I got ${profile.name} — ${profile.title} in the Bible Character Quiz.`,
      "Which character will you get?",
      quizUrl,
    ].join("\n");
    window.open(whatsappShareUrl(text), "_blank", "noopener,noreferrer");
    trackEvent("challenge_click", {
      tool_id: TOOL_ID,
      character_id: profile.id,
      share_method: "whatsapp",
    });
  }

  return (
    <div className="rounded-2xl border border-[oklch(0.72_0.1_85/0.4)] bg-[oklch(0.97_0.02_85)] p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]">
        Share your reflection
      </h2>
      <p className="mt-1.5 text-sm text-[oklch(0.42_0.03_255)]">
        Download your card or invite a friend to take the quiz. Your individual
        answers are never included.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void shareResult()}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[oklch(0.28_0.05_255)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[oklch(0.34_0.05_255)] disabled:opacity-60"
        >
          {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          {copied ? "Copied" : "Share result"}
        </button>
        <button
          type="button"
          onClick={() => void downloadCard()}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[oklch(0.65_0.08_85/0.6)] bg-white px-4 py-2.5 text-sm font-medium text-[oklch(0.3_0.05_255)] transition hover:bg-[oklch(0.98_0.01_85)] disabled:opacity-60"
        >
          <Download className="size-4" />
          {busy ? "Preparing…" : "Download card"}
        </button>
        <button
          type="button"
          onClick={challengeFriend}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-700/30 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50"
        >
          <MessageCircle className="size-4" />
          Challenge a friend
        </button>
        <Link
          href={QUIZ_PATH}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[oklch(0.35_0.04_255)] transition hover:bg-white"
        >
          <RotateCcw className="size-4" />
          Retake quiz
        </Link>
      </div>
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
