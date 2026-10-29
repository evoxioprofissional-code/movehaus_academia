import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = serverEnv.mercadoPagoWebhookSecret;
  if (!secret || !serverEnv.mercadoPagoAccessToken) return new Response(null, { status: 503 });
  const url = new URL(request.url);
  const id = url.searchParams.get("data.id");
  const requestId = request.headers.get("x-request-id");
  const parts = Object.fromEntries((request.headers.get("x-signature") ?? "").split(",").map((part) => part.trim().split("=")));
  if (!id || !/^\d+$/.test(id) || !requestId || !/^\d+$/.test(parts.ts ?? "") || !/^[a-f0-9]{64}$/i.test(parts.v1 ?? "")) return new Response(null, { status: 401 });
  const expected = createHmac("sha256", secret).update(`id:${id};request-id:${requestId};ts:${parts.ts};`).digest();
  if (!timingSafeEqual(expected, Buffer.from(parts.v1, "hex"))) return new Response(null, { status: 401 });
  try {
    const body = await request.json();
    if (body.type !== "payment") return new Response(null, { status: 200 });
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, { headers: { Authorization: `Bearer ${serverEnv.mercadoPagoAccessToken}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) return new Response(null, { status: 502 });
    const payment = await response.json();
    if (payment.status !== "approved") return new Response(null, { status: 200 });
    const admin = createAdminClient();
    const { data: order, error } = await admin.from("orders").select("id,total").eq("id", payment.external_reference).maybeSingle();
    if (error) return new Response(null, { status: 500 });
    if (!order || payment.currency_id !== "BRL" || Math.round(Number(payment.transaction_amount) * 100) !== order.total) return new Response(null, { status: 422 });
    const { error: saveError } = await admin.from("payments").upsert({ order_id: order.id, provider: "mercadopago", provider_payment_id: id, status: "approved", amount: order.total, method: payment.payment_method_id, idempotency_key: `mercadopago:${id}` }, { onConflict: "idempotency_key" });
    if (saveError) return new Response(null, { status: 500 });
    const { error: updateError } = await admin.from("orders").update({ payment_status: "approved", payment_method: "mercadopago" }).eq("id", order.id).eq("payment_status", "pending");
    return new Response(null, { status: updateError ? 500 : 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
