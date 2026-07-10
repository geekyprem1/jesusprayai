import Link from "next/link";
import { CrossMark } from "@/components/brand/cross-mark";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

/**
 * Shown when the service worker cannot reach the network.
 * Journal drafts remain in localStorage / IndexedDB on the client.
 */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <CrossMark className="size-16" />
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[oklch(0.28_0.05_255)] sm:text-3xl">
          You&apos;re offline
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Your saved prayers remain safe.
          <br />
          Reconnect to continue syncing.
        </p>
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        Offline journal drafts on this device stay available in the Journal
        screen when you open it again from the home screen.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button render={<Link href="/" />}>Try again</Button>
        <Button variant="outline" render={<Link href="/app/journal" />}>
          Open journal
        </Button>
      </div>
    </div>
  );
}
