import { SavedVersesList } from "@/components/verses/saved-verses-list";

export const metadata = {
  title: "Saved verses",
};

export default function SavedVersesPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Saved verses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Scripture you bookmarked from your prayers — a personal treasury of
          the Word.
        </p>
      </div>
      <SavedVersesList />
    </div>
  );
}
