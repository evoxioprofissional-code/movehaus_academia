import Link from "next/link";
import {
  AlertTriangle,
  BadgePercent,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FilePlus2,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  ShoppingBag,
  Store,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Delta, Empty, IconTile, OrderBadge, Page, PageHeader, PeriodTabs, Stat, TONE_SOLID, type Tone } from "@/components/admin/kit";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { adminNavCounts, dashboardOperationalData, dashboardPeriodData } from "@/lib/admin/data";
import { getProfile } from "@/lib/auth/user";
import { cn, formatBRL } from "@/lib/utils";

export const metadata = { title: "Início | MoveHaus Admin" };

const TZ = "America/Sao_Paulo";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(new Date()));
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
}

function relative(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `há ${days} dia${days > 1 ? "s" : ""}`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: TZ }).format(new Date(iso));
}

const FUNNEL: { key: string; label: string; tone: Tone }[] = [
  { key: "pending", label: "Recebidos", tone: "amber" },
  { key: "paid", label: "Pagos", tone: "blue" },
  { key: "preparing", label: "Preparando", tone: "violet" },
  { key: "shipped", label: "Enviados", tone: "blue" },
  { key: "delivered", label: "Entregues", tone: "green" },
  { key: "cancelled", label: "Cancelados", tone: "neutral" },
];

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const [stats, operational, counts, profile] = await Promise.all([
    dashboardPeriodData(Number(params.period || 30)),
    dashboardOperationalData(),
    adminNavCounts(),
    getProfile(),
  ]);
  const firstName = (profile?.full_name || "").split(" ")[0];
  const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date());
  const ticket = stats.approvedCount ? Math.round(stats.revenue / stats.approvedCount) : 0;
  const previousTicket = stats.previousApprovedCount ? Math.round(stats.previousRevenue / stats.previousApprovedCount) : 0;
  const chart = stats.salesByDay.slice(-Math.max(stats.days, 7));
  const periodLabel = stats.days === 1 ? "nas últimas 24 horas" : `nos últimos ${stats.days} dias`;
  const funnelMax = Math.max(...FUNNEL.map((step) => stats.statusCounts[step.key] ?? 0), 1);

  const todo: { href: string; icon: LucideIcon; tone: Tone; count: number; title: string; text: string }[] = [
    { href: "/admin/pedidos", icon: PackageCheck, tone: "red", count: counts.ordersToHandle, title: "Pedidos para separar", text: "Pagos e aguardando entrega" },
    { href: "/admin/pedidos", icon: Clock3, tone: "amber", count: counts.stalePayments, title: "Pagamentos parados", text: "Sem pagamento há mais de 24h" },
    { href: "/admin/produtos?stock=low", icon: AlertTriangle, tone: "violet", count: counts.lowStock + counts.outOfStock, title: "Estoque baixo", text: counts.outOfStock ? `${counts.outOfStock} esgotado(s)` : "Com 5 unidades ou menos" },
    { href: "/admin/conteudos", icon: BookOpenText, tone: "blue", count: counts.draftContents, title: "PDFs em rascunho", text: "Ainda não publicados" },
  ];
  const pending = todo.filter((item) => item.count > 0);

  return (
    <Page>
      <PageHeader
        eyebrow={today.charAt(0).toUpperCase() + today.slice(1)}
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}.`}
        subtitle={`Veja como a loja está ${periodLabel}.`}
        actions={<PeriodTabs value={stats.days} basePath="/admin" />}
      />

      {/* Indicadores */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Faturamento" value={formatBRL(stats.revenue)} hint={<Delta now={stats.revenue} before={stats.previousRevenue} />} icon={Wallet} tone="red" spark={chart.map((p) => p.total)} href="/admin/financeiro" />
        <Stat label="Pedidos" value={stats.orderCount} hint={<Delta now={stats.orderCount} before={stats.previousOrderCount} />} icon={ShoppingBag} tone="ink" spark={chart.map((p) => p.orders)} href="/admin/pedidos" />
        <Stat label="Ticket médio" value={formatBRL(ticket)} hint={<Delta now={ticket} before={previousTicket} />} icon={ReceiptText} tone="green" />
        <Stat label="Novos clientes" value={stats.newCustomers} hint={`${stats.customers} no total`} icon={UserPlus} tone="violet" href="/admin/clientes" />
      </section>

      {/* Para fazer agora */}
      <Card
        className="mt-4"
        title="Para fazer agora"
        subtitle={pending.length ? `${pending.length} ${pending.length === 1 ? "item pede" : "itens pedem"} sua atenção` : "Nada pendente por aqui"}
      >
        {pending.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {todo.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl p-3.5 transition-[background,transform] active:scale-[0.99]",
                  item.count ? "bg-ad-soft hover:bg-[#ebeae4]" : "bg-ad-soft/50 opacity-60",
                )}
              >
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-[17px] font-bold tabular-nums text-white", item.count ? TONE_SOLID[item.tone] : "bg-[#cfcdc6]")}>
                  {item.count > 99 ? "99+" : item.count}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ad-ink">{item.title}</span>
                  <span className="block truncate text-[12.5px] text-ad-muted">{item.text}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-ad-faint transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-[#e7f4ea] p-4 text-[#1f7a3d]">
            <CheckCircle2 className="size-6 shrink-0" />
            <p className="text-[14px]"><strong className="font-semibold">Tudo em dia.</strong> Sem pedidos para separar, estoque crítico ou conteúdo parado.</p>
          </div>
        )}
      </Card>

      {/* Gráfico + funil */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Card
          title="Faturamento por dia"
          subtitle={`${formatBRL(stats.revenue)} aprovados · ${stats.approvedCount} venda(s)`}
          actions={<Link href="/admin/financeiro" className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-ad-ink-2 hover:bg-ad-soft">Financeiro <ChevronRight className="size-4" /></Link>}
        >
          {stats.orderCount === 0 && stats.revenue === 0 ? (
            <Empty icon={TrendingUp} title="Nenhuma venda no período" text="Quando um pedido for pago, o faturamento aparece aqui dia a dia." />
          ) : (
            <div className="pt-8">
              <RevenueChart data={chart} />
            </div>
          )}
        </Card>

        <Card title="Funil de pedidos" subtitle={`${stats.orderCount} pedido(s) ${periodLabel}`}>
          <ul className="space-y-3.5">
            {FUNNEL.map((step) => {
              const value = stats.statusCounts[step.key] ?? 0;
              return (
                <li key={step.key}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-ad-ink-2">{step.label}</span>
                    <span className="font-semibold tabular-nums text-ad-ink">{value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ad-soft">
                    <div className={cn("h-full rounded-full", value ? TONE_SOLID[step.tone] : "")} style={{ width: `${value ? Math.max(4, (value / funnelMax) * 100) : 0}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Pedidos recentes + mais vendidos */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Card
          title="Pedidos recentes"
          padded={false}
          actions={<Link href="/admin/pedidos" className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-ad-ink-2 hover:bg-ad-soft">Ver todos <ChevronRight className="size-4" /></Link>}
        >
          {operational.recentOrders.length === 0 ? (
            <Empty icon={ShoppingBag} title="Ainda não há pedidos" text="Os pedidos da loja aparecem aqui assim que forem feitos." />
          ) : (
            <ul className="mt-3 divide-y divide-ad-line">
              {operational.recentOrders.slice(0, 6).map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/pedidos#pedido-${order.order_number}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ad-soft/60 sm:px-6">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ad-soft text-[12px] font-bold tabular-nums text-ad-ink-2">#{order.order_number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-ad-ink">{formatBRL(order.total)}</span>
                      <span className="block text-[12.5px] text-ad-muted">{relative(order.created_at)}</span>
                    </span>
                    <OrderBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid content-start gap-4">
          <Card title="Mais vendidos" padded={false}>
            {operational.bestSellers.length === 0 ? (
              <p className="px-5 pb-5 pt-2 text-[14px] text-ad-muted sm:px-6">Os campeões de venda aparecem aqui.</p>
            ) : (
              <ol className="mt-2 pb-2">
                {operational.bestSellers.map((product, index) => (
                  <li key={product.name} className="flex items-center gap-3 px-5 py-2.5 sm:px-6">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg text-[12px] font-bold", index === 0 ? "bg-ad-red text-white" : "bg-ad-soft text-ad-ink-2")}>{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ad-ink">{product.name}</span>
                    <span className="text-[13px] tabular-nums text-ad-muted">{product.quantity} un.</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Atalhos">
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/produtos/novo", label: "Novo produto", icon: PackagePlus, tone: "red" as Tone },
                { href: "/admin/produtos/novo?tipo=ebook", label: "Novo PDF", icon: FilePlus2, tone: "blue" as Tone },
                { href: "/admin/promocoes", label: "Criar cupom", icon: BadgePercent, tone: "green" as Tone },
                { href: "/admin/home", label: "Editar vitrine", icon: Store, tone: "violet" as Tone },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center gap-2.5 rounded-2xl bg-ad-soft p-3 text-[13.5px] font-semibold text-ad-ink transition-colors hover:bg-[#ebeae4]">
                  <IconTile icon={item.icon} tone={item.tone} className="size-8 rounded-lg" />
                  <span className="leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
