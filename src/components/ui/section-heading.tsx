import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  description,
  href,
  linkLabel = "Ver tudo",
  tone = "dark",
}: {
  kicker?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  tone?: "dark" | "paper";
}) {
  const isPaper = tone === "paper";
  return (
    <div className="mb-7 flex items-end justify-between gap-6">
      <div>
        {kicker && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
            {kicker}
          </p>
        )}
        <h2
          className={cn(
            "text-2xl font-semibold tracking-tight sm:text-[32px]",
            isPaper ? "text-mh-paper-ink" : "text-white",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-2 max-w-xl text-sm sm:text-base",
              isPaper ? "text-mh-paper-muted" : "text-mh-muted",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group hidden shrink-0 items-center gap-1.5 text-sm font-medium transition-colors sm:inline-flex",
            isPaper
              ? "text-mh-paper-ink hover:text-mh-red"
              : "text-mh-muted hover:text-white",
          )}
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
