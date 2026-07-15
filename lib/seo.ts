import { BRAND } from "@/lib/brand";

/** Canonical site URL — prefer env, fall back to brand domain */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  return BRAND.siteUrl;
}

export type FaqItem = {
  question: string;
  answer: string;
};

export function faqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.team,
    url,
    email: BRAND.supportEmail,
    logo: `${url}/icons/icon-512.png`,
    sameAs: [],
    brand: {
      "@type": "Brand",
      name: BRAND.name,
    },
  };
}

export function softwareApplicationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.name,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web, iOS, Android",
    url,
    description:
      "Private AI-powered Christian prayer journal with Scripture suggestions, answered prayer tracking, and verse sharing.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: BRAND.team,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND.team,
      url,
    },
  };
}

export function webPageJsonLd(opts: {
  title: string;
  description: string;
  path: string;
}) {
  const url = `${getSiteUrl()}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.title,
    description: opts.description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: BRAND.name,
      url: getSiteUrl(),
    },
  };
}
