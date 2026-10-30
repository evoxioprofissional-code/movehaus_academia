import "server-only";
import { randomUUID } from "node:crypto";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";
import { MercadoPagoError, mercadoPagoRequest, requirePaymentConfiguration } from "./mercadopago";
import { recurringMetadata, type CardInput, type PaymentView } from "./payment-rules";
import type { Database, PaymentStatus } from "@/types/database";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Payment = {
  id: number; status: string; external_reference: string; currency_id: string; transaction_amount: number;
  date_approved?: string; payment_method_id?: string; date_of_expiration?: string;
  metadata?: { checkout_attempt?: string };
  point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
};

function paymentView(payment: Payment): PaymentView {
  const status = payment.status === "approved" ? "approved" : ["rejected", "cancelled", "refunded", "charged_back"].includes(payment.status) ? "rejected" : "pending";
  const pix = payment.point_of_interaction?.transaction_data;
  return { status, qrCode: pix?.qr_code, qrImage: pix?.qr_code_base64, expiresAt: payment.date_of_expiration,
    message: status === "approved" ? "Pagamento confirmado!" : status === "rejected" ? "Pagamento não concluído. Confira os dados e tente novamente." : "Aguardando a confirmação do pagamento." };
}

export async function grantOrderAccess(orderId: string, paidAt: string) {
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("customer_id").eq("id", orderId).single();
  const { data: items, error: itemError } = await admin.from("order_items").select("product_id,metadata").eq("order_id", orderId);
  if (error || itemError || !order?.customer_id || !items) throw new Error("Não foi possível liberar os conteúdos.");
  for (const item of items) {
    if (!item.product_id || recurringMetadata(item.metadata)) continue;
    const { data: product, error: productError } = await admin.from("products").select("type,access_duration_days").eq("id", item.product_id).single();
    if (productError) throw new Error("Não foi possível consultar o conteúdo.");
    if (!product || product.type === "physical") continue;
    const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata) ? item.metadata : {};
    const days = "access_duration_days" in metadata ? metadata.access_duration_days : product.access_duration_days;
    const permanent = days == null;
    const end = permanent ? null : new Date(Date.parse(paidAt) + Number(days) * 86400000).toISOString();
    const { error: insertError } = await admin.from("digital_access").upsert({ user_id: order.customer_id, product_id: item.product_id, order_id: orderId, permanent, expires_at: end, reason: "Pagamento confirmado" }, { onConflict: "user_id,product_id", ignoreDuplicates: true });
    if (insertError) throw new Error("Não foi possível liberar conteúdo.");
    let update = admin.from("digital_access").update({ status: "active", permanent, expires_at: end }).eq("user_id", order.customer_id).eq("product_id", item.product_id).eq("permanent", false);
    if (end) update = update.or(`expires_at.is.null,expires_at.lt.${end}`);
    const { error: updateError } = await update;
    if (updateError) throw new Error("Não foi possível renovar conteúdo.");
  }
}

export async function syncPayment(id: string): Promise<PaymentView> {
  const payment = await mercadoPagoRequest<Payment>(`/v1/payments/${encodeURIComponent(id)}`);
  if (!/^[a-f0-9-]{36}$/i.test(String(payment.external_reference))) return paymentView(payment);
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("*").eq("id", payment.external_reference).maybeSingle();
  if (error) throw new Error("Não foi possível consultar o pedido.");
  if (!order || payment.currency_id !== "BRL" || Math.round(Number(payment.transaction_amount) * 100) !== order.total) throw new Error("O pagamento não corresponde ao pedido.");
  const status: PaymentStatus = payment.status === "approved" ? "approved" : ["refunded", "charged_back"].includes(payment.status) ? "refunded" : ["rejected", "cancelled"].includes(payment.status) ? "failed" : "pending";
  const { error: receiptError } = await admin.from("payments").upsert({ order_id: order.id, provider: "mercadopago", provider_payment_id: String(payment.id), status, amount: order.total, method: payment.payment_method_id, idempotency_key: `mercadopago:receipt:${payment.id}` }, { onConflict: "idempotency_key" });
  if (receiptError) throw new Error("Não foi possível registrar o pagamento.");
  const { error: slotError } = await admin.from("payments").update({ status }).eq("idempotency_key", `mercadopago:checkout:${order.id}`).eq("provider_payment_id", String(payment.id));
  if (slotError) throw new Error("Não foi possível atualizar o pagamento.");
  if (status === "approved") {
    const { error: updateError } = await admin.from("orders").update({ payment_status: "approved", payment_method: payment.payment_method_id ?? "mercadopago" }).eq("id", order.id).eq("payment_status", "pending");
    if (updateError) throw new Error("Não foi possível confirmar o pedido.");
    if (!["refunded", "cancelled"].includes(order.payment_status)) await grantOrderAccess(order.id, payment.date_approved ?? new Date().toISOString());
  }
  return paymentView(payment);
}

export async function readOrderPayment(order: Order): Promise<PaymentView> {
  if (order.payment_status === "approved") return { status: "approved", message: "Pagamento confirmado!" };
  const admin = createAdminClient();
  const { data: slot, error } = await admin.from("payments").select("*").eq("idempotency_key", `mercadopago:checkout:${order.id}`).maybeSingle();
  if (error) throw new Error("Não foi possível consultar pagamento.");
  if (!slot) return { status: "ready" };
  if (slot.provider_payment_id) return syncPayment(slot.provider_payment_id);
  if (slot.status === "failed") return { status: "rejected" };
  // Recuperação de resposta perdida: nunca inicia outra cobrança sem confirmar a anterior.
  const search = await mercadoPagoRequest<{ results: Payment[] }>(`/v1/payments/search?external_reference=${encodeURIComponent(order.id)}&sort=date_created&criteria=desc&limit=10`);
  const payload = slot.provider_payload && typeof slot.provider_payload === "object" && !Array.isArray(slot.provider_payload) ? slot.provider_payload : {};
  const recovered = search.results.find((item) => item.external_reference === order.id && item.currency_id === "BRL" && item.metadata?.checkout_attempt === payload.attemptId && Math.round(Number(item.transaction_amount) * 100) === order.total);
  if (!recovered) return { status: "pending", message: "Estamos confirmando a solicitação. Aguarde antes de tentar novamente." };
  const { error: saveError } = await admin.from("payments").update({ provider_payment_id: String(recovered.id) }).eq("id", slot.id).is("provider_payment_id", null);
  if (saveError) throw new Error("Não foi possível recuperar pagamento.");
  return syncPayment(String(recovered.id));
}

export async function chargeOrder(order: Order, card?: CardInput): Promise<PaymentView> {
  requirePaymentConfiguration();
  if (!Number.isSafeInteger(order.total) || order.total <= 0 || order.payment_status !== "pending" || order.status === "cancelled") throw new Error("Este pedido não está disponível para pagamento.");
  if (!order.customer_email) throw new Error("Confirme seu e-mail antes de pagar.");
  const admin = createAdminClient();
  const slotKey = `mercadopago:checkout:${order.id}`;
  const attemptId = randomUUID();
  const { data: inserted, error: insertError } = await admin.from("payments").insert({ order_id: order.id, provider: "mercadopago", amount: order.total, status: "pending", idempotency_key: slotKey, provider_payload: { attemptId } }).select("id").maybeSingle();
  let claimed = Boolean(inserted);
  if (insertError && insertError.code !== "23505") throw new Error("Não foi possível preparar o pagamento.");
  if (!claimed) {
    const current = await readOrderPayment(order);
    if (current.status !== "rejected") return current;
    const { data, error } = await admin.from("payments").update({ status: "pending", provider_payment_id: null, provider_payload: { attemptId } }).eq("idempotency_key", slotKey).eq("status", "failed").select("id").maybeSingle();
    if (error) throw new Error("Não foi possível preparar outra tentativa.");
    claimed = Boolean(data);
  }
  if (!claimed) return { status: "pending", message: "Pagamento em processamento." };
  let payment: Payment;
  try {
    payment = await mercadoPagoRequest<Payment>("/v1/payments", { method: "POST", idempotencyKey: attemptId, body: {
      transaction_amount: order.total / 100, description: `MoveHaus — Pedido #${order.order_number}`,
      external_reference: order.id, notification_url: new URL("/api/mercadopago/webhook", publicEnv.siteUrl).href,
      metadata: { checkout_attempt: attemptId },
      payment_method_id: card?.paymentMethodId ?? "pix",
      payer: { email: order.customer_email, ...(card?.identification ? { identification: card.identification } : {}) },
      ...(card ? { token: card.token, installments: 1, ...(card.issuerId ? { issuer_id: card.issuerId } : {}) } : { date_of_expiration: new Date(Date.now() + 30 * 60000).toISOString() }),
    } });
  } catch (error) {
    if (error instanceof MercadoPagoError && [400, 401, 403, 404, 422].includes(error.status)) {
      await admin.from("payments").update({ status: "failed" }).eq("idempotency_key", slotKey).is("provider_payment_id", null).contains("provider_payload", { attemptId });
    }
    throw error;
  }
  const { error: saveError } = await admin.from("payments").update({ provider_payment_id: String(payment.id) }).eq("idempotency_key", slotKey).contains("provider_payload", { attemptId });
  if (saveError) throw new Error("Pagamento recebido, aguardando confirmação. Não refaça a compra.");
  return syncPayment(String(payment.id));
}
