/**
 * Generates crisp PrayNote PWA icons (gold-border rounded square + cream cross).
 * Full-bleed canvas — no transparent outer padding (OS masks cleanly).
 * Run: npm run pwa:icons
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

/**
 * Full-bleed logo: navy canvas, gold-ring rounded tile, cream cross, gold tip.
 * Drawn at `size` so every resolution is sharp (not upscaled from 69px).
 */
function logoSvg(size, { maskable = false } = {}) {
  // maskable: keep mark in ~80% safe zone
  const pad = maskable ? size * 0.12 : size * 0.08;
  const box = size - pad * 2;
  const rx = box * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = Math.max(box * 0.11, 4);
  const armW = box * 0.42;
  const armH = box * 0.52;
  const ring = Math.max(size * 0.03, 2);
  const tipR = Math.max(size * 0.032, 2);
  // Cross slightly above center (classic Christian cross proportions)
  const crossCy = cy - box * 0.02;
  const barY = crossCy - armH * 0.18;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <rect x="${pad}" y="${pad}" width="${box}" height="${box}" rx="${rx}"
        fill="${NAVY}" stroke="${GOLD}" stroke-width="${ring}"/>
  <g stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none">
    <line x1="${cx}" y1="${crossCy - armH / 2}" x2="${cx}" y2="${crossCy + armH / 2}"/>
    <line x1="${cx - armW / 2}" y1="${barY}" x2="${cx + armW / 2}" y2="${barY}"/>
  </g>
  <circle cx="${cx}" cy="${crossCy - armH / 2}" r="${tipR}" fill="${GOLD}"/>
</svg>`;
}

async function writePng(filePath, size, opts = {}) {
  const svg = Buffer.from(logoSvg(size, opts));
  await sharp(svg).png({ compressionLevel: 9 }).toFile(filePath);
  console.log("wrote", path.relative(root, filePath));
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Master source (high-res) for future reference
  await writePng(path.join(outDir, "_source-logo.png"), 512);

  for (const size of SIZES) {
    await writePng(path.join(outDir, `icon-${size}.png`), size);
  }

  for (const size of [192, 512]) {
    await writePng(path.join(outDir, `maskable-${size}.png`), size, {
      maskable: true,
    });
  }

  await writePng(path.join(outDir, "apple-touch-icon.png"), 180);
  await writePng(path.join(publicDir, "favicon-32.png"), 32);
  await writePng(path.join(publicDir, "favicon-16.png"), 16);
  await writePng(path.join(publicDir, "icon-512.png"), 512);

  // SVG masters
  await writeFile(path.join(outDir, "icon.svg"), logoSvg(512), "utf8");
  await writeFile(path.join(outDir, "icon-512.svg"), logoSvg(512), "utf8");
  await writeFile(path.join(outDir, "icon-192.svg"), logoSvg(192), "utf8");

  // Multi-size favicon.ico
  const p16 = await sharp(Buffer.from(logoSvg(16))).png().toBuffer();
  const p32 = await sharp(Buffer.from(logoSvg(32))).png().toBuffer();
  const ico = pngsToIco([
    { size: 16, data: p16 },
    { size: 32, data: p32 },
  ]);
  await writeFile(path.join(root, "app", "favicon.ico"), ico);
  console.log("wrote app/favicon.ico");

  console.log("PWA icons generated (crisp full-bleed gold-border mark).");
}

/** Minimal PNG-in-ICO writer */
function pngsToIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + 16 * count;
  const dirs = [];
  const bodies = [];
  for (const img of images) {
    const dir = Buffer.alloc(16);
    const s = img.size >= 256 ? 0 : img.size;
    dir.writeUInt8(s, 0);
    dir.writeUInt8(s, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(img.data.length, 8);
    dir.writeUInt32LE(offset, 12);
    offset += img.data.length;
    dirs.push(dir);
    bodies.push(img.data);
  }
  return Buffer.concat([header, ...dirs, ...bodies]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
