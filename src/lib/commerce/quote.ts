import "server-only";

import { createAdminClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type QuoteInputItem = { productId: string; quantity: number; variant?: Record<string, string> };
export type QuoteLine = { productId: string; slug: string; name: string; type: "physical" | "digital" | "ebook"; billingModel: "one_time" | "subscription" | null; quantity: number; unitPrice: number; total: number; sku: string | null; variant: Record<string, string> };
export type CartQuote = { lines: QuoteLine[]; subtotal: number; discount: number; upfrontTotal: number; monthlyTotal: number; coupon: { id: string; code: string } | null; errors: string[] };

function normalizeItems(items: QuoteInputItem[]) {
  const merged = new Map<string, QuoteInputItem>();
  for (const raw of items.slice(0, 50)) {
    const quantity = Math.max(1, Math.min(20, Math.trunc(Number(raw.quantity) || 1)));
    const variant = raw.variant && typeof raw.variant === "object" ? raw.variant : {};
    const key = `${raw.productId}:${JSON.stringify(Object.entries(variant).sort())}`;
    const current = merged.get(key);
    merged.set(key, { productId: raw.productId, variant, quantity: Math.min(20, (current?.quantity ?? 0) + quantity) });
  }
  return [...merged.values()];
}

function promotionActive(startsAt: string | null, endsAt: string | null) {
  const now = Date.now();
  return (!startsAt || Date.parse(startsAt) <= now) && (!endsAt || Date.parse(endsAt) >= now);
}

export async function createCartQuote(items: QuoteInputItem[], couponCode?: string): Promise<CartQuote> {
  const normalized = normalizeItems(items);
  if (!normalized.length) return { lines: [], subtotal: 0, discount: 0, upfrontTotal: 0, monthlyTotal: 0, coupon: null, errors: ["O carrinho está vazio."] };
  const admin = createAdminClient();
  const ids = [...new Set(normalized.map((item) => item.productId))];
  const { data: products, error } = await admin.from("products").select("*").in("id", ids);
  if (error) throw new Error("Não foi possível validar o catálogo agora.");
  const byId = new Map((products ?? []).map((product) => [product.id, product]));
  const errors: string[] = [];
  const lines: QuoteLine[] = [];

  for (const item of normalized) {
    const product = byId.get(item.productId);
    if (!product || !product.active || product.status !== "active") { errors.push("Um produto do carrinho não está mais disponível."); continue; }
    const recurring = product.type !== "physical" && product.billing_model === "subscription";
    const basePrice = recurring ? product.monthly_price : product.price;
    if (basePrice == null || basePrice < 0) { errors.push(`${product.name} está sem preço válido.`); continue; }
    const quantity = product.type === "physical" ? item.quantity : 1;
    if (product.type === "physical" && product.track_inventory && !product.allow_backorder && product.stock < quantity) {
      errors.push(`${product.name} possui apenas ${Math.max(product.stock, 0)} unidade(s) disponível(is).`); continue;
    }
    const unitPrice = promotionActive(product.promotion_starts_at, product.promotion_ends_at) && product.price != null ? product.price : basePrice;
    lines.push({ productId: product.id, slug: product.slug, name: product.name, type: product.type, billingModel: product.billing_model, quantity, unitPrice, total: unitPrice * quantity, sku: product.sku, variant: item.variant ?? {} });
  }

  const upfrontLines = lines.filter((line) => line.billingModel !== "subscription");
  const monthlyLines = lines.filter((line) => line.billingModel === "subscription");
  const subtotal = upfrontLines.reduce((sum, line) => sum + line.total, 0);
  const monthlyTotal = monthlyLines.reduce((sum, line) => sum + line.total, 0);
  let discount = 0;
  let coupon: CartQuote["coupon"] = null;

  if (couponCode?.trim()) {
    const code = couponCode.trim().toUpperCase();
    const { data: candidate } = await admin.from("coupons").select("*").eq("code", code).maybeSingle();
    const active = candidate?.active && (!candidate.starts_at || Date.parse(candidate.starts_at) <= Date.now()) && (!candidate.ends_at || Date.parse(candidate.ends_at) >= Date.now());
    const hasUses = candidate && (candidate.usage_limit == null || candidate.usage_count < candidate.usage_limit);
    if (!candidate || !active || !hasUses) errors.push("Cupom inválido ou expirado.");
    else {
      const eligibleTotal = upfrontLines.filter((line) => {
        const product = byId.get(line.productId);
        return (candidate.product_ids.length === 0 || candidate.product_ids.includes(line.productId)) && (candidate.category_ids.length === 0 || Boolean(product?.category_id && candidate.category_ids.includes(product.category_id)));
      }).reduce((sum, line) => sum + line.total, 0);
      if (subtotal < candidate.minimum_order || eligibleTotal === 0) errors.push("Este cupom não se aplica aos itens do carrinho.");
      else {
        discount = candidate.discount_type === "percentage" ? Math.min(eligibleTotal, Math.round(eligibleTotal * (candidate.discount_value / 10000))) : Math.min(eligibleTotal, candidate.discount_value);
        coupon = { id: candidate.id, code: candidate.code };
      }
    }
  }
  return { lines, subtotal, discount, upfrontTotal: Math.max(0, subtotal - discount), monthlyTotal, coupon, errors };
}

export function quoteLineMetadata(line: QuoteLine): Json {
  return { type: line.type, billing_model: line.billingModel, variant: line.variant };
}
