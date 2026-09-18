import { ReceiptText } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { listOrders } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Pedidos | MoveHaus Admin" };
export default async function OrdersPage() {
  const orders = await listOrders();
  return <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8"><AdminPageHeader title="Pedidos" description="Pagamento, preparação e entrega acompanhados separadamente." />{orders.length === 0 ? <div className="mt-5"><EmptyState icon={ReceiptText} title="Nenhum pedido registrado" description="Os pedidos reais aparecerão aqui assim que o checkout gravar a primeira compra." /></div> : <div className="mt-5 overflow-x-auto rounded-lg bg-mh-surface"><table className="w-full min-w-[760px] text-sm"><thead className="border-b border-white/8 text-left text-xs text-mh-muted"><tr><th className="p-3">Número</th><th>Data</th><th>Valor</th><th>Pagamento</th><th>Entrega</th><th>Origem</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-white/6"><td className="p-3 font-medium">#{order.order_number}</td><td>{new Intl.DateTimeFormat("pt-BR").format(new Date(order.created_at))}</td><td>{formatBRL(order.total)}</td><td><Badge tone={order.payment_status === "approved" ? "success" : "muted"}>{order.payment_status}</Badge></td><td>{order.status}</td><td className="text-mh-muted">{order.source}</td></tr>)}</tbody></table></div>}</div>;
}
