import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { CrossMark } from "@/components/brand/cross-mark";

/**
 * Same mark as header / footer / app shell (CrossMark).
 * Gold arc spins tightly around that logo only — no PNG white frame.
 */
const SIZES = {
  sm: { logo: 40, stroke: 2.5, gap: 3 },
  md: { logo: 52, stroke: 3, gap: 4 },
  lg: { logo: 64, stroke: 3.5, gap: 4 },
} as const;

type Props = {
  className?: string;
  size?: keyof typeof SIZES;
  label?: string;
  showBrand?: boolean;
};

export function LogoLoader({
  className,
  size = "md",
  label,
  showBrand = false,
}: Props) {
  const s = SIZES[size];
  const wrap = s.logo + s.gap * 2 + s.stroke * 2;
  const mid = wrap / 2;
  const r = s.logo / 2 + s.gap + s.stroke / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.24;
  const gapLen = circ - dash;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3.5 text-center",
        className
      )}
    >
      <div
        className="logo-loader relative shrink-0"
        style={{ width: wrap, height: wrap }}
      >
        <svg
          width={wrap}
          height={wrap}
          viewBox={`0 0 ${wrap} ${wrap}`}
          className="pointer-events-none absolute inset-0 block"
          fill="none"
          aria-hidden
        >
          <g
            className="logo-loader-spin"
            style={{ transformOrigin: `${mid}px ${mid}px` }}
          >
            <circle
              cx={mid}
              cy={mid}
              r={r}
              stroke="oklch(0.68 0.12 85)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash.toFixed(2)} ${gapLen.toFixed(2)}`}
            />
          </g>
        </svg>

        {/* Exact same logo as site header / footer */}
        <div
          className="logo-loader-mark absolute flex items-center justify-center"
          style={{
            width: s.logo,
            height: s.logo,
            left: "50%",
            top: "50%",
          }}
        >
          <CrossMark className="size-full" />
        </div>
      </div>

      {(showBrand || label) && (
        <div className="flex flex-col items-center justify-center gap-0.5">
          {showBrand && (
            <p className="font-display text-base font-semibold tracking-wide text-[oklch(0.22_0.05_255)] sm:text-lg">
              {BRAND.shortName}{" "}
              <span className="font-semibold italic text-[oklch(0.48_0.1_85)]">
                AI
              </span>
            </p>
          )}
          {label && (
            <p className="logo-loader-label text-sm text-muted-foreground">
              {label}
            </p>
          )}
        </div>
      )}

      <span className="sr-only">{label || "Loading"}</span>
    </div>
  );
}
