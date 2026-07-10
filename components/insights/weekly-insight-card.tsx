import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WeeklyInsight } from "@/app/insights/actions";

type Props = {
  week: WeeklyInsight;
};

/** Compact weekly summary — AI Reflection is the hero; this is the Sunday-style recap. */
export function WeeklyInsightCard({ week }: Props) {
  return (
    <Card className="border-[oklch(0.72_0.1_85/0.35)] bg-gradient-to-br from-white to-[oklch(0.97_0.02_85)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-lg sm:text-xl">
              AI weekly summary
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Last 7 days · {week.weekStart} → {week.weekEnd}
            </CardDescription>
          </div>
          <CalendarHeart className="size-5 shrink-0 text-[oklch(0.55_0.08_85)]" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Prayers" value={week.entryCount} />
          <Stat label="Answered" value={week.answeredCount} />
          <Stat label="Open requests" value={week.activeRequests} />
          <Stat label="Saved verses" value={week.savedVersesCount} />
        </div>

        {week.encouragement && (
          <p className="font-display text-sm leading-relaxed text-[oklch(0.28_0.04_255)] italic sm:text-base">
            {week.encouragement}
          </p>
        )}

        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <Link
            href="/app/journal"
            className="text-primary underline-offset-4 hover:underline"
          >
            Write a prayer
          </Link>
          <Link
            href="/app/requests"
            className="text-primary underline-offset-4 hover:underline"
          >
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
