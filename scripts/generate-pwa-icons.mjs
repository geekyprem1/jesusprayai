/**
 * Generates PrayNote PWA PNG icons from brand colors.
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

/** SVG mark: rounded square + cross (matches CrossMark brand) */
function logoSvg(size, { maskable = false } = {}) {
  // Maskable: keep logo in ~80% safe zone with solid background
  const pad = maskable ? size * 0.12 : size * 0.08;
  const inner = size - pad * 2;
  const rx = size * (maskable ? 0.18 : 0.22);
  const cx = size / 2;
  const cy = size / 2;
  const stroke = Math.max(3, size * 0.07);
  const armW = inner * 0.42;
  const armH = inner * 0.55;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <rect x="${pad * 0.35}" y="${pad * 0.35}" width="${size - pad * 0.7}" height="${size - pad * 0.7}" rx="${rx}" fill="${NAVY}" stroke="${GOLD}" stroke-width="${Math.max(1, size * 0.015)}" opacity="0.9"/>
  <g stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none">
    <line x1="${cx}" y1="${cy - armH / 2}" x2="${cx}" y2="${cy + armH / 2}"/>
    <line x1="${cx - armW / 2}" y1="${cy - armH * 0.12}" x2="${cx + armW / 2}" y2="${cy - armH * 0.12}"/>
  </g>
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

  // Maskable (safe zone) — 192 & 512 required by most audits
  for (const size of [192, 512]) {
    await writePng(path.join(outDir, `maskable-${size}.png`), size, {
      maskable: true,
    });
  }

  // Apple touch (180 is standard; 152 also listed)
  await writePng(path.join(outDir, "apple-touch-icon.png"), 180);
  await writePng(path.join(outDir, "icon-152.png"), 152);

  // Favicon 32 + 16 multi via 32 png copied as favicon.png
  await writePng(path.join(publicDir, "favicon-32.png"), 32);
  await writePng(path.join(publicDir, "favicon-16.png"), 16);
  await writePng(path.join(publicDir, "icon-512.png"), 512);

  // Also write a simple SVG source for reference
  await writeFile(
    path.join(outDir, "icon.svg"),
    logoSvg(512),
    "utf8"
  );

  console.log("PWA icons generated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
