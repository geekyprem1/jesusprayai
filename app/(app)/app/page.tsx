import Link from "next/link";
import { BookOpen, NotebookPen, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTodayDevotional } from "@/app/devotional/actions";

export const metadata = {
  title: "Home",
};

export default async function AppHomePage() {
  const devotional = await getTodayDevotional();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Journal with AI verse linking, track requests, and stay in the Word.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s devotional</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {devotional.ok && devotional.data
              ? `${devotional.data.verse_reference} · ${devotional.data.translation}`
              : "Seed devotionals after running 003_phase3_ai_requests.sql"}
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
              {devotional.error ?? "No devotional found for today."}
            </p>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
        <Link href="/app/journal" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-6">
              <NotebookPen className="mb-1 size-5 text-primary" />
              <CardTitle className="text-base">Journal</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                AI categories + verses
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/app/requests" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-6">
              <ListTodo className="mb-1 size-5 text-primary" />
              <CardTitle className="text-base">Requests</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Pending & answered
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/app/bible" className="block">
          <Card className="h-full transition-colors active:bg-muted/40 hover:bg-muted/40">
            <CardHeader className="p-4 sm:p-6">
              <BookOpen className="mb-1 size-5 text-primary" />
              <CardTitle className="text-base">Bible</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Look up any passage
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div>
        <Button
          className="w-full min-[480px]:w-auto"
          render={<Link href="/app/journal" />}
        >
          Open journal
        </Button>
      </div>
    </div>
  );
}
