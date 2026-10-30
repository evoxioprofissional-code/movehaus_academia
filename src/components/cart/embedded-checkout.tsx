"use client";

import { useCallback, useEffect, useState, type ComponentProps, type ComponentType } from "react";
import { CheckCircle2, Copy, CreditCard, LoaderCircle, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkoutPaymentStatus, submitCheckoutPayment } from "@/lib/commerce/payment-actions";
import type { PaymentView } from "@/lib/commerce/payment-rules";
import { formatBRL } from "@/lib/utils";
import Image from "next/image";

type Recurring = { productId: string; name: string; amount: number };
type CardProps = ComponentProps<typeof import("@mercadopago/sdk-react").CardPayment>;

function CardForm({ publicKey, amount, email, onSubmit }: { publicKey: string; amount: number; email?: string; onSubmit: CardProps["onSubmit"] }) {
  const [Card, setCard] = useState<ComponentType<CardProps> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    import("@mercadopago/sdk-react").then((sdk) => {
      sdk.initMercadoPago(publicKey, { locale: "pt-BR" });
      if (!cancelled) setCard(() => sdk.CardPayment);
    }).catch(() => { if (!cancelled) setError("Não foi possível carregar o formulário. Atualize a página e tente novamente."); });
    return () => { cancelled = true; };
  }, [publicKey]);
  return <div className="mt-4">{error && <p role="alert" className="mb-3 text-sm text-mh-red-soft">{error}</p>}{Card ? <Card initialization={{ amount: amount / 100, payer: { email } }} customization={{ paymentMethods: { minInstallments: 1, maxInstallments: 1, types: { included: ["credit_card"] } }, visual: { style: { theme: "dark" }, hideFormTitle: true } }} onSubmit={onSubmit} onError={() => setError("Confira os campos do cartão. Se o formulário não carregar, atualize a página.")} /> : !error && <p className="flex items-center gap-2 text-sm text-mh-muted"><LoaderCircle className="size-4 animate-spin" />Carregando formulário protegido…</p>}</div>;
}

function PaymentPanel({ orderId, product, amount, publicKey, email }: { orderId: string; product?: Recurring; amount: number; publicKey: string; email?: string }) {
  const [view, setView] = useState<PaymentView>({ status: "ready" });
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState<"pix" | "card">(product ? "card" : "pix");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cardAttempt, setCardAttempt] = useState(0);
  const productId = product?.productId;

  const refresh = useCallback(async () => {
    try { const result = await checkoutPaymentStatus(orderId, productId); setView(result); setError(""); }
    catch { setError("Não foi possível consultar a confirmação. Tente novamente em instantes."); }
    finally { setChecking(false); }
  }, [orderId, productId]);

  useEffect(() => {
    let active = true;
    checkoutPaymentStatus(orderId, product?.productId).then((result) => { if (active) setView(result); }).catch(() => { if (active) setError("Não foi possível consultar o pagamento. Atualize a página antes de continuar."); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [orderId, product?.productId]);

  useEffect(() => {
    if (view.status !== "pending") return;
    let running = false;
    const interval = setInterval(async () => {
      if (running || document.hidden) return;
      running = true;
      try { await refresh(); } finally { running = false; }
    }, 8000);
    return () => clearInterval(interval);
  }, [view.status, refresh]);

  async function submit(card?: unknown) {
    if (busy || checking) return;
    if (product && !consent) { setError("Marque a autorização da cobrança mensal para continuar."); return; }
    setBusy(true); setError("");
    try {
      const result = await submitCheckoutPayment({ orderId, productId: product?.productId, method, card, consent });
      setView(result);
      if (result.status === "rejected") setCardAttempt((attempt) => attempt + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível processar. Confira o estado do pagamento antes de tentar novamente.");
      // Também recupera uma possível resposta perdida sem iniciar outra cobrança.
      try { setView(await checkoutPaymentStatus(orderId, product?.productId)); } catch { /* mantém a mensagem */ }
      setCardAttempt((attempt) => attempt + 1);
    } finally { setBusy(false); }
  }

  const completed = view.status === "approved" || view.status === "authorized";
  return <section className="rounded-xl border border-mh-border bg-mh-surface p-5 sm:p-6" aria-label={product ? `Assinar ${product.name}` : "Pagamento da compra"}>
    <h2 className="text-lg font-semibold text-white">{product ? product.name : "Pagamento da compra"}</h2>
    <p className="mt-1 text-2xl font-semibold text-white">{formatBRL(amount)}{product && <span className="text-base font-normal text-mh-muted">/mês</span>}</p>
    {checking ? <p className="mt-4 text-sm text-mh-muted">Consultando pagamento…</p> : completed ? <div role="status" className="mt-5 flex gap-3 text-emerald-300"><CheckCircle2 className="size-6 shrink-0" /><p className="text-sm">{view.message}</p></div> : <>
      {view.status === "pending" ? <div className="mt-5 space-y-4">
        <p role="status" className="text-sm text-mh-muted">{view.message ?? "Aguardando confirmação do pagamento."}</p>
        {view.qrImage && <div className="mx-auto w-fit rounded-xl bg-white p-3"><Image unoptimized src={`data:image/png;base64,${view.qrImage}`} alt="QR Code Pix para pagar este pedido" width={240} height={240} /></div>}
        {view.qrCode && <><label htmlFor="pix-code" className="block text-sm text-white">Pix Copia e Cola</label><textarea id="pix-code" readOnly value={view.qrCode} rows={3} className="w-full resize-none rounded-lg border border-mh-border bg-mh-black p-3 text-xs text-mh-text" /><Button className="w-full" onClick={async () => { try { await navigator.clipboard.writeText(view.qrCode!); setCopied(true); } catch { setError("Selecione e copie o código no campo acima."); } }}><Copy className="size-4" />{copied ? "Código copiado!" : "Copiar código Pix"}</Button><p className="text-sm text-mh-muted">Abra o aplicativo do seu banco e pague com o código. Esta página confirma automaticamente.</p></>}
        {view.expiresAt && <p className="text-xs text-mh-muted">Válido até {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(view.expiresAt))}.</p>}
        <Button variant="outline" onClick={refresh}>Verificar pagamento</Button>
      </div> : <>
        {view.status === "rejected" && <p role="alert" className="mt-4 text-sm text-mh-red-soft">{view.message ?? "Pagamento não concluído. Tente novamente."}</p>}
        {!product && <div className="mt-5 grid grid-cols-2 gap-2"><Button variant={method === "pix" ? "primary" : "outline"} disabled={busy} onClick={() => setMethod("pix")}><QrCode className="size-4" />Pix</Button><Button variant={method === "card" ? "primary" : "outline"} disabled={busy} onClick={() => setMethod("card")}><CreditCard className="size-4" />Cartão</Button></div>}
        {product && <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-mh-text"><input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 shrink-0 accent-red-600" /><span>Autorizo a cobrança de <strong>{formatBRL(amount)} por mês</strong> no cartão, a partir da adesão, até cancelar em Minha área. O acesso é renovado após cada pagamento confirmado.</span></label>}
        {method === "pix" ? <Button className="mt-5 w-full" disabled={busy || !publicKey} onClick={() => submit()}>{busy ? "Gerando Pix…" : "Gerar Pix"}</Button> : (!product || consent) && publicKey && <div className={busy ? "pointer-events-none opacity-60" : ""}><CardForm key={cardAttempt} publicKey={publicKey} amount={amount} email={email} onSubmit={async (data) => { await submit(data); }} /></div>}
      </>}
    </>}
    {!publicKey && <p role="alert" className="mt-4 text-sm text-mh-red-soft">Pagamento indisponível. Fale com a equipe para concluir.</p>}
    {error && <p role="alert" className="mt-4 text-sm text-mh-red-soft">{error}</p>}
    <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-mh-muted"><ShieldCheck className="size-4 shrink-0 text-emerald-400" />Pagamento protegido pelo Mercado Pago. Os dados do cartão são preenchidos no formulário seguro e não ficam salvos na MoveHaus.</p>
  </section>;
}

export function EmbeddedCheckout({ orderId, total, subscriptions, publicKey, email }: { orderId: string; total: number; subscriptions: Recurring[]; publicKey: string; email?: string }) {
  const [selected, setSelected] = useState(total > 0 ? "purchase" : subscriptions[0]?.productId ?? "");
  const product = subscriptions.find((item) => item.productId === selected);
  const options = [...(total > 0 ? [{ id: "purchase", name: "Compra avulsa", amount: total }] : []), ...subscriptions.map((item) => ({ id: item.productId, name: item.name, amount: item.amount }))];
  if (!options.length) return <p className="rounded-xl border border-emerald-500/30 p-5 text-emerald-300">Pedido confirmado. Nenhum pagamento necessário.</p>;
  return <div className="mt-6 space-y-4">{options.length > 1 && <><p className="text-sm text-mh-muted">Conclua o pagamento avulso e autorize cada assinatura abaixo, separadamente.</p><div className="flex flex-wrap gap-2">{options.map((option) => <Button key={option.id} variant={selected === option.id ? "primary" : "outline"} onClick={() => setSelected(option.id)}>{option.name}</Button>)}</div></>}<PaymentPanel key={selected} orderId={orderId} product={product} amount={product?.amount ?? total} publicKey={publicKey} email={email} /></div>;
}
