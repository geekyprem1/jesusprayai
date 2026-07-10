"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  Share2,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import {
  buildVerseShareText,
  downloadBlob,
  facebookShareUrl,
  renderVerseCardPng,
  safeFilename,
  whatsappShareUrl,
  type VerseSharePayload,
} from "@/lib/share/verse-card";
import { cn } from "@/lib/utils";

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

export function ShareVerseButton({
  verse,
  variant = "compact",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Prefer image + text when Web Share Level 2 is available
      let file: File | undefined;
      try {
        const blob = await renderVerseCardPng(verse);
        file = new File([blob], safeFilename(verse.reference), {
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
      // User cancelled share sheet — ignore
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
    // FB sharer needs a public URL; quote carries the verse text
    window.open(
      facebookShareUrl(origin, text()),
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function downloadCard() {
    setError(null);
    setBusy(true);
    try {
      const blob = await renderVerseCardPng(verse);
      downloadBlob(blob, safeFilename(verse.reference));
    } catch {
      setError("Could not create image. Try copy text instead.");
    } finally {
      setBusy(false);
    }
  }

  const actions = (
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
        title="WhatsApp"
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
        onClick={() => void downloadCard()}
        title="Download image card"
        aria-label="Download verse card image"
      >
        <Download className="size-3.5" />
        {variant === "full" && <span>Image</span>}
      </Button>
    </div>
  );

  if (variant === "full") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <p className="text-xs font-medium text-muted-foreground">
          Share this verse
        </p>
        {actions}
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
          {actions}
          {error && (
            <p className="mt-1.5 text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
