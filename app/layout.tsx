import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Source_Serif_4,
  Geist_Mono,
} from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AnalyticsProviders } from "@/components/analytics/providers";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://praynote.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "PrayNote AI — Prayer Journal & Bible Companion",
    template: "%s · PrayNote AI",
  },
  description:
    "Private AI-powered Christian prayer journal with Scripture. From Eternal Faith — free to start.",
  applicationName: "PrayNote AI",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrayNote",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png?v=5",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16.png?v=5", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png?v=5", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png?v=5", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=5", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png?v=5",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon-32.png?v=5"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "PrayNote",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10233F" },
    { media: "(prefers-color-scheme: dark)", color: "#10233F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
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
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png?v=5" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=5" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PrayNote" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="mask-icon" href="/icons/icon.svg?v=5" color="#10233F" />
      </head>
      <body className="min-h-full flex flex-col bg-[oklch(0.98_0.015_85)]">
        <AnalyticsProviders />
        <RegisterServiceWorker />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <InstallPrompt />
      </body>
    </html>
  );
}
