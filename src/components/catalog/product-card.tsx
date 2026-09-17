import Link from "next/link";
import { ProductMedia } from "@/components/catalog/product-media";
import { QuickAdd } from "@/components/catalog/quick-add";
import { Price } from "@/components/catalog/price";
import { CATEGORIES } from "@/lib/catalog";
import { isPhysical, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function productHref(product: Product): string {
  return product.type === "ebook"
    ? `/ebooks/${product.slug}`
    : `/loja/${product.slug}`;
}

function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? "";
}

const TYPE_LABEL: Partial<Record<Product["type"], string>> = {
  digital: "Programa",
  ebook: "E-book",
};

export function ProductCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const soldOut = isPhysical(product) && product.stock <= 0;
  const onSale =
    isPhysical(product) &&
    product.compareAtPrice &&
    product.compareAtPrice > product.price;
  const discount =
    onSale && isPhysical(product)
      ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
      : 0;
  const typeLabel = TYPE_LABEL[product.type];

  return (
    <article className="group relative flex flex-col">
      {/* Link que cobre o card inteiro */}
      <Link
        href={productHref(product)}
        aria-label={product.name}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red focus-visible:ring-offset-2 focus-visible:ring-offset-mh-black"
      />

      {/* Mídia */}
      <div className="relative overflow-hidden rounded-lg bg-mh-surface">
        <ProductMedia
          product={product}
          priority={priority}
          className={cn(
            "aspect-[4/5] transition-transform duration-300 ease-out group-hover:scale-[1.03]",
            soldOut && "opacity-60",
          )}
        />

        {/* Selos (não capturam clique) */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="rounded-md bg-mh-red px-2 py-0.5 text-xs font-semibold text-white">
              -{discount}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
              Esgotado
            </span>
          )}
        </div>

        {typeLabel && (
          <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white/90 backdrop-blur">
            {typeLabel}
          </span>
        )}

        <QuickAdd product={product} />
      </div>

      {/* Texto (clique passa para o link do card) */}
      <div className="pointer-events-none mt-3 flex flex-1 flex-col">
        <span className="text-[11px] font-medium uppercase tracking-widest text-mh-muted">
          {categoryName(product.categorySlug)}
        </span>
        <h3 className="mt-1 text-[15px] font-medium leading-snug text-white">
          {product.name}
        </h3>
        <div className="mt-2 pt-0.5">
          <Price product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}
