"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prepareOrder, type CheckoutState } from "@/lib/commerce/actions";
import { whatsappLink } from "@/lib/site";
import { formatBRL } from "@/lib/utils";

export function CheckoutClient({ whatsapp }: { whatsapp: string }) {
  const { items, ready } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(prepareOrder, {});
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const upfront = items.filter((item) => item.billingModel !== "subscription").reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const monthly = items.filter((item) => item.billingModel === "subscription").reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const payload = JSON.stringify(items.map((item) => ({ productId: item.productId, quantity: item.qty, variant: item.variant })));

  if (ready && items.length === 0 && !state.orderNumber) return <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><EmptyState icon={CreditCard} title="Nada para finalizar" description="Adicione itens ao carrinho antes de ir para o checkout." action={<Button asChild><Link href="/loja">Ver a loja</Link></Button>} /></div>;

  if (state.orderNumber) {
    const summary = `Olá! Registrei o pedido #${state.orderNumber} na MoveHaus e quero combinar o pagamento e a entrega.`;
    return <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><div className="rounded-xl border border-emerald-500/30 bg-mh-surface p-6 sm:p-8"><CheckCircle2 className="size-9 text-emerald-400" /><h1 className="mt-4 text-3xl font-semibold text-white">Pedido #{state.orderNumber} registrado</h1><p className="mt-3 leading-relaxed text-mh-muted">Os valores e a disponibilidade foram conferidos no servidor. Agora fale com a equipe para combinar o pagamento e a entrega.</p><div className="mt-5 rounded-lg bg-white/5 p-4 text-sm"><div className="flex justify-between"><span className="text-mh-muted">Pagamento único</span><strong className="text-white">{formatBRL(state.total ?? 0)}</strong></div>{Boolean(state.monthlyTotal) && <div className="mt-2 flex justify-between"><span className="text-mh-muted">Mensalidade</span><strong className="text-white">{formatBRL(state.monthlyTotal ?? 0)}/mês</strong></div>}</div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg"><a href={whatsappLink(summary, whatsapp)} target="_blank" rel="noopener noreferrer">Continuar no WhatsApp</a></Button><Button asChild variant="outline" size="lg"><Link href="/minha-area">Ver meus pedidos</Link></Button></div></div></div>;
  }

  return <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">Compra assistida</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Revisar e registrar pedido</h1><p className="mt-2 text-sm text-mh-muted">Nenhum pagamento será feito nesta etapa.</p><div className="mt-6 rounded-xl border border-mh-border bg-mh-surface p-5 sm:p-6"><ul className="space-y-3 text-sm">{items.map((item) => <li key={item.key} className="flex justify-between gap-4"><span className="text-mh-muted">{item.qty}× {item.name}</span><span className="text-white">{formatBRL(item.unitPrice * item.qty)}{item.billingModel === "subscription" && <span className="text-xs text-mh-muted">/mês</span>}</span></li>)}</ul><div className="mt-5 space-y-2 border-t border-mh-border pt-4 text-sm">{upfront > 0 && <div className="flex justify-between"><span className="text-mh-muted">Estimativa à vista</span><span className="font-semibold text-white">{formatBRL(upfront)}</span></div>}{monthly > 0 && <div className="flex justify-between"><span className="text-mh-muted">Estimativa mensal</span><span className="font-semibold text-white">{formatBRL(monthly)}/mês</span></div>}</div></div><form action={action} className="mt-5 rounded-xl border border-mh-red/25 bg-mh-surface p-5 sm:p-6"><input type="hidden" name="items" value={payload} /><input type="hidden" name="idempotency_key" value={idempotencyKey} /><label htmlFor="coupon" className="text-sm font-medium text-white">Cupom de desconto</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="coupon" name="coupon" autoCapitalize="characters" className="min-w-0 flex-1 rounded-lg border border-mh-border bg-mh-black px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-mh-red" placeholder="Código opcional" /><Button type="submit" disabled={pending || !ready}>{pending ? "Validando..." : "Registrar pedido"}</Button></div>{state.error && <p role="alert" className="mt-3 text-sm text-mh-red-soft">{state.error}</p>}<p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mh-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />Preço, promoção, estoque e cupom serão conferidos no servidor. Depois, a equipe conclui o atendimento pelo WhatsApp.</p></form></div>;
}
