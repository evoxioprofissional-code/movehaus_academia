"use client";

import Link from "next/link";
import { useActionState, useRef, useEffect } from "react";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prepareOrder, type CheckoutState } from "@/lib/commerce/actions";
import { whatsappLink } from "@/lib/site";
import { EmbeddedCheckout } from "@/components/cart/embedded-checkout";
import { formatBRL } from "@/lib/utils";

export function CheckoutClient({ whatsapp, publicKey, initialState = {} }: { whatsapp: string; publicKey: string; initialState?: CheckoutState }) {
  const { items, ready } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(prepareOrder, initialState);
  const idempotencyInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (state.orderId) {
      const url = new URL(window.location.href);
      url.searchParams.set("order", state.orderId);
      window.history.replaceState(null, "", url);
    }
  }, [state.orderId]);
  const upfront = items.filter((item) => item.billingModel !== "subscription").reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const monthly = items.filter((item) => item.billingModel === "subscription").reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const payload = JSON.stringify(items.map((item) => ({ productId: item.productId, quantity: item.qty, variant: item.variant })));

  if (ready && items.length === 0 && !state.orderNumber) return <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><EmptyState icon={CreditCard} title="Nada para finalizar" description="Adicione itens ao carrinho antes de ir para o checkout." action={<Button asChild><Link href="/loja">Ver a loja</Link></Button>} /></div>;

  if (state.orderNumber && state.orderId) {
    const summary = `Olá! Preciso de ajuda com o pedido #${state.orderNumber} na MoveHaus.`;
    return <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <CheckCircle2 className="size-8 text-emerald-400" />
      <h1 className="mt-3 text-3xl font-semibold text-white">Pedido #{state.orderNumber}</h1>
      <p className="mt-2 text-sm text-mh-muted">Finalize seu pagamento aqui, sem sair da MoveHaus.</p>
      <EmbeddedCheckout orderId={state.orderId} total={state.total ?? 0} subscriptions={state.subscriptions ?? []} publicKey={publicKey} email={state.email} />
      <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/minha-area">Meus pedidos e assinaturas</Link></Button><Button asChild variant="ghost"><a href={whatsappLink(summary, whatsapp)} target="_blank" rel="noopener noreferrer">Preciso de ajuda</a></Button></div>
    </div>;
  }

  return <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">Finalizar compra</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Revisar e registrar pedido</h1><p className="mt-2 text-sm text-mh-muted">Escolha Pix ou cartão no próximo passo, aqui no site. Assinaturas têm cobrança automática mensal até o cancelamento.</p><div className="mt-6 rounded-xl border border-mh-border bg-mh-surface p-5 sm:p-6"><ul className="space-y-3 text-sm">{items.map((item) => <li key={item.key} className="flex justify-between gap-4"><span className="text-mh-muted">{item.qty}× {item.name}</span><span className="text-white">{formatBRL(item.unitPrice * item.qty)}{item.billingModel === "subscription" && <span className="text-xs text-mh-muted">/mês</span>}</span></li>)}</ul><div className="mt-5 space-y-2 border-t border-mh-border pt-4 text-sm">{upfront > 0 && <div className="flex justify-between"><span className="text-mh-muted">Estimativa à vista</span><span className="font-semibold text-white">{formatBRL(upfront)}</span></div>}{monthly > 0 && <div className="flex justify-between"><span className="text-mh-muted">Estimativa mensal</span><span className="font-semibold text-white">{formatBRL(monthly)}/mês</span></div>}</div></div><form action={action} onSubmit={() => { if (idempotencyInputRef.current && !idempotencyInputRef.current.value) idempotencyInputRef.current.value = crypto.randomUUID(); }} className="mt-5 rounded-xl border border-mh-red/25 bg-mh-surface p-5 sm:p-6"><input type="hidden" name="items" value={payload} /><input ref={idempotencyInputRef} type="hidden" name="idempotency_key" defaultValue="" /><label htmlFor="coupon" className="text-sm font-medium text-white">Cupom de desconto</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="coupon" name="coupon" autoCapitalize="characters" className="min-w-0 flex-1 rounded-lg border border-mh-border bg-mh-black px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-mh-red" placeholder="Código opcional" /><Button type="submit" disabled={pending || !ready}>{pending ? "Validando..." : "Continuar para pagamento"}</Button></div>{state.error && <p role="alert" className="mt-3 text-sm text-mh-red-soft">{state.error}</p>}<p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-mh-muted"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />Preço, promoção, estoque e cupom serão conferidos no servidor. Depois, pague com Pix ou cartão aqui no site. Mensalidades são cobradas automaticamente no cartão após sua autorização.</p></form></div>;
}
