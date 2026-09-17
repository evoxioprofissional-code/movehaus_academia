import { cn, formatBRL } from "@/lib/utils";
import { hasBilling, isPhysical, type Product } from "@/types/catalog";

/** Exibe o preço de um produto respeitando tipo e modelo de cobrança. */
export function Price({
  product,
  className,
  size = "md",
}: {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const main = {
    sm: "text-[15px]",
    md: "text-lg",
    lg: "text-[28px]",
  }[size];

  const value = "font-semibold tabular-nums text-white";

  if (isPhysical(product)) {
    const onSale =
      product.compareAtPrice && product.compareAtPrice > product.price;
    return (
      <div className={cn("flex items-baseline gap-2", className)}>
        <span className={cn(value, main)}>{formatBRL(product.price)}</span>
        {onSale && (
          <span className="text-sm text-mh-muted line-through">
            {formatBRL(product.compareAtPrice!)}
          </span>
        )}
      </div>
    );
  }

  if (hasBilling(product) && product.billingModel === "subscription") {
    return (
      <div className={cn("flex items-baseline gap-1", className)}>
        <span className={cn(value, main)}>
          {formatBRL(product.monthlyPrice ?? 0)}
        </span>
        <span className="text-sm text-mh-muted">/mês</span>
      </div>
    );
  }

  // pagamento único (digital / ebook)
  const price = hasBilling(product) ? (product.price ?? 0) : 0;
  return (
    <span className={cn(value, main, className)}>{formatBRL(price)}</span>
  );
}
