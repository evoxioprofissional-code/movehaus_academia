"use server";

import { getUser } from "@/lib/auth/user";
import { createAdminClient } from "@/lib/supabase/server";
import { chargeOrder, readOrderPayment } from "./payments";
import { authorizeSubscription, readSubscription } from "./subscriptions";
import { parseCardInput, recurringMetadata, type PaymentView } from "./payment-rules";

async function ownedOrder(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Entre na sua conta para continuar.");
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Pedido inválido.");
  const { data, error } = await createAdminClient().from("orders").select("*").eq("id", id).eq("customer_id", user.id).single();
  if (error || !data) throw new Error("Pedido não encontrado.");
  return { user, order: data };
}

async function recurringItem(orderId: string, productId: string) {
  const { data, error } = await createAdminClient().from("order_items").select("product_id,product_name,unit_price,metadata").eq("order_id", orderId).eq("product_id", productId).single();
  if (error || !data || !recurringMetadata(data.metadata)) throw new Error("Assinatura não encontrada neste pedido.");
  return data;
}

export async function checkoutPaymentStatus(orderId: string, productId?: string): Promise<PaymentView> {
  const { user, order } = await ownedOrder(orderId);
  if (productId) {
    await recurringItem(order.id, productId);
    return readSubscription(user.id, productId);
  }
  return readOrderPayment(order);
}

export async function submitCheckoutPayment(input: { orderId: string; productId?: string; method: "pix" | "card"; card?: unknown; consent?: boolean }): Promise<PaymentView> {
  const { user, order } = await ownedOrder(input.orderId);
  if (["cancelled", "refunded"].includes(order.payment_status) || order.status === "cancelled") throw new Error("Este pedido foi encerrado.");
  if (input.productId) {
    if (input.method !== "card" || input.consent !== true) throw new Error("Autorize a cobrança mensal antes de continuar.");
    const item = await recurringItem(order.id, input.productId);
    if (!order.customer_email) throw new Error("Confirme seu e-mail antes de assinar.");
    return authorizeSubscription({ userId: user.id, email: order.customer_email, orderId: order.id, productId: input.productId, name: item.product_name, amount: item.unit_price, card: parseCardInput(input.card) });
  }
  if (input.method !== "pix" && input.method !== "card") throw new Error("Forma de pagamento inválida.");
  return chargeOrder(order, input.method === "card" ? parseCardInput(input.card) : undefined);
}
