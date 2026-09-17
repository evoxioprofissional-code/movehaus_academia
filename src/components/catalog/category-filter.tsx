import Link from "next/link";
import type { Category } from "@/types/catalog";
import { cn } from "@/lib/utils";

/** Chips de categoria. Preserva a busca ativa (q) ao trocar de categoria. */
export function CategoryFilter({
  basePath,
  categories,
  active,
  query,
}: {
  basePath: string;
  categories: Category[];
  active?: string;
  query?: string;
}) {
  const build = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("categoria", slug);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const chip = (label: string, slug: string | undefined, isActive: boolean) => (
    <Link
      key={slug ?? "all"}
      href={build(slug)}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "border-mh-red bg-mh-red/10 text-white"
          : "border-mh-border text-mh-muted hover:border-mh-red/60 hover:text-white",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {chip("Tudo", undefined, !active)}
      {categories.map((c) => chip(c.name, c.slug, active === c.slug))}
    </div>
  );
}
