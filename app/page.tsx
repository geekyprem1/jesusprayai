import Image from "next/image";
import Link from "next/link";
import {
  BookMarked,
  Church,
  Heart,
  Mic,
  Share2,
  Shield,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Write your prayers",
    description:
      "Gratitude, worry, confession, praise — pour it out in a quiet place made for you. Private by design.",
  },
  {
    icon: BookMarked,
    title: "Meet Scripture",
    description:
      "Every prayer can be linked to living Word. Gentle verse suggestions so journaling always returns to the Bible.",
  },
  {
    icon: Share2,
    title: "Share a verse",
    description:
      "Send a beautiful verse card to WhatsApp or Facebook — encourage family and friends without sharing your private prayers.",
  },
  {
    icon: Sparkles,
    title: "Remember answered prayer",
    description:
      "Mark what God has done. Build a personal timeline of faithfulness you can revisit in dry seasons.",
  },
];

const steps = [
  {
    n: "01",
    title: "Write or whisper",
    text: "Capture the cry of your heart — on your phone, even on slow data.",
  },
  {
    n: "02",
    title: "Meet the Word",
    text: "Receive Scripture that comforts, strengthens, and points you to Jesus.",
  },
  {
    n: "03",
    title: "Share & remember",
    text: "Share a verse card with someone you love. Mark prayers God has answered.",
  },
];

export default function HomePage() {
  return (
    <div className="marketing-gradient flex flex-col overflow-hidden">
      {/* HERO */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-3 py-10 sm:gap-10 sm:px-4 sm:py-14 md:grid-cols-2 md:py-20 lg:gap-14">
        <div
          className="animate-faith-cross pointer-events-none absolute -left-10 top-10 hidden size-64 rounded-full bg-[oklch(0.72_0.1_85/0.15)] blur-3xl md:block"
          aria-hidden
        />

        {/* Image first on mobile for visual impact */}
        <div className="animate-faith-up delay-200 relative order-1 md:order-2">
          <div className="animate-faith-float relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-[oklch(0.72_0.1_85/0.35)] sm:rounded-2xl">
            <Image
              src="/marketing/hero-bible.jpg"
              alt="Open Bible in warm morning light"
              width={960}
              height={640}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto max-h-[42vh] w-full object-cover sm:max-h-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.05_255/0.55)] via-transparent to-transparent" />
            <div className="absolute right-3 bottom-3 left-3 rounded-xl border border-white/20 bg-[oklch(0.22_0.05_255/0.55)] p-3 text-white backdrop-blur-sm sm:right-4 sm:bottom-4 sm:left-4 sm:p-4">
              <p className="font-display text-base leading-snug italic sm:text-lg md:text-xl">
                “Thy word is a lamp unto my feet, and a light unto my path.”
              </p>
              <p className="mt-1 text-[10px] tracking-widest text-[oklch(0.85_0.06_85)] uppercase sm:text-xs">
                Psalm 119:105 · KJV
              </p>
            </div>
          </div>
          <div
            className="animate-faith-glow pointer-events-none absolute -right-4 -bottom-4 -z-10 size-28 rounded-full bg-[oklch(0.72_0.1_85/0.35)] blur-2xl sm:-right-6 sm:-bottom-6 sm:size-40"
            aria-hidden
          />
        </div>

        <div className="relative z-10 order-2 flex flex-col items-start text-left md:order-1">
          <p className="animate-faith-up delay-100 mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-[oklch(0.72_0.1_85/0.45)] bg-white/70 px-3 py-1 text-[10px] font-medium tracking-wide text-[oklch(0.4_0.05_255)] uppercase sm:mb-4 sm:text-xs">
            <Church className="size-3.5 shrink-0 text-[oklch(0.55_0.08_85)]" />
            From the Eternal Faith team
          </p>

          <h1 className="font-display animate-faith-up delay-200 max-w-xl text-[1.85rem] leading-[1.15] font-semibold tracking-tight text-[oklch(0.24_0.05_255)] xs:text-4xl sm:text-5xl lg:text-[3.25rem]">
            Your private prayer journal —{" "}
            <span className="italic text-[oklch(0.42_0.07_255)]">
              with Scripture
            </span>{" "}
            that meets you
          </h1>

          <p className="animate-faith-up delay-300 mt-4 max-w-lg text-sm leading-relaxed text-[oklch(0.4_0.03_255)] sm:mt-5 sm:text-base md:text-lg">
            Write what&apos;s on your heart. See Bible verses that speak to your
            prayer. Share a verse with someone who needs hope — without sharing
            your private prayers.
          </p>

          <div className="animate-faith-up delay-400 mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/signup"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[oklch(0.28_0.05_255)] px-6 py-3 text-sm font-medium text-[oklch(0.97_0.01_85)] shadow-md transition hover:bg-[oklch(0.34_0.05_255)] sm:w-auto sm:min-h-0 sm:py-2.5"
            >
              Start free — no card needed
            </Link>
            <Link
              href="/app"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[oklch(0.72_0.1_85/0.55)] bg-white/80 px-6 py-3 text-sm font-medium text-[oklch(0.28_0.05_255)] transition hover:bg-white sm:w-auto sm:min-h-0 sm:py-2.5"
            >
              Open the app
            </Link>
          </div>

          <p className="animate-faith-up delay-500 mt-4 text-[11px] leading-relaxed tracking-wide text-[oklch(0.5_0.03_255)] sm:text-xs">
            Free to start · Works on your phone · Prayers stay private
          </p>
        </div>
      </section>

      <div className="gold-divider mx-auto w-full max-w-4xl" />

      {/* SCRIPTURE BAND */}
      <section
        id="scripture"
        className="relative mt-10 overflow-hidden py-16 text-center"
      >
        <div className="absolute inset-0 bg-[#1a2b4a]" aria-hidden />
        <Image
          src="/marketing/light-faith.jpg"
          alt=""
          fill
          className="object-cover opacity-35"
          sizes="100vw"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1a2b4a]/90 via-[#1a2b4a]/80 to-[#1a2b4a]/92"
          aria-hidden
        />
        <div className="animate-faith-in relative z-10 mx-auto max-w-3xl px-3 sm:px-4">
          <p className="mb-3 text-[10px] tracking-[0.2em] text-[#e0c57a] uppercase sm:text-xs sm:tracking-[0.25em]">
            Why we built this
          </p>
          <blockquote className="font-display text-xl leading-relaxed font-medium text-[#f7f3eb] italic sm:text-2xl md:text-3xl lg:text-4xl">
            “Be careful for nothing; but in every thing by prayer and
            supplication with thanksgiving let your requests be made known unto
            God.”
          </blockquote>
          <p className="mt-4 text-xs tracking-widest text-[#d4b86a] sm:text-sm">
            — Philippians 4:6 (KJV)
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-3 py-12 sm:px-4 sm:py-16 md:py-20"
      >
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <p className="mb-2 text-[10px] font-medium tracking-[0.2em] text-[oklch(0.55_0.08_85)] uppercase sm:text-xs">
            Built for real life faith
          </p>
          <h2 className="font-display text-2xl font-semibold text-[oklch(0.24_0.05_255)] sm:text-3xl md:text-4xl">
            Prayer that points to Scripture
          </h2>
          <p className="mt-3 text-sm text-[oklch(0.42_0.03_255)] sm:text-base">
            Not a social feed. Not noise. Just you, the Word, and a place to
            remember His faithfulness — then share hope with others.
          </p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          <div className="animate-faith-up relative min-h-[220px] overflow-hidden rounded-xl shadow-xl ring-1 ring-[oklch(0.72_0.1_85/0.3)] sm:min-h-[280px] sm:rounded-2xl">
            <Image
              src="/marketing/prayer-journal.jpg"
              alt="Prayer journal and wooden cross in soft light"
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-full min-h-[220px] w-full object-cover sm:min-h-[280px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.22_0.05_255/0.7)] to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-4 text-white sm:p-6">
              <p className="font-display text-xl font-medium sm:text-2xl">
                Your closet of prayer — with gentle AI
              </p>
              <p className="mt-1 text-xs text-white/85 sm:text-sm">
                Private prayers. Shareable verses. Christ at the center.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1 xl:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="feature-card-faith animate-faith-up rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-5 backdrop-blur-sm"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-[oklch(0.28_0.05_255/0.08)] text-[oklch(0.32_0.06_255)]">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[oklch(0.24_0.05_255)]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[oklch(0.42_0.03_255)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-[oklch(0.72_0.1_85/0.25)] bg-white/50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <h2 className="font-display mb-8 text-center text-2xl font-semibold text-[oklch(0.24_0.05_255)] sm:mb-10 sm:text-3xl">
            Three simple steps
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className="animate-faith-up rounded-2xl border border-[oklch(0.88_0.02_85)] bg-[oklch(0.98_0.01_85)] p-6 text-center"
                style={{ animationDelay: `${0.15 + i * 0.12}s` }}
              >
                <p className="font-display text-3xl font-semibold text-[oklch(0.72_0.1_85)]">
                  {step.n}
                </p>
                <h3 className="font-display mt-2 text-xl font-semibold text-[oklch(0.26_0.05_255)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[oklch(0.42_0.03_255)]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / VALUES */}
      <section className="mx-auto max-w-6xl px-3 py-12 sm:px-4 sm:py-16">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Your prayers stay private",
              text: "This is a journal, not a public wall. We treat prayer as sacred — never content for ads.",
            },
            {
              icon: BookMarked,
              title: "Bible first, AI second",
              text: "AI only helps with categories and verse ideas. It never replaces reading Scripture yourself.",
            },
            {
              icon: Mic,
              title: "Made for your phone",
              text: "Built for busy days, slow data, and quiet moments — from Lagos to Manila and beyond.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="animate-faith-up flex flex-col items-center rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/70 p-6 text-center"
              style={{ animationDelay: `${0.15 + i * 0.1}s` }}
            >
              <item.icon className="mb-3 size-7 text-[oklch(0.45_0.07_255)]" />
              <h3 className="font-display text-xl font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[oklch(0.42_0.03_255)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden px-3 pb-14 sm:px-4 sm:pb-20">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[oklch(0.26_0.05_255)] px-4 py-10 text-center text-white shadow-2xl sm:rounded-3xl sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url(/marketing/light-faith.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10">
            <p className="mb-2 text-[10px] tracking-[0.2em] text-[#e0c57a] uppercase sm:text-xs">
              From Eternal Faith
            </p>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl md:text-4xl">
              Come and pray — He is listening
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              Free to start. No card needed. Write one prayer today, meet the
              Word, and share hope with someone you love.
            </p>
            <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[oklch(0.78_0.08_85)] px-7 py-3 text-sm font-semibold text-[oklch(0.22_0.04_255)] transition hover:bg-[oklch(0.84_0.08_85)]"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm text-white transition hover:bg-white/10"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
