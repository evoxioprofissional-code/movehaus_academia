import { PhotoSlot } from "@/components/ui/photo-slot";
import type { Product } from "@/types/catalog";

/**
 * Mídia do produto. Usa a foto cadastrada (product.images[0]) e, enquanto não
 * houver, um placeholder fotográfico de marca — sem ícones.
 */
export function ProductMedia({
  product,
  className,
  priority,
  sizes,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <PhotoSlot
      src={product.images?.[0] ?? null}
      alt={product.name}
      tone={product.type === "ebook" ? "red" : "dark"}
      priority={priority}
      sizes={sizes ?? "(max-width: 640px) 50vw, 320px"}
      className={className}
    />
  );
}
