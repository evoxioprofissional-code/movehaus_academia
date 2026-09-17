"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
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
        "absolute bottom-3 right-3 z-20 grid size-10 place-items-center rounded-full shadow-soft transition-all",
        "opacity-100 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100",
        "focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red",
        added ? "bg-emerald-500 text-white" : "bg-white text-mh-black hover:bg-white/90",
      )}
    >
      {added ? <Check className="size-5" /> : <Plus className="size-5" />}
    </button>
  );
}
