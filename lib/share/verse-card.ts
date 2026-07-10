export type VerseSharePayload = {
  reference: string;
  verseText: string;
  translation?: string;
};

/** Story / feed formats for social platforms */
export type VerseCardFormat =
  | "story" // 9:16 — IG Story, FB Story, WA Status
  | "portrait" // 4:5 — IG feed / general
  | "pin"; // 2:3 — Pinterest

const FORMAT_SIZE: Record<VerseCardFormat, { w: number; h: number; label: string }> =
  {
    story: { w: 1080, h: 1920, label: "Story 9:16" },
    portrait: { w: 1080, h: 1350, label: "Portrait 4:5" },
    pin: { w: 1000, h: 1500, label: "Pinterest 2:3" },
  };

export function formatLabel(format: VerseCardFormat): string {
  return FORMAT_SIZE[format].label;
}

/** Plain text for WhatsApp / FB / clipboard — short, mobile-friendly */
export function buildVerseShareText(
  verse: VerseSharePayload,
  appUrl?: string
): string {
  const ref = verse.reference.trim();
  const body = verse.verseText.trim();
  const translation = verse.translation?.trim();
  const lines = [
    `“${body}”`,
    "",
    translation ? `— ${ref} (${translation})` : `— ${ref}`,
    "",
    "Shared from PrayNote",
  ];
  if (appUrl) {
    lines.push(appUrl);
  }
  return lines.join("\n");
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function facebookShareUrl(pageUrl: string, quote?: string): string {
  const u = new URL("https://www.facebook.com/sharer/sharer.php");
  u.searchParams.set("u", pageUrl);
  if (quote) u.searchParams.set("quote", quote);
  return u.toString();
}

/** Pinterest pin builder — needs a public image URL in production; we download image instead */
export function pinterestShareUrl(pageUrl: string, description: string): string {
  const u = new URL("https://www.pinterest.com/pin/create/button/");
  u.searchParams.set("url", pageUrl);
  u.searchParams.set("description", description.slice(0, 500));
  return u.toString();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Client-only: render a shareable verse image for stories / pins / feed.
 */
export async function renderVerseCardPng(
  verse: VerseSharePayload,
  format: VerseCardFormat = "story"
): Promise<Blob> {
  const { w: W, h: H } = FORMAT_SIZE[format];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  // Navy → deep blue gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1a2b4a");
  bg.addColorStop(0.55, "#243656");
  bg.addColorStop(1, "#1e334f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft gold glow top
  const glow = ctx.createRadialGradient(W * 0.5, 0, 20, W * 0.5, H * 0.12, H * 0.4);
  glow.addColorStop(0, "rgba(224, 197, 122, 0.28)");
  glow.addColorStop(1, "rgba(224, 197, 122, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Gold frame
  const pad = Math.round(W * 0.045);
  ctx.strokeStyle = "rgba(212, 184, 106, 0.55)";
  ctx.lineWidth = Math.max(2, Math.round(W * 0.003));
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

  // Brand
  const brandY = Math.round(H * 0.09);
  ctx.fillStyle = "rgba(224, 197, 122, 0.95)";
  ctx.font = `500 ${Math.round(W * 0.026)}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = "center";
  ctx.fillText("PRAYNOTE", W / 2, brandY);

  ctx.fillStyle = "rgba(247, 243, 235, 0.55)";
  ctx.font = `400 ${Math.round(W * 0.02)}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("from Eternal Faith", W / 2, brandY + Math.round(H * 0.022));

  // Decorative line
  ctx.strokeStyle = "rgba(212, 184, 106, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - W * 0.075, brandY + Math.round(H * 0.04));
  ctx.lineTo(W / 2 + W * 0.075, brandY + Math.round(H * 0.04));
  ctx.stroke();

  // Verse body
  const quote = `“${verse.verseText.trim()}”`;
  ctx.fillStyle = "#f7f3eb";
  let fontSize = Math.round(W * 0.042);
  ctx.font = `italic ${fontSize}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = "center";

  const maxTextWidth = W - pad * 3.2;
  let lines = wrapText(ctx, quote, maxTextWidth);
  const maxLines = format === "story" ? 16 : 12;
  while (lines.length > maxLines && fontSize > Math.round(W * 0.026)) {
    fontSize -= 2;
    ctx.font = `italic ${fontSize}px Georgia, 'Times New Roman', serif`;
    lines = wrapText(ctx, quote, maxTextWidth);
  }

  const lineHeight = fontSize * 1.45;
  const blockHeight = lines.length * lineHeight;
  let y = Math.max(H * 0.22, (H - blockHeight) / 2 - H * 0.03);

  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  // Reference
  y += Math.round(H * 0.03);
  ctx.fillStyle = "#d4b86a";
  ctx.font = `600 ${Math.round(W * 0.03)}px Georgia, 'Times New Roman', serif`;
  const refLine = verse.translation
    ? `${verse.reference.trim()} · ${verse.translation.trim()}`
    : verse.reference.trim();
  ctx.fillText(refLine, W / 2, y);

  // Footer
  ctx.fillStyle = "rgba(247, 243, 235, 0.45)";
  ctx.font = `400 ${Math.round(W * 0.02)}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("Prayer that points to Scripture", W / 2, H - Math.round(H * 0.055));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export verse card"));
      },
      "image/png",
      0.95
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function safeFilename(
  reference: string,
  format: VerseCardFormat = "story"
): string {
  const base = reference
    .trim()
    .replace(/[^\w\s.-]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  return `praynote-${format}-${base || "verse"}.png`;
}
