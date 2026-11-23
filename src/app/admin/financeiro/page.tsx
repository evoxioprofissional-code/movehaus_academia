import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { dashboardPeriodData } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Financeiro | MoveHaus Admin" };

export default async function FinancialPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const stats = await dashboardPeriodData(Number(params.period || 30));
  const cards = [
    { label: "Receita aprovada", value: formatBRL(stats.revenue) },
    { label: "Aguardando pagamento", value: formatBRL(stats.pendingRevenue) },
    { label: "Reembolsado", value: formatBRL(stats.refundedRevenue) },
    { label: "Ticket médio", value: formatBRL(stats.approvedCount ? Math.round(stats.revenue / stats.approvedCount) : 0) },
  ];
  return <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
    <AdminPageHeader title="Financeiro" description="Receitas e situação dos pagamentos da loja." />
    <form className="mt-5 flex gap-2"><select name="period" defaultValue={String(stats.days)} aria-label="Período" className="admin-control h-11 px-3 text-sm"><option value="1">Últimas 24 horas</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select><button className="rounded-lg bg-admin-red px-4 text-sm font-semibold">Aplicar</button></form>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card => <article key={card.label} className="admin-panel p-5"><p className="text-sm text-admin-muted">{card.label}</p><strong className="mt-2 block text-2xl">{card.value}</strong></article>)}</section>
    <p className="mt-4 text-xs text-admin-muted">Valores brutos de pedidos criados no período. Não descontam taxas, custos ou despesas e não representam o saldo disponível no banco. Reembolsos exibem o total dos pedidos com esse status.</p>
    <section className="admin-panel mt-5 overflow-hidden"><h2 className="p-5 text-lg font-semibold">Vendas por dia</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-admin-border text-admin-muted"><tr><th className="px-5 py-3">Data</th><th className="px-5 py-3 text-right">Receita aprovada</th></tr></thead><tbody className="divide-y divide-admin-border">{[...stats.salesByDay].reverse().map(point => <tr key={point.date}><td className="px-5 py-3">{point.date.split("-").reverse().join("/")}</td><td className="px-5 py-3 text-right tabular-nums">{formatBRL(point.total)}</td></tr>)}</tbody></table></div></section>
    <Link href="/admin/pedidos" className="mt-5 inline-flex text-sm font-semibold text-admin-red">Consultar pedidos e pagamentos →</Link>
  </div>;
}
