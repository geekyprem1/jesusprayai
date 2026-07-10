import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Source_Serif_4,
  Geist_Mono,
} from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { AnalyticsProviders } from "@/components/analytics/providers";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrayNote AI — Prayer Journal & Bible Companion",
    template: "%s · PrayNote AI",
  },
  description:
    "Private Christian prayer journal from Eternal Faith. Write prayers, meet Scripture, share verse cards on WhatsApp — free to start.",
  applicationName: "PrayNote AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrayNote",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a2b4a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AnalyticsProviders />
        <RegisterServiceWorker />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
