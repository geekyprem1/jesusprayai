/**
 * Generates PrayNote PWA PNG icons — bold cross on navy with gold ring.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");
const publicDir = path.join(root, "public");

const NAVY = "#10233F";
const CREAM = "#F9F5EC";
const GOLD = "#D4B86A";

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/** High-contrast logo for home screen / favicon */
function logoSvg(size, { maskable = false } = {}) {
  const safe = maskable ? 0.18 : 0.08;
  const pad = size * safe;
  const box = size - pad * 2;
  const rx = box * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  // Thick stroke so 72px still reads
  const stroke = Math.max(size * 0.1, 6);
  const armW = box * 0.48;
  const armH = box * 0.58;
  const ring = Math.max(size * 0.028, 2);
  const tipR = Math.max(size * 0.035, 2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <rect x="${pad}" y="${pad}" width="${box}" height="${box}" rx="${rx}"
        fill="${NAVY}" stroke="${GOLD}" stroke-width="${ring}"/>
  <g stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none">
    <line x1="${cx}" y1="${cy - armH / 2}" x2="${cx}" y2="${cy + armH / 2}"/>
    <line x1="${cx - armW / 2}" y1="${cy - armH * 0.14}" x2="${cx + armW / 2}" y2="${cy - armH * 0.14}"/>
  </g>
  <circle cx="${cx}" cy="${cy - armH / 2}" r="${tipR}" fill="${GOLD}"/>
</svg>`;
}

async function writePng(filePath, size, opts) {
  const svg = Buffer.from(logoSvg(size, opts));
  await sharp(svg).png().toFile(filePath);
  console.log("wrote", path.relative(root, filePath));
}

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const size of SIZES) {
    await writePng(path.join(outDir, `icon-${size}.png`), size);
  }

  for (const size of [192, 512]) {
    await writePng(path.join(outDir, `maskable-${size}.png`), size, {
      maskable: true,
    });
  }

  await writePng(path.join(outDir, "apple-touch-icon.png"), 180);
  await writePng(path.join(outDir, "icon-152.png"), 152);
  await writePng(path.join(publicDir, "favicon-32.png"), 32);
  await writePng(path.join(publicDir, "favicon-16.png"), 16);
  await writePng(path.join(publicDir, "icon-512.png"), 512);
  await writeFile(path.join(outDir, "icon.svg"), logoSvg(512), "utf8");

  console.log("PWA icons generated (bold mark).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
