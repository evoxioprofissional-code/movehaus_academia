"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatBRL } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";

export default function CheckoutPage() {
  const { items, ready } = useCart();

  const upfront = items
    .filter((i) => i.billingModel !== "subscription")
    .reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const monthly = items
    .filter((i) => i.billingModel === "subscription")
    .reduce((s, i) => s + i.unitPrice * i.qty, 0);

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={CreditCard}
          title="Nada para finalizar"
          description="Adicione itens ao carrinho antes de ir para o checkout."
          action={
            <Button asChild>
              <Link href="/loja">Ver a loja</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const resumo = items
    .map((i) => `• ${i.qty}x ${i.name}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
        Finalizar compra
      </h1>

      <div className="mt-6 rounded-mh border border-mh-border bg-mh-surface p-6">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
          Resumo do pedido
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-4">
              <span className="text-mh-muted">
                {i.qty}× {i.name}
              </span>
              <span className="text-white">
                {formatBRL(i.unitPrice * i.qty)}
                {i.billingModel === "subscription" && (
                  <span className="text-xs text-mh-muted">/mês</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-mh-border pt-4 text-sm">
          {upfront > 0 && (
            <div className="flex justify-between">
              <span className="text-mh-muted">Total à vista</span>
              <span className="font-semibold text-white">{formatBRL(upfront)}</span>
            </div>
          )}
          {monthly > 0 && (
            <div className="flex justify-between">
              <span className="text-mh-muted">Assinaturas</span>
              <span className="font-semibold text-white">
                {formatBRL(monthly)}/mês
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-mh border border-mh-border bg-[radial-gradient(90%_140%_at_0%_0%,rgba(229,18,28,0.12),transparent)] p-6">
        <p className="text-sm text-mh-muted">
          O pagamento online por Pix e cartão está sendo ativado. Por enquanto,
          conclua seu pedido pelo WhatsApp — é rápido e seguro.
        </p>
        <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
          <a
            href={whatsappLink(
              `Olá! Quero finalizar meu pedido na MoveHaus:\n${resumo}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Finalizar pelo WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
