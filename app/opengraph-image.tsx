import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const runtime = "edge";
export const alt = "PrayNote AI — Prayer Journal & Bible Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #1a2b4a 0%, #243656 55%, #1e334f 100%)",
          fontFamily: "Georgia, Times New Roman, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            color: "#e0c57a",
            textTransform: "uppercase",
          }}
        >
          {BRAND.team}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 72,
            fontWeight: 600,
            color: "#f7f3eb",
            lineHeight: 1.1,
          }}
        >
          PrayNote AI
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
            color: "rgba(247, 243, 235, 0.85)",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Private AI prayer journal with Scripture
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            color: "#d4b86a",
          }}
        >
          praynote.church
        </div>
      </div>
    ),
    { ...size }
  );
}
