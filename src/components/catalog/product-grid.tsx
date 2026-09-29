import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { Product } from "@/types/catalog";

export function ProductGrid({
  products,
  priorityCount = 0,
  reveal = false,
}: {
  products: Product[];
  priorityCount?: number;
  /** Entrada com stagger discreto (usar só em vitrines pontuais). */
  reveal?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, i) =>
        reveal ? (
          <Reveal key={product.id} delay={Math.min(i, 6) * 70}>
            <ProductCard product={product} priority={i < priorityCount} />
          </Reveal>
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            priority={i < priorityCount}
          />
        ),
      )}
    </div>
  );
}
