import type { FaqItem } from "@/lib/seo";

type Props = {
  title?: string;
  faqs: FaqItem[];
};

export function FaqSection({ title = "Frequently asked questions", faqs }: Props) {
  return (
    <section className="mx-auto w-full max-w-3xl px-3 py-12 sm:px-4 sm:py-16">
      <h2 className="font-display mb-6 text-center text-2xl font-semibold text-[oklch(0.24_0.05_255)] sm:mb-8 sm:text-3xl">
        {title}
      </h2>
      <dl className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5"
          >
            <dt className="font-display text-lg font-semibold text-[oklch(0.24_0.05_255)]">
              {faq.question}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-[oklch(0.42_0.03_255)]">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
