"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, MessageCircle, Share2 } from "lucide-react";
import type { CuratedVerse } from "@/lib/content/verses-by-topic";
import { captureError, trackEvent } from "@/lib/analytics";
import { BRAND } from "@/lib/brand";
import {
  WALLPAPER_FORMATS,
  WALLPAPER_THEMES,
  WALLPAPER_TYPOGRAPHY,
  buildWallpaperShareText,
  drawVerseWallpaperPreview,
  renderVerseWallpaperPng,
  safeWallpaperFilename,
  type TypographyId,
  type WallpaperFormat,
  type WallpaperOptions,
  type WallpaperTextAlign,
  type WallpaperTextTone,
  type WallpaperThemeId,
} from "@/lib/share/verse-wallpaper";
import { downloadBlob, whatsappShareUrl } from "@/lib/share/verse-card";

const TOOL_ID = "bible-verse-wallpaper";
const TOOL_PATH = "/tools/bible-verse-wallpaper";

type Props = {
  verses: readonly CuratedVerse[];
};

type BusyAction = "download" | "share" | null;

export function BibleVerseWallpaperMaker({ verses }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const [verseIndex, setVerseIndex] = useState(0);
  const [format, setFormat] = useState<WallpaperFormat>("story");
  const [themeId, setThemeId] = useState<WallpaperThemeId>("midnight-gold");
  const [typographyId, setTypographyId] = useState<TypographyId>("classic");
  const [overlay, setOverlay] = useState(28);
  const [textTone, setTextTone] = useState<WallpaperTextTone>("light");
  const [textAlign, setTextAlign] = useState<WallpaperTextAlign>("center");
  const [fontScale, setFontScale] = useState(100);
  const [verticalPosition, setVerticalPosition] = useState(50);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verse = verses[verseIndex] ?? verses[0];

  const payload = useMemo(
    () => ({
      reference: verse.reference,
      verseText: verse.text,
      translation: verse.translation,
    }),
    [verse]
  );
  const options = useMemo<WallpaperOptions>(
    () => ({
      format,
      themeId,
      typographyId,
      overlay,
      textTone,
      textAlign,
      fontScale: fontScale / 100,
      verticalPosition,
    }),
    [
      format,
      themeId,
      typographyId,
      overlay,
      textTone,
      textAlign,
      fontScale,
      verticalPosition,
    ]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      drawVerseWallpaperPreview(canvas, payload, options);
    } catch (caught) {
      captureError(caught, "verse-wallpaper-preview");
    }
  }, [payload, options]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("tool_start", { tool_id: TOOL_ID });
  }

  function markComplete() {
    if (completedRef.current) return;
    completedRef.current = true;
    trackEvent("tool_complete", { tool_id: TOOL_ID });
  }

  function changeTheme(nextThemeId: WallpaperThemeId) {
    markStarted();
    const theme = WALLPAPER_THEMES.find((item) => item.id === nextThemeId);
    setThemeId(nextThemeId);
    if (theme) setTextTone(theme.defaultTextTone);
    setStatus(null);
  }

  async function downloadWallpaper() {
    markStarted();
    setBusy("download");
    setError(null);
    setStatus(null);
    try {
      const blob = await renderVerseWallpaperPng(payload, options);
      downloadBlob(blob, safeWallpaperFilename(verse.reference, format));
      markComplete();
      trackEvent("result_download", {
        tool_id: TOOL_ID,
        reference: verse.reference,
        format,
        theme_id: themeId,
      });
      setStatus("PNG created. Check your browser downloads or photo save prompt.");
    } catch (caught) {
      captureError(caught, "verse-wallpaper-download");
      setError("The wallpaper could not be created. Try a smaller text size.");
    } finally {
      setBusy(null);
    }
  }

  async function shareWallpaper() {
    markStarted();
    setBusy("share");
    setError(null);
    setStatus(null);
    const toolUrl = `${BRAND.siteUrl}${TOOL_PATH}`;
    try {
      const blob = await renderVerseWallpaperPng(payload, options);
      const file = new File(
        [blob],
        safeWallpaperFilename(verse.reference, format),
        { type: "image/png" }
      );
      const text = buildWallpaperShareText(payload, toolUrl);
      let method = "copy";

      if (navigator.share) {
        const shareData: ShareData = {
          title: `${verse.reference} Bible wallpaper`,
          text,
          url: toolUrl,
        };
        if (navigator.canShare?.({ files: [file] })) {
          shareData.files = [file];
          method = "native_file";
        } else {
          method = "native_text";
        }
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        setStatus("Share text copied. Download the PNG to attach the image.");
      }

      markComplete();
      trackEvent("result_share", {
        tool_id: TOOL_ID,
        reference: verse.reference,
        format,
        theme_id: themeId,
        share_method: method,
      });
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") return;
      captureError(caught, "verse-wallpaper-share");
      setError("Sharing is not available. Download the PNG or use WhatsApp.");
    } finally {
      setBusy(null);
    }
  }

  function shareOnWhatsApp() {
    markStarted();
    const text = buildWallpaperShareText(
      payload,
      `${BRAND.siteUrl}${TOOL_PATH}`
    );
    window.open(whatsappShareUrl(text), "_blank", "noopener,noreferrer");
    markComplete();
    trackEvent("result_share", {
      tool_id: TOOL_ID,
      reference: verse.reference,
      format,
      theme_id: themeId,
      share_method: "whatsapp_text",
    });
  }

  const longVerseWarning = verse.text.length > 260 && format === "square";

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)] lg:items-start">
        <div className="space-y-6">
          <label className="block">
            <span className="text-xs font-semibold tracking-wider text-[oklch(0.5_0.06_85)] uppercase">
              1. Choose a verse
            </span>
            <select
              value={verseIndex}
              onChange={(event) => {
                markStarted();
                setVerseIndex(Number(event.target.value));
                setStatus(null);
              }}
              className="mt-2 min-h-11 w-full rounded-xl border border-[oklch(0.82_0.04_85)] bg-white px-3 py-2 text-sm text-[oklch(0.28_0.04_255)] outline-none focus:border-[oklch(0.55_0.1_85)] focus:ring-2 focus:ring-[oklch(0.72_0.1_85/0.25)]"
            >
              {verses.map((item, index) => (
                <option key={item.reference} value={index}>
                  {item.reference}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-xs font-semibold tracking-wider text-[oklch(0.5_0.06_85)] uppercase">
              2. Choose a background
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {WALLPAPER_THEMES.map((theme) => {
                const selected = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => changeTheme(theme.id)}
                    className={`flex min-h-16 items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-[oklch(0.55_0.1_85)] bg-[oklch(0.97_0.025_85)] shadow-sm"
                        : "border-[oklch(0.86_0.025_85)] bg-white/75 hover:border-[oklch(0.7_0.08_85)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="size-10 shrink-0 rounded-lg border border-white/50 shadow-inner"
                      style={{ background: theme.preview }}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[oklch(0.28_0.04_255)]">
                        {theme.label}
                      </span>
                      <span className="block text-[11px] text-[oklch(0.48_0.03_255)]">
                        {theme.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold tracking-wider text-[oklch(0.5_0.06_85)] uppercase">
              3. Choose an image size
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {WALLPAPER_FORMATS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === format}
                  onClick={() => {
                    markStarted();
                    setFormat(item.id);
                    setStatus(null);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    item.id === format
                      ? "border-[oklch(0.55_0.1_85)] bg-[oklch(0.97_0.025_85)]"
                      : "border-[oklch(0.86_0.025_85)] bg-white/75 hover:border-[oklch(0.7_0.08_85)]"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[oklch(0.28_0.04_255)]">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-[oklch(0.48_0.03_255)]">
                    {item.use}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold tracking-wider text-[oklch(0.5_0.06_85)] uppercase">
              4. Style the text
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {WALLPAPER_TYPOGRAPHY.map((typography) => (
                <button
                  key={typography.id}
                  type="button"
                  aria-pressed={typography.id === typographyId}
                  onClick={() => {
                    markStarted();
                    setTypographyId(typography.id);
                  }}
                  className={`min-h-12 rounded-xl border p-2 text-center transition ${
                    typography.id === typographyId
                      ? "border-[oklch(0.55_0.1_85)] bg-[oklch(0.97_0.025_85)]"
                      : "border-[oklch(0.86_0.025_85)] bg-white/75"
                  }`}
                >
                  <span className="block text-sm font-semibold">{typography.label}</span>
                  <span className="hidden text-[10px] text-[oklch(0.48_0.03_255)] sm:block">
                    {typography.description}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-[oklch(0.38_0.04_255)]">
                Text size · {fontScale}%
                <input
                  type="range"
                  min="85"
                  max="115"
                  step="5"
                  value={fontScale}
                  onChange={(event) => {
                    markStarted();
                    setFontScale(Number(event.target.value));
                  }}
                  className="mt-2 w-full accent-[oklch(0.45_0.09_85)]"
                />
              </label>
              <label className="block text-xs font-medium text-[oklch(0.38_0.04_255)]">
                Vertical position · {verticalPosition}%
                <input
                  type="range"
                  min="35"
                  max="65"
                  step="5"
                  value={verticalPosition}
                  onChange={(event) => {
                    markStarted();
                    setVerticalPosition(Number(event.target.value));
                  }}
                  className="mt-2 w-full accent-[oklch(0.45_0.09_85)]"
                />
              </label>
              <label className="block text-xs font-medium text-[oklch(0.38_0.04_255)]">
                Background overlay · {overlay}%
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={overlay}
                  onChange={(event) => {
                    markStarted();
                    setOverlay(Number(event.target.value));
                  }}
                  className="mt-2 w-full accent-[oklch(0.45_0.09_85)]"
                />
              </label>
              <div className="flex flex-wrap items-end gap-2">
                {(["light", "dark"] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    aria-pressed={textTone === tone}
                    onClick={() => {
                      markStarted();
                      setTextTone(tone as WallpaperTextTone);
                    }}
                    className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium capitalize ${
                      textTone === tone
                        ? "border-[oklch(0.55_0.1_85)] bg-[oklch(0.28_0.05_255)] text-white"
                        : "border-[oklch(0.82_0.04_85)] bg-white"
                    }`}
                  >
                    {tone} text
                  </button>
                ))}
                {(["center", "left"] as const).map((alignment) => (
                  <button
                    key={alignment}
                    type="button"
                    aria-pressed={textAlign === alignment}
                    onClick={() => {
                      markStarted();
                      setTextAlign(alignment as WallpaperTextAlign);
                    }}
                    className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium capitalize ${
                      textAlign === alignment
                        ? "border-[oklch(0.55_0.1_85)] bg-[oklch(0.28_0.05_255)] text-white"
                        : "border-[oklch(0.82_0.04_85)] bg-white"
                    }`}
                  >
                    {alignment}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        </div>
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl border border-[oklch(0.84_0.04_85)] bg-[oklch(0.95_0.015_85)] p-3 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[oklch(0.5_0.06_85)] uppercase">
                  Live preview
                </p>
                <p className="mt-0.5 text-[11px] text-[oklch(0.48_0.03_255)]">
                  Full-resolution PNG is created on export.
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[oklch(0.42_0.04_255)]">
                {format}
              </span>
            </div>
            <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-xl bg-[oklch(0.2_0.02_255)] p-2">
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Preview of ${verse.reference} Bible verse wallpaper`}
                className="max-h-[68vh] max-w-full rounded-lg shadow-2xl"
              />
            </div>

            {longVerseWarning ? (
              <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-900">
                This is a long passage for a square post. The maker will reduce
                the font size; Story or wallpaper format will be easier to read.
              </p>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <button
                type="button"
                onClick={() => void downloadWallpaper()}
                disabled={busy !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[oklch(0.28_0.05_255)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[oklch(0.34_0.05_255)] disabled:opacity-60"
              >
                {busy === "download" ? (
                  "Creating…"
                ) : (
                  <>
                    <Download className="size-4" /> Download PNG
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void shareWallpaper()}
                disabled={busy !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[oklch(0.65_0.08_85/0.6)] bg-white px-4 py-2.5 text-sm font-medium text-[oklch(0.3_0.05_255)] transition hover:bg-[oklch(0.98_0.01_85)] disabled:opacity-60"
              >
                {busy === "share" ? (
                  "Preparing…"
                ) : (
                  <>
                    <Share2 className="size-4" /> Share
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={shareOnWhatsApp}
                disabled={busy !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-emerald-700/30 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60 sm:col-span-2 lg:col-span-1 xl:col-span-2"
              >
                <MessageCircle className="size-4" /> Share text on WhatsApp
              </button>
            </div>

            {status ? (
              <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-emerald-800" role="status">
                <Check className="mt-0.5 size-3.5 shrink-0" />
                {status}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-xs font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-[oklch(0.5_0.03_255)]">
            Generated entirely in your browser. No design or verse selection is
            uploaded to an image API.
          </p>
        </aside>
      </div>
    </div>
  );
}
