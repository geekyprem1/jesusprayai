/**
 * Generates PrayNote PWA icons.
 *
 * Android / many launchers mask icons to a CIRCLE. A square gold ring near
 * the canvas edge gets sliced into broken arcs. So the gold-border tile is
 * always drawn inside the circle safe-zone (center ~66–70%) with navy fill
 * outside — full ring stays visible after circular crop.
 *
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
 * @param {number} size
 * @param {{ mode?: "any" | "maskable" | "apple" }} opts
 *
 * pad fractions of canvas:
 *  - any/maskable: ≥0.17 so full rounded square fits inside a circular mask
 *  - apple: slightly tighter (iOS uses rounded square, not hard circle)
 */
function logoSvg(size, { mode = "any" } = {}) {
  // Circle inscribed square ≈ 0.707 of diameter → leave margin so ring isn't clipped
  const padRatio = mode === "apple" ? 0.1 : mode === "maskable" ? 0.2 : 0.17;
  const pad = size * padRatio;
  const box = size - pad * 2;
  const rx = box * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = Math.max(box * 0.11, 3);
  const armW = box * 0.42;
  const armH = box * 0.52;
  // Ring sits fully inside the tile (stroke centered on rect edge)
  const ring = Math.max(box * 0.055, 2.5);
  const tipR = Math.max(box * 0.04, 2);
  const crossCy = cy - box * 0.02;
  const barY = crossCy - armH * 0.18;
  // Inset ring rect so stroke isn't half-clipped by tile edge
  const ringInset = ring / 2;
  const tileX = pad + ringInset;
  const tileY = pad + ringInset;
  const tileBox = box - ring;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Full navy fill survives circular OS masks -->
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <!-- Gold-border rounded tile — fully inside circle safe zone -->
  <rect x="${tileX}" y="${tileY}" width="${tileBox}" height="${tileBox}" rx="${rx}"
        fill="${NAVY}" stroke="${GOLD}" stroke-width="${ring}"/>
  <g stroke="${CREAM}" stroke-width="${stroke}" stroke-linecap="round" fill="none">
    <line x1="${cx}" y1="${crossCy - armH / 2}" x2="${cx}" y2="${crossCy + armH / 2}"/>
    <line x1="${cx - armW / 2}" y1="${barY}" x2="${cx + armW / 2}" y2="${barY}"/>
  </g>
  <circle cx="${cx}" cy="${crossCy - armH / 2}" r="${tipR}" fill="${GOLD}"/>
</svg>`;
}

async function writePng(filePath, size, mode = "any") {
  const svg = Buffer.from(logoSvg(size, { mode }));
  await sharp(svg).png({ compressionLevel: 9 }).toFile(filePath);
  console.log("wrote", path.relative(root, filePath));
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await writePng(path.join(outDir, "_source-logo.png"), 512, "any");

  for (const size of SIZES) {
    await writePng(path.join(outDir, `icon-${size}.png`), size, "any");
  }

  for (const size of [192, 512]) {
    await writePng(path.join(outDir, `maskable-${size}.png`), size, "maskable");
  }

  await writePng(path.join(outDir, "apple-touch-icon.png"), 180, "apple");
  await writePng(path.join(publicDir, "favicon-32.png"), 32, "any");
  await writePng(path.join(publicDir, "favicon-16.png"), 16, "any");
  await writePng(path.join(publicDir, "icon-512.png"), 512, "any");

  await writeFile(path.join(outDir, "icon.svg"), logoSvg(512, { mode: "any" }), "utf8");
  await writeFile(path.join(outDir, "icon-512.svg"), logoSvg(512, { mode: "any" }), "utf8");
  await writeFile(path.join(outDir, "icon-192.svg"), logoSvg(192, { mode: "any" }), "utf8");

  const p16 = await sharp(Buffer.from(logoSvg(16, { mode: "any" }))).png().toBuffer();
  const p32 = await sharp(Buffer.from(logoSvg(32, { mode: "any" }))).png().toBuffer();
  await writeFile(path.join(root, "app", "favicon.ico"), pngsToIco([
    { size: 16, data: p16 },
    { size: 32, data: p32 },
  ]));
  console.log("wrote app/favicon.ico");

  console.log("PWA icons generated (circle-safe gold ring).");
}

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
