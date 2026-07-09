import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  light?: boolean;
};

/** Simple cross mark for Christian brand identity */
export function CrossMark({ className, light }: Props) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        light
          ? "bg-[oklch(0.78_0.08_85/0.2)] text-[oklch(0.85_0.08_85)]"
          : "bg-[oklch(0.28_0.05_255)] text-[oklch(0.92_0.04_85)]",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[55%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M12 4v16M7 9h10" />
      </svg>
    </span>
  );
}
