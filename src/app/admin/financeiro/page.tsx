import Link from "next/link";
import { ChevronRight, Clock3, ReceiptText, RotateCcw, Wallet } from "lucide-react";
import { Card, Delta, Page, PageHeader, PeriodTabs, Stat } from "@/components/admin/kit";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { dashboardPeriodData } from "@/lib/admin/data";
import { cn, formatBRL } from "@/lib/utils";

export const metadata = { title: "Financeiro | MoveHaus Admin" };

const dayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" });

export default async function FinancialPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const stats = await dashboardPeriodData(Number(params.period || 30));
  const ticket = stats.approvedCount ? Math.round(stats.revenue / stats.approvedCount) : 0;
  const days = stats.salesByDay.slice(-stats.days);
  const chart = stats.salesByDay.slice(-Math.max(stats.days, 7));
  const best = Math.max(...days.map((d) => d.total), 1);

  return (
    <Page>
      <PageHeader title="Financeiro" subtitle="Quanto a loja vendeu e o que ainda falta receber." actions={<PeriodTabs value={stats.days} basePath="/admin/financeiro" />} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Receita aprovada" value={formatBRL(stats.revenue)} hint={<Delta now={stats.revenue} before={stats.previousRevenue} />} icon={Wallet} tone="red" spark={chart.map((d) => d.total)} />
        <Stat label="A receber" value={formatBRL(stats.pendingRevenue)} hint="Aguardando pagamento" icon={Clock3} tone="amber" />
        <Stat label="Reembolsado" value={formatBRL(stats.refundedRevenue)} hint="Devolvido aos clientes" icon={RotateCcw} tone="neutral" />
        <Stat label="Ticket médio" value={formatBRL(ticket)} hint={`${stats.approvedCount} venda(s) aprovada(s)`} icon={ReceiptText} tone="green" />
      </section>

      <Card className="mt-4" title="Faturamento por dia" subtitle="Somente pagamentos aprovados">
        <div className="pt-8">
          <RevenueChart data={chart} />
        </div>
      </Card>

      <Card className="mt-4" title="Dia a dia" padded={false}>
        <ul className="mt-2 divide-y divide-ad-line">
          {[...days].reverse().map((point) => (
            <li key={point.date} className="flex items-center gap-3 px-5 py-3 sm:gap-4 sm:px-6">
              <span className="w-24 shrink-0 text-[13.5px] capitalize text-ad-ink-2 sm:w-28">{dayFmt.format(new Date(`${point.date}T12:00:00Z`)).replace(/\./g, "")}</span>
              <span className="hidden h-2 flex-1 overflow-hidden rounded-full bg-ad-soft sm:block">
                <span className="block h-full rounded-full bg-ad-red" style={{ width: `${(point.total / best) * 100}%` }} />
              </span>
              <span className="ml-auto text-right text-[12.5px] text-ad-muted sm:ml-0 sm:w-20">{point.orders} pedido(s)</span>
              <span className={cn("w-24 text-right text-[14px] font-semibold tabular-nums sm:w-28", point.total ? "text-ad-ink" : "text-ad-faint")}>{formatBRL(point.total)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-4 px-1 text-[12.5px] leading-relaxed text-ad-muted">
        Valores brutos dos pedidos criados no período. Não descontam taxas do Mercado Pago, custos ou despesas e não representam o saldo disponível no banco.
      </p>
      <Link href="/admin/pedidos" className="mt-3 inline-flex items-center gap-1 px-1 text-[14px] font-semibold text-ad-red">
        Ver pedidos e pagamentos <ChevronRight className="size-4" />
      </Link>
    </Page>
  );
}
