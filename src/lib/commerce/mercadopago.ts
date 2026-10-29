import "server-only";
import { publicEnv, serverEnv } from "@/lib/env";

export async function createPaymentLink(order: { id: string; order_number: number; total: number }) {
  if (!serverEnv.mercadoPagoAccessToken || order.total <= 0) return undefined;
  const site = new URL(publicEnv.siteUrl);
  // Só disponibiliza cobrança quando a confirmação automática estiver configurada.
  if (site.protocol !== "https:" || !serverEnv.mercadoPagoWebhookSecret) return undefined;
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${serverEnv.mercadoPagoAccessToken}`, "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      items: [{ id: order.id, title: `MoveHaus — Pedido #${order.order_number}`, quantity: 1, currency_id: "BRL", unit_price: order.total / 100 }],
      external_reference: order.id,
      notification_url: new URL("/api/mercadopago/webhook", site).href,
      back_urls: Object.fromEntries(["success", "failure", "pending"].map((status) => [status, new URL("/minha-area", site).href])),
      auto_return: "approved",
    }),
  });
  if (!response.ok) throw new Error("Pagamento temporariamente indisponível.");
  const result = await response.json();
  const url = new URL(result.init_point);
  if (url.protocol !== "https:" || url.hostname !== "www.mercadopago.com.br") throw new Error("Link de pagamento inválido.");
  return url.href;
}
