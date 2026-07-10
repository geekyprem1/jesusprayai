"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  ImageIcon,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildVerseShareText,
  downloadBlob,
  facebookShareUrl,
  pinterestShareUrl,
  renderVerseCardPng,
  safeFilename,
  whatsappShareUrl,
  type VerseCardFormat,
  type VerseSharePayload,
} from "@/lib/share/verse-card";
import { cn } from "@/lib/utils";

/** Lucide dropped brand icons — simple FB “f” mark */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v7h4v-7h3.2l.8-4H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

type Props = {
  verse: VerseSharePayload;
  /** compact = icon row under a verse; full = labeled buttons */
  variant?: "compact" | "full";
  className?: string;
};

function appOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

const STORY_TARGETS: {
  id: string;
  label: string;
  format: VerseCardFormat;
  hint: string;
}[] = [
  {
    id: "ig",
    label: "Instagram Story",
    format: "story",
    hint: "9:16 image — save & upload to IG Story",
  },
  {
    id: "wa",
    label: "WhatsApp Status",
    format: "story",
    hint: "9:16 image for Status",
  },
  {
    id: "fb",
    label: "Facebook Story",
    format: "story",
    hint: "9:16 image for FB Story",
  },
  {
    id: "pin",
    label: "Pinterest",
    format: "pin",
    hint: "2:3 pin image",
  },
];

export function ShareVerseButton({
  verse,
  variant = "compact",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDl, setLastDl] = useState<string | null>(null);

  const text = () => buildVerseShareText(verse, appOrigin() || undefined);

  async function copyText() {
    setError(null);
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Try WhatsApp share.");
    }
  }

  async function nativeShare() {
    setError(null);
    setBusy(true);
    try {
      const shareText = text();
      let file: File | undefined;
      try {
        const blob = await renderVerseCardPng(verse, "story");
        file = new File([blob], safeFilename(verse.reference, "story"), {
          type: "image/png",
        });
      } catch {
        file = undefined;
      }

      if (navigator.share) {
        const data: ShareData = {
          title: verse.reference,
          text: shareText,
        };
        if (file && navigator.canShare?.({ files: [file] })) {
          data.files = [file];
        }
        await navigator.share(data);
      } else {
        await copyText();
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        /* no-op */
      } else {
        setError("Share cancelled or not available.");
      }
    } finally {
      setBusy(false);
    }
  }

  function openWhatsApp() {
    setError(null);
    window.open(whatsappShareUrl(text()), "_blank", "noopener,noreferrer");
  }

  function openFacebook() {
    setError(null);
    const origin = appOrigin() || "https://praynote.app";
    window.open(
      facebookShareUrl(origin, text()),
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openPinterest() {
    setError(null);
    const origin = appOrigin() || "https://praynote.app";
    window.open(
      pinterestShareUrl(origin, text()),
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function downloadCard(format: VerseCardFormat, label: string) {
    setError(null);
    setBusy(true);
    setLastDl(null);
    try {
      const blob = await renderVerseCardPng(verse, format);
      downloadBlob(blob, safeFilename(verse.reference, format));
      setLastDl(label);
      window.setTimeout(() => setLastDl(null), 4000);
    } catch {
      setError("Could not create image. Try copy text instead.");
    } finally {
      setBusy(false);
    }
  }

  const quickActions = (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        variant === "full" && "gap-2"
      )}
    >
      <Button
        type="button"
        size={variant === "full" ? "default" : "sm"}
        variant="outline"
        disabled={busy}
        onClick={() => void nativeShare()}
        title="Share"
        aria-label="Share verse"
      >
        <Share2 className="size-3.5" />
        {variant === "full" && <span>Share</span>}
      </Button>
      <Button
        type="button"
        size={variant === "full" ? "default" : "sm"}
        variant="outline"
        disabled={busy}
        onClick={openWhatsApp}
        title="WhatsApp text"
        aria-label="Share on WhatsApp"
        className="border-emerald-600/30 text-emerald-800 hover:bg-emerald-50"
      >
        <MessageCircle className="size-3.5" />
        {variant === "full" && <span>WhatsApp</span>}
      </Button>
      <Button
        type="button"
        size={variant === "full" ? "default" : "sm"}
        variant="outline"
        disabled={busy}
        onClick={openFacebook}
        title="Facebook"
        aria-label="Share on Facebook"
        className="border-blue-600/30 text-blue-800 hover:bg-blue-50"
      >
        <FacebookIcon className="size-3.5" />
        {variant === "full" && <span>Facebook</span>}
      </Button>
      <Button
        type="button"
        size={variant === "full" ? "default" : "sm"}
        variant="outline"
        disabled={busy}
        onClick={() => void copyText()}
        title="Copy text"
        aria-label="Copy verse text"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {variant === "full" && <span>{copied ? "Copied" : "Copy"}</span>}
      </Button>
      <Button
        type="button"
        size={variant === "full" ? "default" : "sm"}
        variant="outline"
        disabled={busy}
        onClick={() => void downloadCard("story", "Story image")}
        title="Download story image"
        aria-label="Download verse story image"
      >
        <Download className="size-3.5" />
        {variant === "full" && <span>Story image</span>}
      </Button>
    </div>
  );

  const storyTemplates = (
    <div className="mt-2 rounded-lg border border-border bg-muted/20 p-2.5">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ImageIcon className="size-3.5" />
        Story & pin templates
      </p>
      <div className="grid grid-cols-1 gap-1.5 min-[400px]:grid-cols-2">
        {STORY_TARGETS.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            className="h-auto justify-start py-2 text-left"
            onClick={() => {
              if (t.id === "pin") {
                void downloadCard(t.format, t.label).then(() => openPinterest());
              } else {
                void downloadCard(t.format, t.label);
              }
            }}
            title={t.hint}
          >
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-xs font-medium">{t.label}</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {t.hint}
              </span>
            </span>
          </Button>
        ))}
      </div>
      {lastDl && (
        <p className="mt-2 text-[11px] text-emerald-700">
          Saved {lastDl} — open the app and add from your gallery.
        </p>
      )}
    </div>
  );

  if (variant === "full") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <p className="text-xs font-medium text-muted-foreground">
          Share this verse
        </p>
        {quickActions}
        {storyTemplates}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 gap-1.5 px-2.5"
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Share verse options"
      >
        <Share2 className="size-3.5" />
        <span className="text-xs">Share</span>
      </Button>
      {open && (
        <div className="mt-2 rounded-lg border border-border bg-background p-2 shadow-sm">
          {quickActions}
          {storyTemplates}
          {error && (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
