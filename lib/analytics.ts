/**
 * Lightweight analytics / error hooks.
 * PostHog & Sentry activate only when env keys are present.
 */

type Props = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, props?: Props) {
  if (typeof window === "undefined") {
    // Server: log in dev for visibility
    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", name, props ?? {});
    }
    return;
  }

  // PostHog browser snippet optional
  const ph = (
    window as unknown as {
      posthog?: { capture: (e: string, p?: Props) => void };
    }
  ).posthog;
  if (ph?.capture) {
    ph.capture(name, props);
  } else if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", name, props ?? {});
  }
}

export function captureError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (process.env.NODE_ENV === "development") {
    console.error("[error]", context, message);
  }

  if (typeof window !== "undefined") {
    const Sentry = (
      window as unknown as {
        Sentry?: { captureException: (e: unknown) => void };
      }
    ).Sentry;
    Sentry?.captureException?.(error);
  }
}

export function isPostHogConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

export function isSentryConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}
