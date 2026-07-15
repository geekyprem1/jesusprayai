import Link from "next/link";
import { getRelatedTools, type ToolId } from "@/lib/content/tools";

type Props = {
  currentToolId: ToolId;
  limit?: number;
};

export function RelatedTools({ currentToolId, limit = 2 }: Props) {
  const tools = getRelatedTools(currentToolId, limit);
  if (tools.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading">
      <h2
        id="related-tools-heading"
        className="font-display text-xl font-semibold text-[oklch(0.24_0.05_255)]"
      >
        Explore more free tools
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link
              href={tool.href}
              className="block h-full rounded-2xl border border-[oklch(0.88_0.02_85)] bg-white/80 p-4 transition hover:border-[oklch(0.72_0.1_85/0.55)] hover:shadow-sm"
            >
              <span className="font-display text-base font-semibold text-[oklch(0.24_0.05_255)]">
                {tool.title}
              </span>
              <p className="mt-1 text-sm text-[oklch(0.42_0.03_255)]">
                {tool.shortDescription}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
