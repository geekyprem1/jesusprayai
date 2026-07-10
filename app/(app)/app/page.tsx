import Link from "next/link";
import { BookMarked, BookOpen, ListTodo, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodayDevotional } from "@/app/devotional/actions";
import { getHomeDashboard } from "@/app/insights/actions";
import { AiReflectionCard } from "@/components/home/ai-reflection-card";
import { HomeStatsGrid } from "@/components/home/home-stats-grid";
import { PrayerAnalyticsCard } from "@/components/home/prayer-analytics-card";
import { WeeklyInsightCard } from "@/components/insights/weekly-insight-card";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Home",
};

export default async function AppHomePage() {
  const devotional = await getTodayDevotional();

  let showInsights = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      showInsights = Boolean(user);
    } catch {
      showInsights = false;
    }
  }

  const dashboard = showInsights ? await getHomeDashboard() : null;
  const dash = dashboard?.ok ? dashboard.data : null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Your prayer life, at a glance — streak, reflections, and Scripture.
        </p>
      </div>

      {dash ? (
        <>
          <AiReflectionCard
            reflection={dash.aiReflection}
            topCategory={dash.week.topCategory}
          />
          <HomeStatsGrid data={dash} />
          <div className="grid gap-4 lg:grid-cols-2">
            <PrayerAnalyticsCard week={dash.week} />
            <WeeklyInsightCard week={dash.week} />
          </div>
        </>
      ) : (
        <Card className="border-dashed border-[oklch(0.72_0.12_85/0.4)] bg-gradient-to-br from-[oklch(0.28_0.05_255)] to-[oklch(0.32_0.05_255)] text-white">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">
              AI Reflection
            </CardTitle>
            <CardDescription className="text-[oklch(0.85_0.03_85)]">
              Sign in to unlock personal encouragement from your prayers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="bg-[oklch(0.78_0.1_85)] text-[oklch(0.22_0.04_255)] hover:bg-[oklch(0.84_0.1_85)]"
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s devotional</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {devotional.ok && devotional.data
              ? `${devotional.data.verse_reference} · ${devotional.data.translation}`
              : "A quiet word for today"}
          </CardDescription>
        </CardHeader>
        {devotional.ok && devotional.data ? (
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed break-words italic sm:text-[0.95rem]">
              “{devotional.data.verse_text}”
            </p>
            <p className="text-sm text-muted-foreground break-words">
              {devotional.data.reflection}
            </p>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {devotional.error ??
                "Come back soon — a fresh reflection will be here."}
            </p>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-4">
        <Link href="/app/journal" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-5">
              <NotebookPen className="mb-1 size-5 text-primary" />
              <CardTitle className="text-sm sm:text-base">Journal</CardTitle>
              <CardDescription className="text-xs">
                Pray + AI
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/app/verses" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-5">
              <BookMarked className="mb-1 size-5 text-primary" />
              <CardTitle className="text-sm sm:text-base">Verses</CardTitle>
              <CardDescription className="text-xs">
                Bookmarks
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/app/requests" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-5">
              <ListTodo className="mb-1 size-5 text-primary" />
              <CardTitle className="text-sm sm:text-base">Requests</CardTitle>
              <CardDescription className="text-xs">
                Track
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/app/bible" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-5">
              <BookOpen className="mb-1 size-5 text-primary" />
              <CardTitle className="text-sm sm:text-base">Bible</CardTitle>
              <CardDescription className="text-xs">
                Look up
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="flex flex-col gap-2 min-[480px]:flex-row">
        <Button
          className="w-full min-[480px]:w-auto"
          render={<Link href="/app/journal" />}
        >
          Open journal
        </Button>
        <Button
          variant="outline"
          className="w-full min-[480px]:w-auto"
          render={<Link href="/app/verses" />}
        >
          Saved verses
        </Button>
      </div>
    </div>
  );
}
