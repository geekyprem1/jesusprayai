import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/** Outer spinner box + inner logo — both share the same center */
const SIZES = {
  sm: { wrap: 56, logo: 34, stroke: 2.5 },
  md: { wrap: 80, logo: 48, stroke: 3 },
  lg: { wrap: 104, logo: 64, stroke: 3.5 },
} as const;

type Props = {
  className?: string;
  size?: keyof typeof SIZES;
  label?: string;
  showBrand?: boolean;
};

/**
 * Clean centered brand loader: logo + thin gold arc spinner.
 */
export function LogoLoader({
  className,
  size = "md",
  label,
  showBrand = false,
}: Props) {
  const s = SIZES[size];
  const r = (s.wrap - s.stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const dash = c * 0.22;
  const gap = c - dash;
  const mid = s.wrap / 2;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        className
      )}
    >
      <div
        className="logo-loader relative shrink-0"
        style={{ width: s.wrap, height: s.wrap }}
      >
        <svg
          width={s.wrap}
          height={s.wrap}
          viewBox={`0 0 ${s.wrap} ${s.wrap}`}
          className="absolute inset-0 block"
          fill="none"
          aria-hidden
        >
          {/* Soft track */}
          <circle
            cx={mid}
            cy={mid}
            r={r}
            stroke="oklch(0.72 0.1 85 / 0.18)"
            strokeWidth={s.stroke}
          />
          {/* Spinning gold arc — rotate around true center */}
          <g className="logo-loader-spin" style={{ transformOrigin: `${mid}px ${mid}px` }}>
            <circle
              cx={mid}
              cy={mid}
              r={r}
              stroke="oklch(0.68 0.12 85)"
              strokeWidth={s.stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
            />
          </g>
        </svg>

        {/* Logo dead-center */}
        <div
          className="logo-loader-mark absolute overflow-hidden rounded-[22%] bg-[oklch(0.22_0.055_255)] shadow-md ring-1 ring-[oklch(0.72_0.1_85/0.25)]"
          style={{
            width: s.logo,
            height: s.logo,
            left: "50%",
            top: "50%",
          }}
        >
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={s.logo}
            height={s.logo}
            className="pointer-events-none block size-full object-cover object-center"
            priority
            unoptimized
          />
        </div>
      </div>

      {(showBrand || label) && (
        <div className="flex flex-col items-center justify-center gap-1">
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
