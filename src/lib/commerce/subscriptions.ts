import "server-only";
import { randomUUID } from "node:crypto";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import { MercadoPagoError, mercadoPagoRequest, requirePaymentConfiguration } from "./mercadopago";
import type { CardInput, PaymentView } from "./payment-rules";
import { monthlyPeriodEnd, validMercadoPagoId } from "./subscription-rules";

type Preapproval = {
  id: string; status: string; init_point: string; external_reference: string;
  auto_recurring: { currency_id: string; transaction_amount: number; frequency: number; frequency_type: string };
};
type Invoice = {
  id: number; preapproval_id: string; currency_id: string; transaction_amount: number;
  debit_date: string; payment?: { id: number; status: string };
};


export async function readSubscription(userId: string, productId: string): Promise<PaymentView> {
  const admin = createAdminClient();
  const { data: local, error } = await admin.from("subscriptions").select("*").eq("user_id", userId).eq("product_id", productId).maybeSingle();
  if (error) throw new Error("Não foi possível consultar assinatura.");
  if (!local) return { status: "ready" };
  if (local.provider !== "mercadopago") return { status: "authorized", message: "Assinatura administrada pela equipe." };
  if (!local.provider_subscription_id) return { status: local.status === "cancelled" ? "cancelled" : "ready" };
  let id = local.provider_subscription_id;
  if (id.startsWith("creating:")) {
    const reference = id.slice(9);
    const result = await mercadoPagoRequest<{ results: Preapproval[] }>(`/preapproval/search?external_reference=${encodeURIComponent(reference)}`);
    const remote = result.results.find((item) => item.external_reference === reference);
    if (!remote) return { status: "pending", message: "Estamos confirmando sua assinatura. Aguarde antes de tentar novamente." };
    const { error: saveError } = await admin.from("subscriptions").update({ provider_subscription_id: remote.id }).eq("id", local.id).eq("provider_subscription_id", id);
    if (saveError) throw new Error("Não foi possível recuperar assinatura.");
    id = remote.id;
  }
  await syncSubscription(id);
  const remote = await mercadoPagoRequest<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);
  if (remote.status === "cancelled") return { status: "cancelled", message: "Assinatura cancelada. O período pago continua disponível até o vencimento." };
  if (remote.status === "authorized") return { status: "authorized", message: "Assinatura autorizada! O acesso é liberado após a confirmação da mensalidade." };
  if (remote.status === "paused") return { status: "pending", message: "Assinatura pausada. Consulte Minha área ou fale com a equipe." };
  return { status: "ready" };
}

export async function authorizeSubscription(input: { userId: string; email: string; orderId: string; productId: string; name: string; amount: number; card: CardInput }): Promise<PaymentView> {
  requirePaymentConfiguration();
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) throw new Error("Mensalidade inválida.");
  const admin = createAdminClient();
  const { data: found, error: readError } = await admin.from("subscriptions").select("*").eq("user_id", input.userId).eq("product_id", input.productId).maybeSingle();
  if (readError) throw new Error("Não foi possível consultar assinatura.");
  let local = found;
  if (!local) {
    const { data, error } = await admin.from("subscriptions").insert({ user_id: input.userId, product_id: input.productId, monthly_amount: input.amount, provider: "mercadopago" }).select("*").single();
    if (error || !data) return readSubscription(input.userId, input.productId);
    local = data;
  }
  if (local.provider !== "mercadopago") throw new Error("Esta assinatura é administrada pela equipe.");
  if (local.status === "cancelled" || local.status === "expired") {
    if (local.provider_subscription_id) {
      if (local.provider_subscription_id.startsWith("creating:")) return readSubscription(input.userId, input.productId);
      const previous = await mercadoPagoRequest<Preapproval>(`/preapproval/${encodeURIComponent(local.provider_subscription_id)}`);
      if (previous.status !== "cancelled") throw new Error("Cancele o contrato anterior antes de assinar novamente.");
    }
    let reset = admin.from("subscriptions").update({ provider_subscription_id: null, status: "pending", cancelled_at: null, monthly_amount: input.amount }).eq("id", local.id).eq("status", local.status);
    reset = local.provider_subscription_id ? reset.eq("provider_subscription_id", local.provider_subscription_id) : reset.is("provider_subscription_id", null);
    const { data: updated, error } = await reset.select("*").maybeSingle();
    if (error || !updated) throw new Error("Assinatura em atualização. Tente novamente.");
    local = updated;
  }
  if (local.provider_subscription_id) return readSubscription(input.userId, input.productId);
  if (local.monthly_amount !== input.amount) throw new Error("O valor da assinatura mudou. Fale com a equipe.");
  const reference = `${input.orderId}:${local.id}`;
  const { data: claimed, error: claimError } = await admin.from("subscriptions").update({ provider_subscription_id: `creating:${reference}` }).eq("id", local.id).eq("status", "pending").is("provider_subscription_id", null).select("id").maybeSingle();
  if (claimError || !claimed) return readSubscription(input.userId, input.productId);
  let remote: Preapproval;
  try {
    remote = await mercadoPagoRequest<Preapproval>("/preapproval", { method: "POST", body: {
      reason: `MoveHaus — ${input.name}`.slice(0, 255), external_reference: reference,
      payer_email: input.email, card_token_id: input.card.token, status: "authorized",
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: input.amount / 100, currency_id: "BRL" },
      back_url: new URL("/minha-area", publicEnv.siteUrl).href,
    } });
  } catch (error) {
    if (error instanceof MercadoPagoError && [400, 401, 403, 404, 422].includes(error.status)) {
      await admin.from("subscriptions").update({ provider_subscription_id: null }).eq("id", local.id).eq("provider_subscription_id", `creating:${reference}`);
    }
    throw error;
  }
  const { error: saveError } = await admin.from("subscriptions").update({ provider_subscription_id: remote.id }).eq("id", local.id).eq("provider_subscription_id", `creating:${reference}`);
  if (saveError) throw new Error("Autorização recebida. Aguarde a confirmação antes de tentar novamente.");
  return readSubscription(input.userId, input.productId);
}

export async function syncSubscription(id: string, invoiceId?: string) {
  if (!validMercadoPagoId(id)) throw new Error("Assinatura inválida.");
  const remote = await mercadoPagoRequest<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);
  const [orderId, subscriptionId] = String(remote.external_reference ?? "").split(":");
  if (!/^[a-f0-9-]{36}$/i.test(subscriptionId ?? "") || !/^[a-f0-9-]{36}$/i.test(orderId ?? "")) return;
  const admin = createAdminClient();
  const { data: local, error } = await admin.from("subscriptions").select("*").eq("id", subscriptionId).eq("provider", "mercadopago").maybeSingle();
  if (error) throw new Error("Não foi possível consultar assinatura.");
  if (!local) return;
  if (local.provider_subscription_id !== id && local.provider_subscription_id !== `creating:${remote.external_reference}`) return;
  const { data: order, error: orderError } = await admin.from("orders").select("id,customer_id,total").eq("id", orderId).maybeSingle();
  if (orderError) throw new Error("Não foi possível consultar pedido.");
  if (!order || order.customer_id !== local.user_id) throw new Error("Pedido incompatível.");
  if (remote.auto_recurring.currency_id !== "BRL" || Math.round(Number(remote.auto_recurring.transaction_amount) * 100) !== local.monthly_amount || remote.auto_recurring.frequency !== 1 || remote.auto_recurring.frequency_type !== "months") throw new Error("Contrato incompatível.");
  if (remote.status === "cancelled" || remote.status === "paused") {
    const { error: updateError } = await admin.from("subscriptions").update({ provider_subscription_id: id, status: remote.status === "cancelled" ? "cancelled" : "past_due", ...(remote.status === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}) }).eq("id", local.id);
    if (updateError) throw new Error("Não foi possível atualizar assinatura.");
    // O período já pago continua disponível até expires_at.
    return;
  }
  if (remote.status !== "authorized" || local.status === "cancelled") return;
  const invoices = invoiceId
    ? [await mercadoPagoRequest<Invoice>(`/authorized_payments/${encodeURIComponent(invoiceId)}`)]
    : (await mercadoPagoRequest<{ results: Invoice[] }>(`/authorized_payments/search?preapproval_id=${encodeURIComponent(id)}&limit=100`)).results;
  const paid = invoices.filter((invoice) => invoice.preapproval_id === id && invoice.payment?.status === "approved" && invoice.currency_id === "BRL" && Math.round(Number(invoice.transaction_amount) * 100) === local.monthly_amount && Number.isFinite(Date.parse(invoice.debit_date)))
    .sort((a, b) => Date.parse(b.debit_date) - Date.parse(a.debit_date))[0];
  // Autorização do cartão não equivale a uma mensalidade paga.
  if (!paid) return;
  const end = monthlyPeriodEnd(paid.debit_date);
  const { error: paymentError } = await admin.from("payments").upsert({ order_id: orderId, provider: "mercadopago", provider_payment_id: String(paid.payment!.id), status: "approved", amount: local.monthly_amount, method: "subscription", idempotency_key: `mercadopago:subscription:${paid.id}` }, { onConflict: "idempotency_key" });
  if (paymentError) throw new Error("Não foi possível registrar mensalidade.");
  const { error: periodError } = await admin.from("subscriptions").update({ provider_subscription_id: id, status: Date.parse(end) > Date.now() ? "active" : "past_due", current_period_start: paid.debit_date, current_period_end: end }).eq("id", local.id).neq("status", "cancelled").or(`current_period_end.is.null,current_period_end.lte.${end}`);
  if (periodError) throw new Error("Não foi possível atualizar período.");
  const { error: accessInsertError } = await admin.from("digital_access").upsert({ id: randomUUID(), user_id: local.user_id, product_id: local.product_id, order_id: orderId, subscription_id: local.id, permanent: false, expires_at: end }, { onConflict: "user_id,product_id", ignoreDuplicates: true });
  if (accessInsertError) throw new Error("Não foi possível liberar acesso.");
  const { error: accessError } = await admin.from("digital_access").update({ status: "active", expires_at: end, subscription_id: local.id }).eq("user_id", local.user_id).eq("product_id", local.product_id).eq("permanent", false).or(`expires_at.is.null,expires_at.lt.${end}`);
  if (accessError) throw new Error("Não foi possível renovar acesso.");
  if (order.total === 0) {
    const { data: items, error: itemsError } = await admin.from("order_items").select("product_id").eq("order_id", orderId);
    const { data: subs, error: subsError } = await admin.from("subscriptions").select("product_id,current_period_end").eq("user_id", local.user_id);
    if (itemsError || subsError) throw new Error("Não foi possível confirmar pedido.");
    if (items?.length && items.every((item) => subs?.some((sub) => sub.product_id === item.product_id && sub.current_period_end && Date.parse(sub.current_period_end) > Date.now()))) {
      const { error: confirmError } = await admin.from("orders").update({ payment_status: "approved", payment_method: "mercadopago_subscription" }).eq("id", orderId).eq("payment_status", "pending");
      if (confirmError) throw new Error("Não foi possível confirmar pedido.");
    }
  }
}

export async function syncSubscriptionInvoice(id: string) {
  const invoice = await mercadoPagoRequest<Invoice>(`/authorized_payments/${encodeURIComponent(id)}`);
  await syncSubscription(invoice.preapproval_id, id);
}
