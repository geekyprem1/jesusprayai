import { JournalWorkspace } from "@/components/journal/journal-workspace";
import { ExportPdfButton } from "@/components/journal/export-pdf-button";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Journal",
};

export default async function JournalPage() {
  let cloudEnabled = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      cloudEnabled = Boolean(user);
    } catch {
      cloudEnabled = false;
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Prayer journal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {cloudEnabled
              ? "Synced to your account. AI runs after each save."
              : "Local / offline mode. Log in for cloud + AI."}
          </p>
        </div>
        {cloudEnabled && (
          <div className="w-full sm:w-auto">
            <ExportPdfButton />
          </div>
        )}
      </div>
      <JournalWorkspace cloudEnabled={cloudEnabled} />
    </div>
  );
}
