import Link from "next/link";
import { ChevronDown, MessageCircle, PackageCheck, ReceiptText, ScanLine } from "lucide-react";
import { Badge, Card, Empty, FormField, OrderBadge, Page, PageHeader, PaymentBadge, Select, Textarea, btn, inputCls } from "@/components/admin/kit";
import { listOrdersDetailed } from "@/lib/admin/data";
import { receiptCode, canPresentReceipt, hasPhysicalItems } from "@/lib/commerce/receipts";
import { confirmOrderDelivery, updateOrderStatus } from "@/lib/admin/actions";
import { cn, formatBRL } from "@/lib/utils";

export const metadata = { title: "Pedidos | MoveHaus Admin" };

type Order = Awaited<ReturnType<typeof listOrdersDetailed>>[number];

const FILTERS: { key: string; label: string; test: (order: Order) => boolean }[] = [
  { key: "todos", label: "Todos", test: () => true },
  { key: "separar", label: "Para separar", test: (o) => o.payment_status === "approved" && ["pending", "paid", "preparing"].includes(o.status) },
  { key: "aguardando", label: "Aguardando pagamento", test: (o) => o.payment_status === "pending" && o.status !== "cancelled" },
  { key: "entregues", label: "Entregues", test: (o) => o.status === "delivered" },
  { key: "cancelados", label: "Cancelados", test: (o) => o.status === "cancelled" || o.payment_status === "cancelled" },
];

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

function waLink(phone: string, order: number) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(`Olá! Aqui é da MoveHaus, sobre o seu pedido #${order}.`)}`;
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ codigo?: string; filtro?: string }> }) {
  const { codigo, filtro } = await searchParams;
  const orders = await listOrdersDetailed(codigo);
  const active = FILTERS.find((f) => f.key === filtro) ?? FILTERS[0];
  const visible = orders.filter(active.test);

  return (
    <Page>
      <PageHeader title="Pedidos" subtitle="Confira pagamento, separe os produtos e registre a entrega." />

      {/* Conferir comprovante */}
      <form className="admin-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <ScanLine className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ad-muted" />
          <input
            name="codigo"
            aria-label="Código do comprovante"
            placeholder="Código do comprovante (ex.: MH-123-A1B2C3D4)"
            defaultValue={codigo ?? ""}
            autoCapitalize="characters"
            className={cn(inputCls, "h-12 pl-11 font-mono uppercase placeholder:font-sans placeholder:normal-case")}
          />
        </label>
        <div className="flex gap-2">
          <button type="submit" className={btn("primary", "md", "h-12 flex-1 sm:flex-none")}>Conferir</button>
          {codigo && <Link href="/admin/pedidos" className={btn("ghost", "md", "h-12")}>Limpar</Link>}
        </div>
      </form>

      {/* Filtros */}
      {!codigo && (
        <div className="admin-noscroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => {
            const count = orders.filter(f.test).length;
            const on = f.key === active.key;
            return (
              <Link
                key={f.key}
                href={f.key === "todos" ? "/admin/pedidos" : `/admin/pedidos?filtro=${f.key}`}
                scroll={false}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors",
                  on ? "bg-ad-ink text-white" : "bg-white text-ad-ink-2 shadow-[0_0_0_1px_rgb(32_37_34/0.08)] hover:bg-ad-soft",
                )}
              >
                {f.label}
                <span className={cn("rounded-full px-1.5 text-[11.5px] tabular-nums", on ? "bg-white/20" : "bg-ad-soft text-ad-muted")}>{count}</span>
              </Link>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <Card className="mt-4">
          <Empty
            icon={ReceiptText}
            title={codigo ? "Comprovante não encontrado" : orders.length ? "Nada neste filtro" : "Nenhum pedido ainda"}
            text={codigo ? "Confira se o código foi digitado completo, com os traços." : orders.length ? "Escolha outro filtro para ver os demais pedidos." : "Os pedidos da loja aparecem aqui assim que forem feitos."}
          />
        </Card>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {visible.map((order) => {
            const code = receiptCode(order);
            const canDeliver = canPresentReceipt(order, hasPhysicalItems(order.items)) && order.status !== "delivered";
            const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id} id={`pedido-${order.order_number}`} className="scroll-mt-24">
                <details className="admin-card group overflow-hidden" open={!!codigo}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ad-soft text-[13px] font-bold tabular-nums text-ad-ink">#{order.order_number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[15px] font-semibold text-ad-ink">{order.customer_name || order.customer_email || "Cliente"}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-ad-muted">
                        {dateFmt.format(new Date(order.created_at))} · {units} {units === 1 ? "item" : "itens"}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5 sm:hidden">
                        <OrderBadge status={order.status} />
                        <PaymentBadge status={order.payment_status} />
                      </span>
                    </span>
                    <span className="hidden flex-wrap justify-end gap-1.5 sm:flex">
                      <OrderBadge status={order.status} />
                      <PaymentBadge status={order.payment_status} />
                    </span>
                    <span className="text-right">
                      <span className="block text-[15px] font-bold tabular-nums text-ad-ink">{formatBRL(order.total)}</span>
                      <ChevronDown className="ml-auto mt-1 size-4 text-ad-faint transition-transform group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className="border-t border-ad-line bg-[#fbfaf8] p-4 sm:p-5">
                    {canDeliver && (
                      <form action={confirmOrderDelivery} className="mb-4 flex flex-col gap-3 rounded-2xl bg-[#e7f4ea] p-4 sm:flex-row sm:items-center">
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="code" value={code} />
                        <PackageCheck className="hidden size-6 shrink-0 text-[#1f7a3d] sm:block" />
                        <p className="flex-1 text-[13.5px] text-[#1f5c33]">
                          <strong className="font-semibold">Pagamento confirmado.</strong> Entregue os produtos e só então registre a retirada.
                        </p>
                        <button type="submit" className="h-11 rounded-full bg-[#1f7a3d] px-5 text-[14px] font-semibold text-white active:scale-[0.98]">Confirmar entrega</button>
                      </form>
                    )}

                    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
                      <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ad-faint">Itens</p>
                        <ul className="mt-2 divide-y divide-ad-line rounded-2xl bg-white shadow-[0_0_0_1px_rgb(32_37_34/0.06)]">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-[14px]">
                              <span className="min-w-0"><span className="font-semibold tabular-nums">{item.quantity}×</span> {item.product_name}</span>
                              <span className="shrink-0 tabular-nums text-ad-ink-2">{formatBRL(item.total)}</span>
                            </li>
                          ))}
                          <li className="flex justify-between px-4 py-3 text-[14px] font-semibold">
                            <span>Total</span>
                            <span className="tabular-nums">{formatBRL(order.total)}</span>
                          </li>
                        </ul>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Badge tone="neutral" className="select-all font-mono text-[12px]">{code}</Badge>
                          {order.customer_phone && (
                            <a href={waLink(order.customer_phone, order.order_number)} target="_blank" rel="noreferrer" className={btn("secondary", "sm")}>
                              <MessageCircle className="size-4 text-[#1f7a3d]" /> WhatsApp
                            </a>
                          )}
                          {order.customer_email && <a href={`mailto:${order.customer_email}`} className={btn("ghost", "sm", "text-ad-muted")}>{order.customer_email}</a>}
                        </div>
                      </div>

                      <form action={updateOrderStatus} className="grid gap-3 rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgb(32_37_34/0.06)] sm:grid-cols-2">
                        <input type="hidden" name="id" value={order.id} />
                        <FormField label="Situação do pedido">
                          <Select name="status" defaultValue={order.status}>
                            <option value="pending">Recebido</option>
                            <option value="paid">Pago</option>
                            <option value="preparing">Preparando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </Select>
                        </FormField>
                        <FormField label="Pagamento">
                          <Select name="payment_status" defaultValue={order.payment_status}>
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovado</option>
                            <option value="failed">Falhou</option>
                            <option value="refunded">Reembolsado</option>
                            <option value="cancelled">Cancelado</option>
                          </Select>
                        </FormField>
                        <FormField label="Observações internas" className="sm:col-span-2">
                          <Textarea name="notes" rows={2} defaultValue={order.notes} className="min-h-[72px]" placeholder="Só a equipe vê" />
                        </FormField>
                        <button type="submit" className={btn("primary", "md", "sm:col-span-2")}>Salvar alterações</button>
                      </form>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
