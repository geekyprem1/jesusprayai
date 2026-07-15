import { BRAND } from "@/lib/brand";
import type { VerseSharePayload, VerseCardFormat } from "@/lib/share/verse-card";
import { getVerseCardDimensions } from "@/lib/share/verse-card";

export type WallpaperFormat = Extract<
  VerseCardFormat,
  "square" | "story" | "pin" | "wallpaper"
>;
export type WallpaperThemeId =
  | "midnight-gold"
  | "dawn-glow"
  | "still-waters"
  | "warm-parchment";
export type TypographyId = "classic" | "modern" | "bold";
export type WallpaperTextTone = "light" | "dark";
export type WallpaperTextAlign = "left" | "center";

export type WallpaperOptions = {
  format: WallpaperFormat;
  themeId: WallpaperThemeId;
  typographyId: TypographyId;
  overlay: number;
  textTone: WallpaperTextTone;
  textAlign: WallpaperTextAlign;
  fontScale: number;
  verticalPosition: number;
};

export const WALLPAPER_FORMATS: readonly {
  id: WallpaperFormat;
  label: string;
  use: string;
}[] = [
  { id: "square", label: "Square · 1080×1080", use: "Instagram & Facebook" },
  { id: "story", label: "Story · 1080×1920", use: "Stories & WhatsApp Status" },
  { id: "pin", label: "Pinterest · 1000×1500", use: "Pinterest pins" },
  { id: "wallpaper", label: "Wallpaper · 1440×2560", use: "Phone lock screen" },
];

export const WALLPAPER_THEMES: readonly {
  id: WallpaperThemeId;
  label: string;
  description: string;
  preview: string;
  defaultTextTone: WallpaperTextTone;
}[] = [
  {
    id: "midnight-gold",
    label: "Midnight Gold",
    description: "Deep navy with a warm gold glow",
    preview: "linear-gradient(145deg, #14243d, #2d4160 62%, #162a45)",
    defaultTextTone: "light",
  },
  {
    id: "dawn-glow",
    label: "Dawn Glow",
    description: "Soft sunrise coral and lavender",
    preview: "linear-gradient(155deg, #6f668e, #d88c7d 56%, #f0c886)",
    defaultTextTone: "light",
  },
  {
    id: "still-waters",
    label: "Still Waters",
    description: "Calm teal with flowing water lines",
    preview: "linear-gradient(160deg, #0e4650, #287581 58%, #79a9a2)",
    defaultTextTone: "light",
  },
  {
    id: "warm-parchment",
    label: "Warm Parchment",
    description: "Quiet cream and antique gold",
    preview: "linear-gradient(145deg, #f2e5c9, #d9bd87 62%, #efe2c6)",
    defaultTextTone: "dark",
  },
];

export const WALLPAPER_TYPOGRAPHY: readonly {
  id: TypographyId;
  label: string;
  description: string;
  family: string;
  style: "normal" | "italic";
  weight: number;
  lineHeight: number;
}[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Graceful serif italic",
    family: "Georgia, 'Times New Roman', serif",
    style: "italic",
    weight: 500,
    lineHeight: 1.42,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Clean and simple",
    family: "Arial, Helvetica, sans-serif",
    style: "normal",
    weight: 500,
    lineHeight: 1.36,
  },
  {
    id: "bold",
    label: "Bold",
    description: "Strong serif statement",
    family: "Georgia, 'Times New Roman', serif",
    style: "normal",
    weight: 700,
    lineHeight: 1.3,
  },
];

function getTheme(id: WallpaperThemeId) {
  return WALLPAPER_THEMES.find((theme) => theme.id === id) ?? WALLPAPER_THEMES[0];
}

function getTypography(id: TypographyId) {
  return (
    WALLPAPER_TYPOGRAPHY.find((typography) => typography.id === id) ??
    WALLPAPER_TYPOGRAPHY[0]
  );
}

function drawTheme(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  themeId: WallpaperThemeId
) {
  if (themeId === "midnight-gold") {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#14243d");
    gradient.addColorStop(0.58, "#2d4160");
    gradient.addColorStop(1, "#162a45");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
      width * 0.72,
      height * 0.12,
      10,
      width * 0.72,
      height * 0.12,
      Math.max(width, height) * 0.55
    );
    glow.addColorStop(0, "rgba(238, 207, 126, 0.38)");
    glow.addColorStop(1, "rgba(238, 207, 126, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(248, 226, 163, 0.32)";
    for (let index = 0; index < 26; index += 1) {
      const x = ((index * 83 + 41) % 997) / 997 * width;
      const y = ((index * 137 + 29) % 991) / 991 * height * 0.65;
      const radius = Math.max(1, width * (0.0012 + (index % 3) * 0.0005));
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (themeId === "dawn-glow") {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#655f88");
    gradient.addColorStop(0.48, "#c67f7a");
    gradient.addColorStop(1, "#efc67f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const sun = ctx.createRadialGradient(
      width * 0.25,
      height * 0.72,
      0,
      width * 0.25,
      height * 0.72,
      width * 0.58
    );
    sun.addColorStop(0, "rgba(255, 226, 165, 0.68)");
    sun.addColorStop(1, "rgba(255, 226, 165, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, height * 0.3, width, height * 0.7);

    ctx.fillStyle = "rgba(61, 58, 94, 0.28)";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.84);
    ctx.quadraticCurveTo(width * 0.28, height * 0.69, width * 0.56, height * 0.84);
    ctx.quadraticCurveTo(width * 0.78, height * 0.94, width, height * 0.78);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (themeId === "still-waters") {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0d424d");
    gradient.addColorStop(0.55, "#226b78");
    gradient.addColorStop(1, "#78a79f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(218, 240, 230, 0.18)";
    ctx.lineWidth = Math.max(1, width * 0.002);
    for (let row = 0; row < 9; row += 1) {
      const y = height * (0.58 + row * 0.045);
      ctx.beginPath();
      ctx.moveTo(-width * 0.1, y);
      ctx.bezierCurveTo(
        width * 0.2,
        y - height * 0.025,
        width * 0.42,
        y + height * 0.025,
        width * 0.72,
        y
      );
      ctx.bezierCurveTo(
        width * 0.88,
        y - height * 0.018,
        width * 1.02,
        y + height * 0.012,
        width * 1.1,
        y
      );
      ctx.stroke();
    }
    return;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f3e7ce");
  gradient.addColorStop(0.55, "#ddc18c");
  gradient.addColorStop(1, "#f0e3c8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(112, 78, 34, 0.14)";
  ctx.lineWidth = Math.max(1, width * 0.002);
  for (let index = 0; index < 7; index += 1) {
    const inset = width * (0.06 + index * 0.025);
    ctx.beginPath();
    ctx.arc(width * 0.9, height * 0.12, inset, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function fontString(
  size: number,
  typography: (typeof WALLPAPER_TYPOGRAPHY)[number]
): string {
  return `${typography.style} ${typography.weight} ${Math.round(size)}px ${typography.family}`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitVerseText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  minSize: number,
  maxSize: number,
  typography: (typeof WALLPAPER_TYPOGRAPHY)[number]
) {
  let low = minSize;
  let high = Math.max(minSize, maxSize);
  let bestSize = minSize;
  let bestLines: string[] = [];

  for (let pass = 0; pass < 12; pass += 1) {
    const size = (low + high) / 2;
    ctx.font = fontString(size, typography);
    const lines = wrapText(ctx, text, maxWidth);
    const height = lines.length * size * typography.lineHeight;
    if (height <= maxHeight) {
      bestSize = size;
      bestLines = lines;
      low = size;
    } else {
      high = size;
    }
  }

  if (bestLines.length === 0) {
    ctx.font = fontString(minSize, typography);
    bestLines = wrapText(ctx, text, maxWidth);
  }

  return {
    fontSize: bestSize,
    lines: bestLines,
    constrained:
      bestLines.length * bestSize * typography.lineHeight > maxHeight + 1,
  };
}

export type WallpaperRenderInfo = {
  width: number;
  height: number;
  fontSize: number;
  constrained: boolean;
};

export function drawVerseWallpaper(
  canvas: HTMLCanvasElement,
  verse: VerseSharePayload,
  options: WallpaperOptions,
  width: number,
  height: number
): WallpaperRenderInfo {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  const theme = getTheme(options.themeId);
  const typography = getTypography(options.typographyId);
  drawTheme(ctx, width, height, theme.id);

  const overlayAmount = Math.min(70, Math.max(0, options.overlay)) / 100;
  ctx.fillStyle =
    options.textTone === "light"
      ? `rgba(5, 14, 28, ${overlayAmount * 0.82})`
      : `rgba(255, 249, 235, ${overlayAmount * 0.78})`;
  ctx.fillRect(0, 0, width, height);

  const isLightText = options.textTone === "light";
  const primary = isLightText ? "#fffaf0" : "#252b35";
  const accent = isLightText ? "#efd58a" : "#795a27";
  const muted = isLightText
    ? "rgba(255, 250, 240, 0.66)"
    : "rgba(37, 43, 53, 0.65)";

  const frameInset = width * 0.045;
  ctx.strokeStyle = isLightText
    ? "rgba(239, 213, 138, 0.45)"
    : "rgba(121, 90, 39, 0.35)";
  ctx.lineWidth = Math.max(1.5, width * 0.0025);
  ctx.strokeRect(
    frameInset,
    frameInset,
    width - frameInset * 2,
    height - frameInset * 2
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.round(width * 0.023)}px Arial, Helvetica, sans-serif`;
  ctx.fillText("PRAYNOTE", width / 2, height * 0.075);

  ctx.fillStyle = muted;
  ctx.font = `400 ${Math.round(width * 0.016)}px Arial, Helvetica, sans-serif`;
  ctx.fillText("Scripture for your screen", width / 2, height * 0.098);

  const horizontalPadding = width * 0.11;
  const maxTextWidth = width - horizontalPadding * 2;
  const contentTop = height * 0.17;
  const contentBottom = height * 0.82;
  const referenceSize = Math.max(18, width * 0.028);
  const referenceGap = Math.max(18, height * 0.022);
  const quoteSpace = contentBottom - contentTop - referenceSize - referenceGap;
  const minFontSize = Math.max(20, width * 0.024);
  const maxFontSize = width * 0.058 * Math.min(1.15, Math.max(0.85, options.fontScale));
  const fitted = fitVerseText(
    ctx,
    `“${verse.verseText.trim()}”`,
    maxTextWidth,
    quoteSpace,
    minFontSize,
    maxFontSize,
    typography
  );

  const quoteHeight = fitted.lines.length * fitted.fontSize * typography.lineHeight;
  const groupHeight = quoteHeight + referenceGap + referenceSize;
  const placementRoom = Math.max(0, contentBottom - contentTop - groupHeight);
  const normalizedPosition =
    (Math.min(65, Math.max(35, options.verticalPosition)) - 35) / 30;
  let y = contentTop + placementRoom * normalizedPosition + fitted.fontSize;

  ctx.fillStyle = primary;
  ctx.font = fontString(fitted.fontSize, typography);
  ctx.textAlign = options.textAlign;
  const textX = options.textAlign === "center" ? width / 2 : horizontalPadding;
  for (const line of fitted.lines) {
    ctx.fillText(line, textX, y);
    y += fitted.fontSize * typography.lineHeight;
  }

  y += referenceGap;
  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.round(referenceSize)}px Georgia, 'Times New Roman', serif`;
  ctx.fillText(
    verse.translation
      ? `${verse.reference} · ${verse.translation}`
      : verse.reference,
    textX,
    y
  );

  ctx.textAlign = "center";
  ctx.fillStyle = muted;
  ctx.font = `400 ${Math.round(width * 0.017)}px Arial, Helvetica, sans-serif`;
  ctx.fillText(BRAND.domain, width / 2, height * 0.94);

  return {
    width,
    height,
    fontSize: fitted.fontSize,
    constrained: fitted.constrained,
  };
}

export function drawVerseWallpaperPreview(
  canvas: HTMLCanvasElement,
  verse: VerseSharePayload,
  options: WallpaperOptions
): WallpaperRenderInfo {
  const dimensions = getVerseCardDimensions(options.format);
  const aspectRatio = dimensions.height / dimensions.width;
  const width = aspectRatio > 1.55 ? 360 : aspectRatio > 1.2 ? 420 : 480;
  const height = Math.round(width * aspectRatio);
  return drawVerseWallpaper(canvas, verse, options, width, height);
}

export async function renderVerseWallpaperPng(
  verse: VerseSharePayload,
  options: WallpaperOptions
): Promise<Blob> {
  const dimensions = getVerseCardDimensions(options.format);
  const canvas = document.createElement("canvas");
  const result = drawVerseWallpaper(
    canvas,
    verse,
    options,
    dimensions.width,
    dimensions.height
  );
  if (result.constrained) {
    throw new Error("This verse does not fit the selected layout.");
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export wallpaper"));
      },
      "image/png",
      0.95
    );
  });
}

export function buildWallpaperShareText(
  verse: VerseSharePayload,
  toolUrl: string
): string {
  return [
    `“${verse.verseText.trim()}”`,
    verse.translation
      ? `— ${verse.reference} (${verse.translation})`
      : `— ${verse.reference}`,
    "",
    "Create a free Bible verse wallpaper:",
    toolUrl,
  ].join("\n");
}

export function safeWallpaperFilename(
  reference: string,
  format: WallpaperFormat
): string {
  const safeReference = reference
    .trim()
    .replace(/[^\w\s.-]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  return `praynote-${format}-${safeReference || "bible-verse"}.png`;
}
