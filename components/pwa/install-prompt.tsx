"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true ||
    document.referrer.includes("android-app://")
  );
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

const DISMISS_KEY = "praynote.pwa.install.dismissed";

/**
 * Chrome/Edge/Android: captures beforeinstallprompt and shows Install CTA.
 * iOS Safari: shows Add to Home Screen instructions (no programmatic install).
 */
export function InstallPrompt({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    // iOS: no BIP event — offer gentle tip after a short delay
    if (isIos() && !isStandalone()) {
      const t = window.setTimeout(() => setVisible(true), 2500);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBip);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setShowIosHelp(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setVisible(false);
      } else {
        dismiss();
      }
      return;
    }
    if (isIos()) {
      setShowIosHelp(true);
    }
  }, [deferred, dismiss]);

  if (installed || !visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 z-[60] mx-auto max-w-md sm:left-auto sm:right-4",
        className
      )}
      role="dialog"
      aria-label="Install PrayNote"
    >
      <div className="rounded-2xl border border-[oklch(0.72_0.1_85/0.35)] bg-[oklch(0.98_0.015_85)] p-3 shadow-lg sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.28_0.05_255)] text-[oklch(0.92_0.04_85)]">
            <Download className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-[oklch(0.28_0.05_255)] sm:text-base">
              Install PrayNote
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Add to your home screen for quick prayer, offline drafts, and a
              full-screen experience.
            </p>

            {showIosHelp && (
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                <li>
                  Tap the{" "}
                  <Share className="inline size-3.5 align-text-bottom" /> Share
                  button in Safari
                </li>
                <li>
                  Scroll and choose <strong>Add to Home Screen</strong>
                </li>
                <li>
                  Tap <strong>Add</strong>
                </li>
              </ol>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => void install()}>
                {deferred
                  ? "Install PrayNote"
                  : showIosHelp
                    ? "Got it"
                    : isIos()
                      ? "How to install"
                      : "Install PrayNote"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={dismiss}
                aria-label="Dismiss install prompt"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
