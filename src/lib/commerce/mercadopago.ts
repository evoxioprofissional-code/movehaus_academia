import "server-only";
import { publicEnv, serverEnv } from "@/lib/env";

export class MercadoPagoError extends Error {
  constructor(public status: number) {
    super("Não foi possível processar o pagamento. Confira os dados ou fale com a equipe.");
  }
}

export function requirePaymentConfiguration() {
  if (!serverEnv.mercadoPagoAccessToken || !serverEnv.mercadoPagoWebhookSecret || !serverEnv.mercadoPagoPublicKey || new URL(publicEnv.siteUrl).protocol !== "https:") {
    throw new Error("O pagamento está temporariamente indisponível. Fale com a equipe.");
  }
}

export async function mercadoPagoRequest<T>(path: string, options?: { method: "POST" | "PUT"; body: unknown; idempotencyKey?: string }): Promise<T> {
  if (!serverEnv.mercadoPagoAccessToken) throw new Error("Mercado Pago não configurado.");
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${serverEnv.mercadoPagoAccessToken}`, "Content-Type": "application/json",
      ...(options?.idempotencyKey ? { "X-Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: options ? JSON.stringify(options.body) : undefined,
    cache: "no-store", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new MercadoPagoError(response.status);
  return response.json();
}
