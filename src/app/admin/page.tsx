import Link from "next/link";
import { AlertTriangle, BookOpenText, CircleDollarSign, Package, Plus, ReceiptText, ShoppingBag, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { dashboardStats } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Visão geral | MoveHaus Admin" };

export default async function AdminDashboardPage() {
  const stats = await dashboardStats();
  const metrics = [
    { label: "Faturamento", value: formatBRL(stats.revenue), detail: "pagamentos aprovados", icon: CircleDollarSign },
    { label: "Vendas", value: stats.sales, detail: "no período", icon: ShoppingBag },
    { label: "Pedidos", value: stats.orders, detail: "todos os status", icon: ReceiptText },
    { label: "Ticket médio", value: formatBRL(stats.averageTicket), detail: "por venda aprovada", icon: CircleDollarSign },
    { label: "Assinaturas", value: stats.subscriptions, detail: "produtos recorrentes ativos", icon: BookOpenText },
    { label: "Clientes", value: stats.customers, detail: "contas cadastradas", icon: Users },
    { label: "Produtos ativos", value: stats.activeProducts, detail: `${stats.products} cadastrados`, icon: Package },
    { label: "Estoque baixo", value: stats.lowStock, detail: "itens para revisar", icon: AlertTriangle, warning: stats.lowStock > 0 },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <AdminPageHeader
        title="Visão geral"
        description="Acompanhe a operação da loja e encontre rapidamente o que precisa de atenção."
        action={<select aria-label="Período" className="h-10 rounded-md border border-white/10 bg-mh-surface px-3 text-sm text-white outline-none focus:border-mh-red"><option>Hoje</option><option>Últimos 7 dias</option><option>Últimos 30 dias</option><option>Período personalizado</option></select>}
      />

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg bg-mh-surface px-4 py-4">
            <div className="flex items-center justify-between gap-3"><p className="text-sm text-mh-muted">{metric.label}</p><metric.icon className={metric.warning ? "size-4 text-amber-400" : "size-4 text-mh-muted"} /></div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-mh-muted">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg bg-mh-surface p-5">
          <h2 className="font-semibold text-white">Vendas por período</h2><p className="text-sm text-mh-muted">Os valores aparecem conforme os pedidos aprovados.</p>
          {stats.sales === 0 ? (
            <div className="grid min-h-64 place-items-center text-center"><div><ReceiptText className="mx-auto size-7 text-mh-muted" /><p className="mt-3 text-sm font-medium text-white">Ainda não há vendas aprovadas</p><p className="mt-1 text-sm text-mh-muted">O gráfico será preenchido automaticamente quando houver dados reais.</p></div></div>
          ) : <div className="mt-6 flex h-56 items-end gap-2" aria-label="Gráfico de vendas"><div className="h-1/2 flex-1 rounded-t bg-mh-red" /></div>}
        </div>
        <div className="rounded-lg bg-mh-surface p-5">
          <h2 className="font-semibold text-white">Ações rápidas</h2>
          <div className="mt-4 grid gap-2"><Button asChild className="justify-start"><Link href="/admin/produtos/novo"><Plus className="size-4" />Novo produto</Link></Button><Button asChild variant="outline" className="justify-start"><Link href="/admin/conteudos"><BookOpenText className="size-4" />Novo conteúdo</Link></Button><Button asChild variant="outline" className="justify-start"><Link href="/admin/promocoes"><Plus className="size-4" />Nova promoção</Link></Button></div>
          {stats.lowStock > 0 && <Link href="/admin/produtos?stock=low" className="mt-5 flex gap-3 rounded-md bg-amber-400/10 p-3 text-sm text-amber-200"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span><strong>{stats.lowStock} produtos</strong> chegaram ao estoque mínimo. Revisar agora.</span></Link>}
        </div>
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {["Pedidos recentes", "Produtos mais vendidos"].map((title) => <div key={title} className="rounded-lg bg-mh-surface p-5"><h2 className="font-semibold text-white">{title}</h2><div className="mt-8 pb-5 text-center text-sm text-mh-muted">Nenhum dado real disponível neste momento.</div></div>)}
      </section>
    </div>
  );
}
