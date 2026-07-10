"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LogoLoader } from "@/components/brand/logo-loader";

type Props = {
  /** Caption under the logo */
  label?: string;
  /** Show brand name */
  showBrand?: boolean;
  /**
   * Only reveal after this many ms — avoids flash on fast loads.
   * Set 0 for immediate (route transitions).
   */
  delayMs?: number;
  /** Fill the viewport (fixed overlay) */
  fullPage?: boolean;
  /** Fill parent with a comfortable min-height */
  fill?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Professional loading surface with delayed reveal for long waits.
 * Short loads stay blank so UI doesn’t flicker.
 */
export function LoadingScreen({
  label = "Loading…",
  showBrand = false,
  delayMs = 280,
  fullPage = false,
  fill = true,
  size = "md",
  className,
}: Props) {
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) {
      setVisible(true);
      return;
    }
    const id = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  if (!visible) {
    return (
      <div
        aria-busy="true"
        aria-hidden
        className={cn(
          fullPage && "fixed inset-0 z-50",
          fill && !fullPage && "min-h-[12rem]",
          className
        )}
      />
    );
  }

  return (
    <div
      aria-busy="true"
      className={cn(
        "flex items-center justify-center",
        fullPage &&
          "fixed inset-0 z-50 bg-[oklch(0.98_0.015_85/0.92)] backdrop-blur-[2px]",
        fill &&
          !fullPage &&
          "min-h-[12rem] w-full py-10 sm:min-h-[14rem] sm:py-12",
        className
      )}
    >
      <LogoLoader
        size={size}
        label={label}
        showBrand={showBrand}
        className="animate-faith-in"
      />
    </div>
  );
}
