import type { Json } from "@/types/database";

export function receiptCode(order: { id: string; order_number: number }) {
  return `MH-${order.order_number}-${order.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function receiptOrderNumber(code: string) {
  const match = /^MH-([1-9]\d*)-[A-F0-9]{8}$/.exec(code.trim().toUpperCase());
  if (!match || !Number.isSafeInteger(Number(match[1]))) return null;
  return Number(match[1]);
}

export function hasPhysicalItems(items: { metadata: Json; product_id: string | null }[], products: { id: string; type: string }[] = []) {
  return items.some((item) => {
    const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata) ? item.metadata : {};
    return metadata.type === "physical" || products.some((product) => product.id === item.product_id && product.type === "physical");
  });
}

export function canPresentReceipt(order: { payment_status: string; status: string }, physical: boolean) {
  return physical && order.payment_status === "approved" && order.status !== "cancelled";
}

export function academyWhatsappAvailable(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^55\d{10,11}$/.test(digits) && digits !== "5599999999999";
}

export const paymentLabels: Record<string, string> = { pending: "Aguardando pagamento", approved: "Pagamento confirmado", failed: "Pagamento não concluído", refunded: "Reembolsado", cancelled: "Pagamento cancelado" };
export const orderLabels: Record<string, string> = { pending: "Recebido", paid: "Pago", preparing: "Em preparação", shipped: "Enviado", delivered: "Entregue / retirado", cancelled: "Cancelado" };
