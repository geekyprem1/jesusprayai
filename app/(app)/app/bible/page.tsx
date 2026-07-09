import { BibleReader } from "@/components/bible/bible-reader";

export const metadata = {
  title: "Bible",
};

export default function BiblePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bible</h1>
        <p className="mt-1 text-muted-foreground">
          Search and read passages. Link verses to prayers in Phase 3.
        </p>
      </div>
      <BibleReader />
    </div>
  );
}
