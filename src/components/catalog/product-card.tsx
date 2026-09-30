import Link from "next/link";
import { ProductMedia } from "@/components/catalog/product-media";
import { QuickAdd } from "@/components/catalog/quick-add";
import { Price } from "@/components/catalog/price";
import { CATEGORIES } from "@/lib/catalog-data";
import { isPhysical, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function productHref(product: Product): string {
  return product.type === "ebook" ? "/ebooks/" + product.slug : "/loja/" + product.slug;
}

function categoryName(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? "";
}

const TYPE_LABEL: Partial<Record<Product["type"], string>> = { digital: "Programa", ebook: "Conteúdo" };

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const soldOut = isPhysical(product) && product.stock <= 0;
  const onSale = isPhysical(product) && product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = onSale && isPhysical(product) ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;
  const typeLabel = TYPE_LABEL[product.type];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#121316] transition-colors duration-200 hover:border-white/20">
      <Link href={productHref(product)} aria-label={product.name} className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red" />
      <div className="relative overflow-hidden bg-[#17181c]">
        <ProductMedia product={product} priority={priority} className={cn("aspect-[4/5] transition-transform duration-300 ease-out group-hover:scale-[1.03]", soldOut && "opacity-60")} />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {discount > 0 && <span className="bg-mh-red px-2.5 py-1 text-[11px] font-semibold text-white">-{discount}%</span>}
          {soldOut && <span className="rounded bg-black/75 px-2 py-1 text-[10px] font-medium text-white">Esgotado</span>}
        </div>
        {typeLabel && <span className="pointer-events-none absolute right-2 top-2 bg-black/75 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">{typeLabel}</span>}
      </div>
      <div className="pointer-events-none flex flex-1 flex-col p-3.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-mh-muted">{categoryName(product.categorySlug)}</span>
        <h3 className="mt-1.5 min-h-10 text-sm font-semibold leading-snug text-white">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3"><Price product={product} size="sm" /><div className="pointer-events-auto relative z-20"><QuickAdd product={product} /></div></div>
      </div>
    </article>
  );
}
