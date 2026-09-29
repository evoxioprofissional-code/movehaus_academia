"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { count, ready } = useCart();
  return (
    <Link
      href="/carrinho"
      aria-label={`Carrinho${count ? ` — ${count} ${count === 1 ? "item" : "itens"}` : ""}`}
      className={`relative grid size-10 place-items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red active:scale-95 ${tone === "light" ? "text-mh-paper-ink hover:bg-black/[0.06]" : "text-mh-text hover:bg-white/5 hover:text-white"}`}
    >
      <ShoppingBag className="size-[22px]" strokeWidth={1.75} />
      {ready && count > 0 && (
        <span className={`absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-mh-red text-[11px] font-bold text-white ring-2 ${tone === "light" ? "ring-mh-paper" : "ring-mh-black"}`}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
