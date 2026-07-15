import type { CharacterProfile } from "@/lib/content/bible-character-quiz";

export type CharacterSharePayload = Pick<
  CharacterProfile,
  "slug" | "name" | "title" | "strengths" | "verse"
>;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export function buildCharacterShareText(
  profile: CharacterSharePayload,
  resultUrl: string
): string {
  return [
    `My Bible Character Quiz result: ${profile.name} — ${profile.title}`,
    `Strengths: ${profile.strengths.slice(0, 3).join(", ")}`,
    "",
    "Which Bible character does your reflection resemble?",
    resultUrl,
  ].join("\n");
}

export function safeCharacterFilename(slug: string): string {
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").slice(0, 40);
  return `praynote-bible-character-${safeSlug || "result"}.png`;
}

export async function renderCharacterResultPng(
  profile: CharacterSharePayload
): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#182944");
  background.addColorStop(0.58, "#243958");
  background.addColorStop(1, "#172b47");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(540, 80, 20, 540, 160, 560);
  glow.addColorStop(0, "rgba(224, 197, 122, 0.30)");
  glow.addColorStop(1, "rgba(224, 197, 122, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 760);

  ctx.strokeStyle = "rgba(224, 197, 122, 0.58)";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.textAlign = "center";
  ctx.fillStyle = "#e0c57a";
  ctx.font = "600 27px Georgia, 'Times New Roman', serif";
  ctx.fillText("PRAYNOTE · BIBLE CHARACTER REFLECTION", width / 2, 128);

  ctx.fillStyle = "rgba(247, 243, 235, 0.72)";
  ctx.font = "400 25px Arial, sans-serif";
  ctx.fillText("My answers resonate with", width / 2, 222);

  ctx.fillStyle = "#f7f3eb";
  ctx.font = "700 92px Georgia, 'Times New Roman', serif";
  ctx.fillText(profile.name, width / 2, 330);

  ctx.fillStyle = "#e0c57a";
  ctx.font = "600 43px Georgia, 'Times New Roman', serif";
  const titleLines = wrapText(ctx, profile.title, 820);
  let y = 398;
  for (const line of titleLines) {
    ctx.fillText(line, width / 2, y);
    y += 54;
  }

  ctx.strokeStyle = "rgba(224, 197, 122, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(390, y + 12);
  ctx.lineTo(690, y + 12);
  ctx.stroke();
  y += 84;

  ctx.fillStyle = "rgba(247, 243, 235, 0.72)";
  ctx.font = "600 24px Arial, sans-serif";
  ctx.fillText("REFLECTED STRENGTHS", width / 2, y);
  y += 52;

  ctx.fillStyle = "#f7f3eb";
  ctx.font = "500 34px Georgia, 'Times New Roman', serif";
  for (const strength of profile.strengths.slice(0, 3)) {
    ctx.fillText(`• ${strength}`, width / 2, y);
    y += 49;
  }

  y += 36;
  ctx.fillStyle = "#e0c57a";
  ctx.font = "600 27px Georgia, 'Times New Roman', serif";
  ctx.fillText(profile.verse.reference, width / 2, y);
  y += 51;

  ctx.fillStyle = "rgba(247, 243, 235, 0.92)";
  ctx.font = "italic 31px Georgia, 'Times New Roman', serif";
  const verseLines = wrapText(ctx, `“${profile.verse.text}”`, 820).slice(0, 6);
  for (const line of verseLines) {
    ctx.fillText(line, width / 2, y);
    y += 43;
  }

  ctx.fillStyle = "rgba(247, 243, 235, 0.62)";
  ctx.font = "400 24px Arial, sans-serif";
  ctx.fillText("A reflection, not a spiritual assessment", width / 2, 1210);
  ctx.fillStyle = "#e0c57a";
  ctx.font = "600 25px Arial, sans-serif";
  ctx.fillText("praynote.app/tools/bible-character-quiz", width / 2, 1260);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export character result card"));
      },
      "image/png",
      0.95
    );
  });
}
