"use server";

import { recurringMetadata } from "@/lib/commerce/payment-rules";
import { grantOrderAccess } from "@/lib/commerce/payments";
import { revalidatePath } from "next/cache";
import { getProfile, getUser } from "@/lib/auth/user";
import { createCartQuote, quoteLineMetadata, type QuoteInputItem } from "@/lib/commerce/quote";
import { createAdminClient } from "@/lib/supabase/server";

export type CheckoutState = { error?: string; orderNumber?: number; orderId?: string; total?: number; monthlyTotal?: number; email?: string; subscriptions?: { productId: string; name: string; amount: number }[] };

export async function resumeOrder(orderId: string): Promise<CheckoutState> {
  const user = await getUser();
  if (!user || !/^[a-f0-9-]{36}$/i.test(orderId)) return { error: "Entre na conta que registrou o pedido para continuar." };
  return completeCheckout(orderId, user.id);
}

function parseItems(value: FormDataEntryValue | null): QuoteInputItem[] {
  if (typeof value !== "string" || value.length > 50_000) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ productId: String(item.productId ?? ""), quantity: Number(item.quantity ?? 1), variant: item.variant && typeof item.variant === "object" ? item.variant : undefined })).filter((item) => item.productId);
  } catch { return []; }
}

export async function prepareOrder(_state: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getUser();
  if (!user) return { error: "Entre na sua conta para registrar o pedido com segurança." };
  const profile = await getProfile();
  const quote = await createCartQuote(parseItems(formData.get("items")), String(formData.get("coupon") ?? ""));
  if (!quote.lines.length || quote.errors.length) return { error: quote.errors[0] ?? "Não foi possível validar o carrinho." };
  const idempotencyKey = String(formData.get("idempotency_key") ?? "").trim();
  if (!/^[a-zA-Z0-9-]{20,80}$/.test(idempotencyKey)) return { error: "Atualize a página e tente novamente." };
  const admin = createAdminClient();
  const { data: existing } = await admin.from("orders").select("id,order_number,total").eq("idempotency_key", idempotencyKey).eq("customer_id", user.id).maybeSingle();
  if (existing) return completeCheckout(existing.id, user.id);
  const { data: order, error } = await admin.from("orders").insert({ customer_id: user.id, customer_email: user.email ?? profile?.email ?? null, customer_name: profile?.full_name ?? null, customer_phone: profile?.whatsapp ?? null, subtotal: quote.subtotal, discount: quote.discount, total: quote.upfrontTotal, coupon_id: quote.coupon?.id ?? null, idempotency_key: idempotencyKey, source: "store_checkout", notes: quote.monthlyTotal > 0 ? `Assinaturas mensais: ${quote.monthlyTotal} centavos` : "" }).select("id,order_number,total").single();
  if (error || !order) return { error: "Não foi possível registrar o pedido. Tente novamente." };
  const { error: itemError } = await admin.from("order_items").insert(quote.lines.map((line) => ({ order_id: order.id, product_id: line.productId, product_name: line.name, sku: line.sku, quantity: line.quantity, unit_price: line.unitPrice, total: line.total, metadata: quoteLineMetadata(line) })));
  if (itemError) { await admin.from("orders").delete().eq("id", order.id); return { error: "Não foi possível registrar os itens do pedido." }; }
  if (quote.coupon) await admin.from("coupon_redemptions").insert({ coupon_id: quote.coupon.id, user_id: user.id, order_id: order.id, discount: quote.discount });
  revalidatePath("/minha-area"); revalidatePath("/admin/pedidos");
  return completeCheckout(order.id, user.id);
}


async function completeCheckout(orderId: string, userId: string): Promise<CheckoutState> {
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("id,order_number,total,customer_email,payment_status,created_at,status").eq("id", orderId).eq("customer_id", userId).single();
  const { data: items, error: itemError } = await admin.from("order_items").select("product_id,product_name,unit_price,metadata").eq("order_id", orderId);
  if (error || itemError || !order || !items) return { error: "Não foi possível recuperar o pedido." };
  if (order.status === "cancelled" || ["cancelled", "refunded"].includes(order.payment_status)) return { error: "Este pedido foi encerrado." };
  const recurring = items.filter((item) => recurringMetadata(item.metadata));
  if (order.total === 0 && items.some((item) => !recurringMetadata(item.metadata))) {
    await grantOrderAccess(order.id, order.created_at);
    if (!recurring.length) await admin.from("orders").update({ payment_status: "approved", payment_method: "free" }).eq("id", order.id).eq("payment_status", "pending");
  }
  return { orderId: order.id, orderNumber: order.order_number, total: order.total, email: order.customer_email ?? undefined,
    monthlyTotal: recurring.reduce((sum, item) => sum + item.unit_price, 0),
    subscriptions: recurring.flatMap((item) => item.product_id ? [{ productId: item.product_id, name: item.product_name, amount: item.unit_price }] : []),
  };
}
