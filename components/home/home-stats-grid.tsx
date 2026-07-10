import Link from "next/link";
import { BookMarked, Flame, Heart, NotebookPen } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HomeDashboard } from "@/app/insights/actions";

type Props = {
  data: HomeDashboard;
};

export function HomeStatsGrid({ data }: Props) {
  const favoriteLabel = data.favoriteVerse?.reference ?? "Save one";
  const favoriteHint = data.favoriteVerse
    ? "Most recent bookmark"
    : "From AI suggestions";

  const tiles = [
    {
      href: "/app/journal",
      icon: Flame,
      label: "Prayer streak",
      value:
        data.prayerStreak > 0
          ? `${data.prayerStreak} day${data.prayerStreak === 1 ? "" : "s"}`
          : "Start today",
      hint: data.prayerStreak > 0 ? "Keep the chain going" : "One prayer starts it",
      accent: "text-orange-600",
    },
    {
      href: "/app/requests",
      icon: Heart,
      label: "Answered prayers",
      value: String(data.totalAnswered),
      hint: "Marked as answered",
      accent: "text-rose-600",
    },
    {
      href: "/app/verses",
      icon: BookMarked,
      label: "Favorite verse",
      value: favoriteLabel,
      hint: favoriteHint,
      accent: "text-[oklch(0.5_0.08_85)]",
      valueClass: "text-base sm:text-lg leading-snug",
    },
    {
      href: "/app/journal",
      icon: NotebookPen,
      label: "Journal entries",
      value: String(data.totalEntries),
      hint: "All time",
      accent: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <Link key={t.label} href={t.href} className="block min-w-0">
            <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/30">
              <CardHeader className="gap-1 p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardDescription className="text-xs font-medium">
                    {t.label}
                  </CardDescription>
                  <Icon className={`size-4 shrink-0 ${t.accent}`} />
                </div>
                <CardTitle
                  className={`font-display tabular-nums ${t.valueClass ?? "text-xl sm:text-2xl"} line-clamp-2`}
                >
                  {t.value}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {t.hint}
                </p>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
