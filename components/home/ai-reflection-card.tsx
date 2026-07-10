import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HomeDashboard } from "@/app/insights/actions";

type Props = {
  reflection: HomeDashboard["aiReflection"];
  topCategory: string | null;
};

export function AiReflectionCard({ reflection, topCategory }: Props) {
  return (
    <Card className="overflow-hidden border-[oklch(0.72_0.12_85/0.45)] bg-gradient-to-br from-[oklch(0.28_0.05_255)] via-[oklch(0.32_0.05_255)] to-[oklch(0.26_0.04_250)] text-[oklch(0.96_0.01_85)] shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.78_0.1_85/0.2)] px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-[oklch(0.88_0.08_85)] uppercase">
              <Sparkles className="size-3.5" />
              AI Reflection
            </div>
            <CardTitle className="font-display text-xl text-white sm:text-2xl">
              {reflection.source === "empty"
                ? "Your encouragement starts here"
                : "Today's encouragement"}
            </CardTitle>
            <CardDescription className="mt-1 text-[oklch(0.82_0.03_85)]">
              {topCategory && reflection.source !== "empty"
                ? `Drawn from your recent prayers · focus: ${topCategory}`
                : "Generated from your prayer patterns"}
            </CardDescription>
          </div>
          <Sparkles className="size-8 shrink-0 text-[oklch(0.78_0.1_85)] opacity-80 sm:size-10" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="font-display text-base leading-relaxed text-[oklch(0.96_0.015_85)] sm:text-lg">
          {reflection.body}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            className="w-full bg-[oklch(0.78_0.1_85)] text-[oklch(0.22_0.04_255)] hover:bg-[oklch(0.84_0.1_85)] sm:w-auto"
            render={<Link href="/app/journal" />}
          >
            Write a prayer
          </Button>
          <Button
            variant="outline"
            className="w-full border-[oklch(0.78_0.1_85/0.4)] bg-transparent text-[oklch(0.92_0.03_85)] hover:bg-white/10 sm:w-auto"
            render={<Link href="/app/verses" />}
          >
            Saved verses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
