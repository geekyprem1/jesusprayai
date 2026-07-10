import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    features: [
      "20 prayer entries",
      "20 saved verses",
      "Basic daily reminders",
      "Bible reader",
      "Journal (core)",
    ],
    cta: "Get started free",
    href: "/signup",
    live: true,
  },
  {
    name: "Premium",
    price: "$6.99",
    period: "/ month",
    highlight: true,
    features: [
      "Unlimited prayers & verses",
      "AI Reflections & patterns",
      "AI verse suggestions",
      "Prayer streak & analytics",
      "AI weekly summary",
      "PDF journal export",
      "Unlimited prayer requests",
      "Premium story sharing (IG, WA, FB, Pinterest)",
    ],
    cta: "Coming soon",
    href: "#",
    live: false,
  },
];

export const metadata = {
  title: "Pricing",
  description:
    "PrayNote free vs Premium — AI reflections, unlimited journal, story sharing.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-3 py-10 sm:px-4 sm:py-16">
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Free to start. Premium to go deeper.
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Build the habit free. Unlock AI reflections, unlimited journal, and
          beautiful verse stories when you&apos;re ready.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlight
                ? "border-[oklch(0.72_0.12_85/0.55)] shadow-md ring-1 ring-[oklch(0.72_0.1_85/0.35)]"
                : undefined
            }
          >
            <CardHeader>
              {tier.highlight && (
                <span className="mb-1 w-fit rounded-full bg-[oklch(0.78_0.1_85/0.25)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[oklch(0.4_0.06_85)] uppercase">
                  Most loved
                </span>
              )}
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-semibold text-foreground">
                  {tier.price}
                </span>{" "}
                <span>{tier.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-[oklch(0.5_0.08_85)]" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier.live ? (
                <Button className="w-full" render={<Link href={tier.href} />}>
                  {tier.cta}
                </Button>
              ) : (
                <Button className="w-full" disabled title="Checkout coming soon">
                  {tier.cta}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Payments via Lemon Squeezy shipping next. Annual plan and church seats
        planned later.
      </p>
    </div>
  );
}
