import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

const SIZES = {
  sm: { box: "size-12", img: 40, ring: "size-14" },
  md: { box: "size-16", img: 56, ring: "size-[4.75rem]" },
  lg: { box: "size-20", img: 72, ring: "size-24" },
} as const;

type Props = {
  className?: string;
  /** Visual size of the mark */
  size?: keyof typeof SIZES;
  /** Optional caption under the logo */
  label?: string;
  /** Show brand name under the logo */
  showBrand?: boolean;
};

/**
 * Animated brand mark — soft breathe + gold orbit.
 * Use for route transitions and longer client loads.
 */
export function LogoLoader({
  className,
  size = "md",
  label,
  showBrand = false,
}: Props) {
  const s = SIZES[size];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        className
      )}
    >
      <div className={cn("logo-loader relative flex items-center justify-center", s.ring)}>
        {/* Gold orbit ring */}
        <span className="logo-loader-orbit" aria-hidden />
        {/* Soft glow */}
        <span className="logo-loader-glow" aria-hidden />
        {/* Brand logo */}
        <span
          className={cn(
            "logo-loader-mark relative z-[1] overflow-hidden rounded-[22%] shadow-md ring-1 ring-[oklch(0.72_0.12_85/0.35)]",
            s.box
          )}
        >
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={s.img}
            height={s.img}
            className="size-full object-cover"
            priority
            unoptimized
          />
        </span>
      </div>

      {(showBrand || label) && (
        <div className="flex flex-col items-center gap-1">
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
