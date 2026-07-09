import Link from "next/link";
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
    features: [
      "3 prayer entries / week (when limits enforce)",
      "Journal + Bible reader",
      "Ads-free",
    ],
    cta: "Get started",
    href: "/signup",
    live: true,
  },
  {
    name: "Monthly",
    price: "$7.99",
    period: "/ month",
    features: [
      "Unlimited entries",
      "Full AI categorize + verse linking",
      "All translations",
      "7-day trial (when payments live)",
    ],
    cta: "Coming soon",
    href: "#",
    live: false,
  },
  {
    name: "Annual",
    price: "$49.99",
    period: "/ year",
    features: [
      "Everything in Monthly",
      "Best value (~48% savings)",
      "Priority support",
    ],
    cta: "Coming soon",
    href: "#",
    live: false,
  },
];

export const metadata = {
  title: "Pricing",
  description: "PrayNote AI plans — free to start. Paid checkout coming soon.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-3 py-10 sm:px-4 sm:py-16">
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Simple pricing
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Start free. Paid plans via Lemon Squeezy ship after product is solid —
          checkout is intentionally not live yet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={!tier.live ? "opacity-95" : undefined}>
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-semibold text-foreground">
                  {tier.price}
                </span>{" "}
                <span>{tier.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {tier.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier.live ? (
                <Button className="w-full" render={<Link href={tier.href} />}>
                  {tier.cta}
                </Button>
              ) : (
                <Button className="w-full" disabled title="Lemon Squeezy later">
                  {tier.cta}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Church / Family plans in a later phase. No payment processing in this
        build.
      </p>
    </div>
  );
}
