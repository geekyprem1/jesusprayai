import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWeeklyInsight } from "@/app/insights/actions";

export async function WeeklyInsightCard() {
  const result = await getWeeklyInsight();

  if (!result.ok || !result.data) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">This week with the Lord</CardTitle>
          <CardDescription>
            {result.error ?? "Sign in to see your weekly prayer rhythm."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const d = result.data;
  const categories = Object.entries(d.categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <Card className="border-[oklch(0.72_0.1_85/0.35)] bg-gradient-to-br from-white to-[oklch(0.97_0.02_85)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-lg sm:text-xl">
              This week with the Lord
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Last 7 days · {d.weekStart} → {d.weekEnd}
            </CardDescription>
          </div>
          <Sparkles className="size-5 shrink-0 text-[oklch(0.55_0.08_85)]" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Prayers" value={d.entryCount} />
          <Stat label="Answered" value={d.answeredCount} />
          <Stat label="Open requests" value={d.activeRequests} />
          <Stat label="Saved verses" value={d.savedVersesCount} />
        </div>

        {categories.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Prayer focus
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(([name, count]) => (
                <span
                  key={name}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs capitalize"
                >
                  {name} · {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {d.encouragement && (
          <p className="font-display text-sm leading-relaxed text-[oklch(0.28_0.04_255)] italic sm:text-base">
            {d.encouragement}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Link href="/app/journal" className="text-primary underline-offset-4 hover:underline">
            Write a prayer
          </Link>
          <Link href="/app/verses" className="text-primary underline-offset-4 hover:underline">
            Saved verses
          </Link>
          <Link href="/app/requests" className="text-primary underline-offset-4 hover:underline">
            Prayer requests
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-white/80 px-3 py-2 text-center">
      <p className="font-display text-xl font-semibold tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground sm:text-xs">{label}</p>
    </div>
  );
}
