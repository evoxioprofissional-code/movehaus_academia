"use server";

import { revalidatePath } from "next/cache";
import { getProfile, getUser } from "@/lib/auth/user";
import { createCartQuote, quoteLineMetadata, type QuoteInputItem } from "@/lib/commerce/quote";
import { createAdminClient } from "@/lib/supabase/server";

export type CheckoutState = { error?: string; orderNumber?: number; orderId?: string; total?: number; monthlyTotal?: number };

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
  const { data: existing } = await admin.from("orders").select("id,order_number,total").eq("idempotency_key", idempotencyKey).maybeSingle();
  if (existing) return { orderId: existing.id, orderNumber: existing.order_number, total: existing.total, monthlyTotal: quote.monthlyTotal };
  const { data: order, error } = await admin.from("orders").insert({ customer_id: user.id, customer_email: user.email ?? profile?.email ?? null, customer_name: profile?.full_name ?? null, customer_phone: profile?.whatsapp ?? null, subtotal: quote.subtotal, discount: quote.discount, total: quote.upfrontTotal, coupon_id: quote.coupon?.id ?? null, idempotency_key: idempotencyKey, source: "store_whatsapp", notes: quote.monthlyTotal > 0 ? `Assinaturas mensais: ${quote.monthlyTotal} centavos` : "" }).select("id,order_number,total").single();
  if (error || !order) return { error: "Não foi possível registrar o pedido. Tente novamente." };
  const { error: itemError } = await admin.from("order_items").insert(quote.lines.map((line) => ({ order_id: order.id, product_id: line.productId, product_name: line.name, sku: line.sku, quantity: line.quantity, unit_price: line.unitPrice, total: line.total, metadata: quoteLineMetadata(line) })));
  if (itemError) { await admin.from("orders").delete().eq("id", order.id); return { error: "Não foi possível registrar os itens do pedido." }; }
  if (quote.coupon) await admin.from("coupon_redemptions").insert({ coupon_id: quote.coupon.id, user_id: user.id, order_id: order.id, discount: quote.discount });
  revalidatePath("/minha-area"); revalidatePath("/admin/pedidos");
  return { orderId: order.id, orderNumber: order.order_number, total: order.total, monthlyTotal: quote.monthlyTotal };
}
