"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasBilling, isPhysical, type Product } from "@/types/catalog";

export function AddToCart({ product }: { product: Product }) {
  const { addProduct } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const physical = isPhysical(product);
  const soldOut = physical && product.stock <= 0;
  const variants = physical ? (product.variants ?? []) : [];
  const missingVariant = variants.some((v) => !selected[v.label]);

  const subscription =
    hasBilling(product) && product.billingModel === "subscription";
  const label = subscription ? "Assinar agora" : "Adicionar ao carrinho";

  function handleAdd() {
    if (soldOut || missingVariant) return;
    const times = physical ? qty : 1;
    for (let i = 0; i < times; i++) {
      addProduct(product, physical ? selected : undefined);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-5">
      {variants.map((v) => (
        <div key={v.label}>
          <p className="mb-2 text-sm font-medium text-white">{v.label}</p>
          <div className="flex flex-wrap gap-2">
            {v.options.map((opt) => {
              const active = selected[v.label] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setSelected((s) => ({ ...s, [v.label]: opt }))
                  }
                  className={cn(
                    "min-w-11 rounded-mh border px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-mh-red bg-mh-red/10 text-white"
                      : "border-mh-border text-mh-muted hover:border-mh-red/60 hover:text-white",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {physical && !soldOut && (
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-white">Quantidade</p>
          <div className="flex items-center gap-1 rounded-mh border border-mh-border">
            <button
              type="button"
              aria-label="Diminuir"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-10 place-items-center text-mh-muted hover:text-white"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Aumentar"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="grid size-10 place-items-center text-mh-muted hover:text-white"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          onClick={handleAdd}
          disabled={soldOut || missingVariant}
          className="min-w-56"
        >
          {added ? (
            <>
              <Check className="size-4" />
              Adicionado
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              {soldOut ? "Esgotado" : label}
            </>
          )}
        </Button>
        {added && (
          <Button asChild variant="outline" size="lg">
            <Link href="/carrinho">Ir para o carrinho</Link>
          </Button>
        )}
      </div>

      {missingVariant && !soldOut && (
        <p className="text-sm text-mh-muted">
          Selecione {variants.map((v) => v.label.toLowerCase()).join(" e ")} para
          continuar.
        </p>
      )}
    </div>
  );
}
