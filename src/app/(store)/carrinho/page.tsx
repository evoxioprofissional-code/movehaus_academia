"use client";

import Link from "next/link";
import {
  BookOpen,
  Dumbbell,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Shirt,
  Trash2,
} from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/utils";

const ICON: Record<string, typeof Package> = {
  vestuario: Shirt,
  acessorios: Package,
  programas: Dumbbell,
  nutricao: BookOpen,
};

function variantText(variant?: Record<string, string>) {
  if (!variant) return null;
  return Object.entries(variant)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export default function CarrinhoPage() {
  const { items, ready, setQty, remove } = useCart();

  const monthly = items.filter((i) => i.billingModel === "subscription");
  const upfront = items.filter((i) => i.billingModel !== "subscription");
  const upfrontTotal = upfront.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const monthlyTotal = monthly.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
        Carrinho
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Seu carrinho está vazio"
          description="Explore a loja e adicione produtos para continuar."
          action={
            <Button asChild>
              <Link href="/loja">Ver a loja</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          {/* Itens */}
          <ul className="space-y-3">
            {items.map((item) => (
              <CartRow
                key={item.key}
                item={item}
                onQty={setQty}
                onRemove={remove}
              />
            ))}
          </ul>

          {/* Resumo */}
          <aside className="h-fit rounded-mh border border-mh-border bg-mh-surface p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
              Resumo
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              {upfront.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-mh-muted">Total à vista</dt>
                  <dd className="font-semibold text-white">
                    {formatBRL(upfrontTotal)}
                  </dd>
                </div>
              )}
              {monthly.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-mh-muted">Assinaturas</dt>
                  <dd className="font-semibold text-white">
                    {formatBRL(monthlyTotal)}/mês
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-3 text-xs text-mh-muted">
              O frete de produtos físicos é calculado no checkout.
            </p>

            <Button asChild size="lg" className="mt-5 w-full">
              <Link href="/checkout">Finalizar compra</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
              <Link href="/loja">Continuar comprando</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}

function CartRow({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}) {
  const Icon = ICON[item.categorySlug] ?? Package;
  const isSub = item.billingModel === "subscription";
  const physical = item.type === "physical";
  const vt = variantText(item.variant);

  return (
    <li className="flex gap-4 rounded-mh border border-mh-border bg-mh-surface p-4">
      <div className="grid size-20 shrink-0 place-items-center rounded-md border border-mh-border bg-[radial-gradient(120%_120%_at_50%_0%,#1c1c1f,#0a0a0b)]">
        <Icon className="size-7 text-mh-border" strokeWidth={1.5} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={
                item.type === "ebook"
                  ? `/ebooks/${item.slug}`
                  : `/loja/${item.slug}`
              }
              className="font-display font-semibold uppercase tracking-wide text-white hover:text-mh-red-soft"
            >
              {item.name}
            </Link>
            {vt && <p className="text-xs text-mh-muted">{vt}</p>}
          </div>
          <button
            type="button"
            aria-label="Remover item"
            onClick={() => onRemove(item.key)}
            className="grid size-8 place-items-center rounded-md text-mh-muted hover:text-mh-red-soft"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {physical ? (
            <div className="flex items-center gap-1 rounded-md border border-mh-border">
              <button
                type="button"
                aria-label="Diminuir"
                onClick={() => onQty(item.key, item.qty - 1)}
                className="grid size-8 place-items-center text-mh-muted hover:text-white"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-white">
                {item.qty}
              </span>
              <button
                type="button"
                aria-label="Aumentar"
                onClick={() => onQty(item.key, item.qty + 1)}
                className="grid size-8 place-items-center text-mh-muted hover:text-white"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-mh-muted">Acesso digital</span>
          )}

          <span className="font-display font-bold text-white">
            {formatBRL(item.unitPrice * item.qty)}
            {isSub && <span className="text-xs font-normal text-mh-muted">/mês</span>}
          </span>
        </div>
      </div>
    </li>
  );
}
