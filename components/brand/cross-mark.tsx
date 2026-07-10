import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Light variant for dark backgrounds (footer, navy cards) */
  light?: boolean;
};

/**
 * Brand mark — navy tile + bold cream cross + gold ring.
 * Sized via className (e.g. size-9, size-12).
 */
export function CrossMark({ className, light }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-[22%] shadow-sm ring-2",
        light
          ? "bg-[oklch(0.26_0.05_255)] text-[oklch(0.96_0.02_85)] ring-[oklch(0.82_0.1_85/0.65)]"
          : "bg-[oklch(0.22_0.055_255)] text-[oklch(0.97_0.015_85)] ring-[oklch(0.72_0.12_85/0.7)]",
        className
      )}
      aria-hidden
    >
      {/* Soft gold glow so mark reads on light headers */}
      <span
        className={cn(
          "pointer-events-none absolute inset-[12%] rounded-[18%] opacity-40",
          light
            ? "bg-[oklch(0.78_0.1_85/0.25)]"
            : "bg-[oklch(0.78_0.1_85/0.2)]"
        )}
      />
      <svg
        viewBox="0 0 32 32"
        className="relative size-[68%]"
        fill="none"
        aria-hidden
      >
        {/* Vertical bar — slightly thicker for visibility */}
        <path
          d="M16 5.5v21"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        {/* Horizontal bar */}
        <path
          d="M8 12.2h16"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
        {/* Gold accent tip on vertical (reads at small sizes) */}
        <circle
          cx="16"
          cy="5.5"
          r="1.6"
          className={
            light
              ? "fill-[oklch(0.85_0.1_85)]"
              : "fill-[oklch(0.78_0.12_85)]"
          }
        />
      </svg>
    </span>
  );
}
