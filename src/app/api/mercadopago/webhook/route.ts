import { syncPayment } from "@/lib/commerce/payments";
import { syncSubscription, syncSubscriptionInvoice } from "@/lib/commerce/subscriptions";
import { validMercadoPagoId } from "@/lib/commerce/subscription-rules";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = serverEnv.mercadoPagoWebhookSecret;
  if (!secret || !serverEnv.mercadoPagoAccessToken) return new Response(null, { status: 503 });
  const url = new URL(request.url);
  const id = url.searchParams.get("data.id");
  const requestId = request.headers.get("x-request-id");
  const parts = Object.fromEntries((request.headers.get("x-signature") ?? "").split(",").map((part) => part.trim().split("=")));
  if (!id || !validMercadoPagoId(id) || !requestId || !/^\d+$/.test(parts.ts ?? "") || !/^[a-f0-9]{64}$/i.test(parts.v1 ?? "")) return new Response(null, { status: 401 });
  const expected = createHmac("sha256", secret).update(`id:${id.toLowerCase()};request-id:${requestId};ts:${parts.ts};`).digest();
  if (!timingSafeEqual(expected, Buffer.from(parts.v1, "hex"))) return new Response(null, { status: 401 });
  try {
    const body = await request.json();
    if (body.type === "subscription_preapproval") {
      await syncSubscription(id);
      return new Response(null, { status: 200 });
    }
    if (body.type === "subscription_authorized_payment") {
      await syncSubscriptionInvoice(id);
      return new Response(null, { status: 200 });
    }
    if (body.type !== "payment") return new Response(null, { status: 200 });
    await syncPayment(id);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
