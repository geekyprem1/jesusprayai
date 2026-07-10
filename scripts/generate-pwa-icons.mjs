/**
 * Generates PrayNote PWA PNG icons from the source logo.
 * Source: public/icons/_source-logo.png (or SOURCE_LOGO env path)
 * Run: npm run pwa:icons
 */
import sharp from "sharp";
import { mkdir, access, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");
const publicDir = path.join(root, "public");

const NAVY = { r: 16, g: 35, b: 63, alpha: 1 }; // #10233F
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const defaultSource = path.join(outDir, "_source-logo.png");
const sourcePath = process.env.SOURCE_LOGO
  ? path.resolve(process.env.SOURCE_LOGO)
  : defaultSource;

async function ensureSource() {
  try {
    await access(sourcePath);
  } catch {
    throw new Error(
      `Source logo not found: ${sourcePath}\nPlace logo at public/icons/_source-logo.png or set SOURCE_LOGO=...`,
    );
  }
}

/** Resize source to exact square PNG (any purpose icons). */
async function writeIcon(filePath, size) {
  await sharp(sourcePath)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toFile(filePath);
  console.log("wrote", path.relative(root, filePath));
}

/**
 * Maskable: keep ~20% safe zone so OS masks don't clip the mark.
 * Scale logo to 80% of canvas, center on navy.
 */
async function writeMaskable(filePath, size) {
  const inner = Math.round(size * 0.8);
  const logo = await sharp(sourcePath)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: NAVY,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(filePath);
  console.log("wrote", path.relative(root, filePath));
}

function svgFromPngBase64(size, b64) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <image width="${size}" height="${size}" xlink:href="data:image/png;base64,${b64}"/>
</svg>`;
}

async function main() {
  await ensureSource();
  await mkdir(outDir, { recursive: true });

  for (const size of SIZES) {
    await writeIcon(path.join(outDir, `icon-${size}.png`), size);
  }

  for (const size of [192, 512]) {
    await writeMaskable(path.join(outDir, `maskable-${size}.png`), size);
  }

  await writeIcon(path.join(outDir, "apple-touch-icon.png"), 180);
  await writeIcon(path.join(publicDir, "favicon-32.png"), 32);
  await writeIcon(path.join(publicDir, "favicon-16.png"), 16);
  await writeIcon(path.join(publicDir, "icon-512.png"), 512);

  // SVG wrappers (data-URI) for mask-icon / fallbacks
  const png512 = await sharp(sourcePath)
    .resize(512, 512, { fit: "cover", kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  const png192 = await sharp(sourcePath)
    .resize(192, 192, { fit: "cover", kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  await writeFile(
    path.join(outDir, "icon.svg"),
    svgFromPngBase64(512, png512.toString("base64")),
    "utf8",
  );
  await writeFile(
    path.join(outDir, "icon-512.svg"),
    svgFromPngBase64(512, png512.toString("base64")),
    "utf8",
  );
  await writeFile(
    path.join(outDir, "icon-192.svg"),
    svgFromPngBase64(192, png192.toString("base64")),
    "utf8",
  );
  console.log("wrote", path.relative(root, path.join(outDir, "icon.svg")));

  console.log("PWA icons generated from", path.relative(root, sourcePath));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
