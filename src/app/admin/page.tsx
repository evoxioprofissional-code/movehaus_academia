import Link from "next/link";
import { AlertTriangle, BarChart3, BookOpenText, Box, ChevronRight, Dumbbell, ExternalLink, Package, Plus, ReceiptText, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardOperationalData, dashboardPeriodData } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Visão geral | MoveHaus Admin" };

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const period = Number(params.period || 30);
  const [stats, operational] = await Promise.all([dashboardPeriodData(period), dashboardOperationalData()]);
  const maxSale = Math.max(...stats.salesByDay.map((point) => point.total), 1);
  const metrics = [
    { label: "Faturamento", value: formatBRL(stats.revenue), detail: "Pagamentos aprovados", icon: BarChart3 },
    { label: "Pedidos", value: stats.orderCount, detail: "Neste período", icon: ShoppingCart },
    { label: "Alunos", value: stats.customers, detail: "Cadastrados", icon: Users },
    { label: "Assinaturas", value: stats.subscriptions, detail: "Ativas", icon: ReceiptText },
  ];

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="text-[32px] font-bold tracking-[-0.035em] text-white sm:text-[36px]">Visão geral</h1><p className="mt-1 text-sm text-admin-muted">Sua loja e seus alunos em um só lugar.</p></div>
        <div className="flex flex-wrap gap-2">
          <form className="flex gap-2"><select name="period" defaultValue={String(stats.days)} aria-label="Período" className="admin-control h-11 px-3 text-sm"><option value="1">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select><Button type="submit" variant="outline">Aplicar</Button></form>
          <Button asChild variant="outline"><Link href="/" target="_blank"><ExternalLink className="size-4" />Ver loja</Link></Button>
        </div>
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <article key={metric.label} className="admin-panel flex min-h-[112px] items-center gap-4 p-4"><span className="grid size-12 shrink-0 place-items-center rounded-lg border border-white/5 bg-[#20232a]"><metric.icon className="size-5 text-[#e5e7eb]" /></span><div><p className="text-xs text-admin-muted">{metric.label}</p><p className="mt-0.5 text-2xl font-bold tabular-nums text-white">{metric.value}</p><p className="mt-0.5 text-xs text-admin-muted">{metric.detail}</p></div></article>)}
      </section>

      <nav aria-label="Áreas do painel" className="admin-panel mt-3 grid overflow-hidden sm:grid-cols-3">
        <Link href="/admin" className="flex h-12 items-center justify-center gap-2 bg-admin-red text-sm font-semibold text-white"><BarChart3 className="size-4" />Visão geral</Link>
        <Link href="/admin/produtos" className="flex h-12 items-center justify-center gap-2 border-t border-admin-border text-sm text-white hover:bg-white/[0.03] sm:border-l sm:border-t-0"><Box className="size-4" />Loja</Link>
        <Link href="/admin/acompanhamento" className="flex h-12 items-center justify-center gap-2 border-t border-admin-border text-sm text-white hover:bg-white/[0.03] sm:border-l sm:border-t-0"><Users className="size-4" />Acompanhamento</Link>
      </nav>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.45fr_1fr]">
        <article className="admin-panel min-h-[318px] p-5">
          <h2 className="text-lg font-semibold text-white">Vendas por período</h2><p className="mt-1 text-xs text-admin-muted">Os valores aparecem conforme os pedidos aprovados.</p>
          {stats.approvedCount === 0 ? <div className="grid min-h-[235px] place-items-center text-center"><div><BarChart3 className="mx-auto size-9 text-[#6f7582]" /><p className="mt-4 font-semibold text-white">Nenhuma venda neste período</p><p className="mt-1 text-sm text-admin-muted">As vendas aprovadas aparecerão aqui.</p><Button asChild variant="outline" size="sm" className="mt-4"><Link href="/admin/pedidos">Ver pedidos</Link></Button></div></div> : <div className="mt-8 flex h-[205px] items-end gap-1.5 border-b border-admin-border pb-1" aria-label="Vendas aprovadas por dia">{stats.salesByDay.map((point) => <div key={point.date} className="group relative flex min-w-1 flex-1 items-end justify-center"><div className="w-full max-w-8 rounded-t-sm bg-admin-red transition-colors hover:bg-admin-red-hover" style={{ height: `${Math.max(4, (point.total / maxSale) * 100)}%` }} /><span className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] group-hover:block">{formatBRL(point.total)}</span></div>)}</div>}
        </article>

        <div className="grid gap-3">
          <article className="admin-panel p-5"><h2 className="text-lg font-semibold">Ações rápidas</h2><div className="mt-4 grid gap-2 sm:grid-cols-2"><Button asChild className="justify-start"><Link href="/admin/acompanhamento"><Dumbbell className="size-4" />Montar treino</Link></Button><Button asChild variant="outline" className="justify-start"><Link href="/admin/produtos/novo"><Box className="size-4" />Novo produto</Link></Button><Button asChild variant="outline" className="justify-start"><Link href="/admin/conteudos"><BookOpenText className="size-4" />Novo conteúdo</Link></Button><Button asChild variant="outline" className="justify-start"><Link href="/admin/promocoes"><Plus className="size-4" />Nova promoção</Link></Button></div></article>
          <article className="admin-panel p-5"><h2 className="text-lg font-semibold">Precisa de atenção</h2>{stats.lowStock > 0 ? <Link href="/admin/produtos?stock=low" className="mt-4 flex items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.07] p-3"><span className="grid size-10 place-items-center rounded-md bg-amber-500/10"><AlertTriangle className="size-5 text-amber-400" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-amber-300">{stats.lowStock} produto(s) com estoque baixo</strong><span className="text-xs text-admin-muted">Revise o estoque para manter a loja disponível.</span></span><ChevronRight className="size-4 text-admin-red" /></Link> : <p className="mt-4 text-sm text-admin-muted">Nenhuma pendência crítica agora.</p>}</article>
        </div>
      </section>

      <section className="mt-3 grid gap-3 lg:grid-cols-2">
        <article className="admin-panel p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Acompanhamento dos alunos</h2><Link href="/admin/acompanhamento" className="text-xs font-medium text-admin-red hover:text-white">Ver alunos →</Link></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="flex items-center gap-3 rounded-lg border border-admin-border p-3"><span className="grid size-10 place-items-center rounded-md bg-[#20232a]"><Users className="size-5" /></span><div><strong className="text-xl">{stats.customers}</strong><p className="text-xs text-admin-muted">alunos cadastrados</p></div></div><div className="flex items-center gap-3 rounded-lg border border-admin-border p-3"><span className="grid size-10 place-items-center rounded-md bg-[#20232a]"><ReceiptText className="size-5" /></span><div><strong className="text-xl">{stats.subscriptions}</strong><p className="text-xs text-admin-muted">assinaturas ativas</p></div></div></div><div className="mt-4 divide-y divide-admin-border border-t border-admin-border"><Link href="/admin/acompanhamento" className="flex items-center gap-3 py-3 text-sm hover:text-admin-red"><Dumbbell className="size-5" /><span className="flex-1"><strong className="block">Gerenciar treinos</strong><span className="text-xs font-normal text-admin-muted">Criar e ajustar planos individuais</span></span><ChevronRight className="size-4" /></Link><Link href="/admin/acompanhamento" className="flex items-center gap-3 py-3 text-sm hover:text-admin-red"><BarChart3 className="size-5" /><span className="flex-1"><strong className="block">Consultar evolução</strong><span className="text-xs font-normal text-admin-muted">Acompanhar os registros dos alunos</span></span><ChevronRight className="size-4" /></Link></div></article>
        <article className="admin-panel p-5"><h2 className="text-lg font-semibold">Resumo da loja</h2><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg border border-admin-border p-3"><Package className="size-4 text-admin-muted" /><strong className="mt-2 block text-xl">{stats.activeProducts}</strong><span className="text-[11px] text-admin-muted">Produtos ativos</span></div><div className="rounded-lg border border-admin-border p-3"><AlertTriangle className={stats.lowStock ? "size-4 text-amber-400" : "size-4 text-admin-muted"} /><strong className="mt-2 block text-xl">{stats.lowStock}</strong><span className="text-[11px] text-admin-muted">Estoque baixo</span></div><div className="rounded-lg border border-admin-border p-3"><ShoppingCart className="size-4 text-admin-muted" /><strong className="mt-2 block text-xl">{stats.approvedCount}</strong><span className="text-[11px] text-admin-muted">Vendas aprovadas</span></div></div><div className="mt-4 border-t border-admin-border pt-4">{stats.recentOrders.length === 0 ? <div className="py-5 text-center"><ReceiptText className="mx-auto size-7 text-[#747986]" /><p className="mt-2 text-sm font-semibold">Ainda não há pedidos recentes</p><p className="mt-1 text-xs text-admin-muted">Os pedidos aparecerão aqui quando forem realizados.</p><Link href="/admin/pedidos" className="mt-3 inline-flex text-xs font-medium text-admin-red">Ver todos os pedidos →</Link></div> : <div className="divide-y divide-admin-border">{stats.recentOrders.map((order) => <div key={order.id} className="flex items-center justify-between py-2.5 text-sm"><div><strong>#{order.order_number}</strong><p className="text-xs text-admin-muted">{order.status}</p></div><span>{formatBRL(order.total)}</span></div>)}</div>}</div></article>
      </section>

      {operational.bestSellers.length > 0 && <section className="admin-panel mt-3 p-5"><h2 className="text-lg font-semibold">Produtos mais vendidos</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{operational.bestSellers.slice(0, 4).map((product, index) => <div key={product.name} className="flex items-center gap-3 rounded-lg border border-admin-border p-3"><span className="grid size-8 place-items-center rounded-md bg-[#20232a] text-xs">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs text-admin-muted">{product.quantity} unidade(s)</p></div></div>)}</div></section>}
    </div>
  );
}
