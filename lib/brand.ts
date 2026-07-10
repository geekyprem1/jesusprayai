/** Public brand / contact — single source of truth */

export const BRAND = {
  name: "PrayNote AI",
  shortName: "PrayNote",
  team: "Eternal Faith",
  domain: "praynote.church",
  siteUrl: "https://praynote.church",
  /** Official support & privacy contact */
  supportEmail: "hello@praynote.church",
} as const;

export const supportMailto = `mailto:${BRAND.supportEmail}`;
