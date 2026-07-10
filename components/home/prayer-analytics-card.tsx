import Link from "next/link";
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

const CATEGORY_EMOJI: Record<string, string> = {
  gratitude: "🙏",
  intercession: "💛",
  petition: "🤲",
  confession: "🤍",
  praise: "✨",
  uncategorized: "📝",
};

export function PrayerAnalyticsCard({ week }: Props) {
  const categories = Object.entries(week.categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const max = categories[0]?.[1] ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Prayer analytics</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Most prayed topics · last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Write a few prayers and your focus areas will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {categories.map(([name, count]) => (
              <li key={name} className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="capitalize">
                    {CATEGORY_EMOJI[name] ?? "·"} {name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[oklch(0.55_0.08_85)]"
                    style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            This week: {week.entryCount} prayers · {week.answeredCount} answered
            · {week.activeRequests} open requests
          </span>
          <Link
            href="/app/journal"
            className="text-primary underline-offset-4 hover:underline"
          >
            Open journal
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
