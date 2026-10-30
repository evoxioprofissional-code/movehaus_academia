export type PaymentView = {
  status: "ready" | "pending" | "approved" | "rejected" | "authorized" | "cancelled";
  message?: string;
  qrCode?: string;
  qrImage?: string;
  expiresAt?: string;
};

export type CardInput = { token: string; paymentMethodId: string; issuerId?: string; identification?: { type: string; number: string } };

export function parseCardInput(value: unknown): CardInput {
  if (!value || typeof value !== "object") throw new Error("Preencha os dados do cartão.");
  const data = value as Record<string, unknown>;
  const token = String(data.token ?? "");
  const paymentMethodId = String(data.payment_method_id ?? "");
  if (!/^[a-zA-Z0-9-]{10,200}$/.test(token) || !/^[a-zA-Z0-9_]{1,50}$/.test(paymentMethodId) || paymentMethodId === "pix") throw new Error("Confira os dados do cartão.");
  const payer = data.payer as { identification?: { type?: unknown; number?: unknown } } | undefined;
  const type = String(payer?.identification?.type ?? "");
  const number = String(payer?.identification?.number ?? "").replace(/\D/g, "");
  const identification = (type === "CPF" && number.length === 11) || (type === "CNPJ" && number.length === 14) ? { type, number } : undefined;
  const issuerId = /^\d{1,20}$/.test(String(data.issuer_id ?? "")) ? String(data.issuer_id) : undefined;
  return { token, paymentMethodId, issuerId, identification };
}

export function recurringMetadata(metadata: unknown) {
  return Boolean(metadata && typeof metadata === "object" && !Array.isArray(metadata) && (metadata as Record<string, unknown>).billing_model === "subscription");
}
