import Link from "next/link";
import { ProductMedia } from "@/components/catalog/product-media";
import { QuickAdd } from "@/components/catalog/quick-add";
import { Price } from "@/components/catalog/price";
import { CATEGORIES } from "@/lib/catalog-data";
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
    <article className="group relative flex flex-col border-b border-white/10 pb-5 transition-colors duration-200 hover:border-mh-red/60">
      {/* Link que cobre o card inteiro */}
      <Link
        href={productHref(product)}
        aria-label={product.name}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red focus-visible:ring-offset-2 focus-visible:ring-offset-mh-black"
      />

      {/* Mídia */}
      <div className="relative overflow-hidden bg-mh-surface">
        <ProductMedia
          product={product}
          priority={priority}
          className={cn(
            "aspect-[4/5] transition-transform duration-300 ease-out group-hover:scale-[1.03]",
            soldOut && "opacity-60",
          )}
        />

        {/* Selos (não capturam clique) */}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {discount > 0 && (
            <span className="bg-mh-red px-2 py-0.5 text-[11px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-xs">
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
          <span className="pointer-events-none absolute right-2 top-2 bg-black/70 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
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
        <h3 className="mt-1 text-sm font-medium leading-snug text-white sm:text-[15px]">
          {product.name}
        </h3>
        <div className="mt-2 pt-0.5">
          <Price product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}
