"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { isPhysical, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

/**
 * Compra rápida no card. Só aparece para itens adicionáveis direto
 * (digitais, e-books e físicos sem variação). Físicos com tamanho abrem a
 * página do produto pelo link do card.
 */
export function QuickAdd({ product }: { product: Product }) {
  const { addProduct } = useCart();
  const [added, setAdded] = useState(false);

  const soldOut = isPhysical(product) && product.stock <= 0;
  const hasVariants =
    isPhysical(product) && (product.variants?.length ?? 0) > 0;
  if (soldOut || hasVariants) return null;

  return (
    <button
      type="button"
      aria-label={`Adicionar ${product.name} ao carrinho`}
      onClick={(e) => {
        e.preventDefault();
        addProduct(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className={cn(
        "relative z-20 grid size-9 place-items-center rounded-md border transition-colors",
        "" ,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red",
        added ? "border-emerald-500 bg-emerald-500 text-white" : "border-white/25 bg-transparent text-white hover:border-mh-red hover:bg-mh-red",
      )}
    >
      {added ? <Check className="size-5" /> : <ShoppingCart className="size-4" />}
    </button>
  );
}
