import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, Dumbbell, LogOut, Package, RefreshCw } from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/customer/profile-form";
import { getCustomerOverview } from "@/lib/customer/data";
import { cancelSubscription } from "@/lib/customer/actions";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Minha área" };

export default async function MinhaAreaPage() {
  const user = await requireUser("/minha-area");
  const [profile, coaching, overview] = await Promise.all([getProfile(), hasCoachingAccess(), getCustomerOverview()]);
  const displayName = profile?.full_name || user.email || "Atleta";
  const firstName = displayName.split(" ")[0];
  const productById = new Map(overview.products.map((product) => [product.id, product]));
  const progressById = new Map(overview.progress.map((progress) => [progress.product_id, progress]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
            Minha MoveHaus
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-mh-muted">
            Acompanhe suas compras, assinaturas e conteúdos liberados.
          </p>
        </div>
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="size-4" />
            Sair
          </Button>
        </form>
      </div>

      {/* Acompanhamento */}
      <Link
        href="/acompanhamento"
        className="group mt-6 flex items-center justify-between gap-4 rounded-lg border border-mh-red/30 bg-[radial-gradient(90%_140%_at_0%_0%,rgba(229,18,28,0.14),transparent)] p-5 transition-colors hover:border-mh-red/60"
      >
        <div className="flex items-center gap-3">
          <Dumbbell className="size-6 shrink-0 text-mh-red" />
          <div>
            <p className="font-semibold text-white">MoveHaus Acompanhamento</p>
            <p className="text-sm text-mh-muted">
              {coaching
                ? "Seu treino, evolução e metas — entrar na área."
                : "Treino, nutrição e evolução com a equipe. Conhecer."}
            </p>
          </div>
        </div>
        <ArrowRight className="size-5 shrink-0 text-mh-muted transition-transform group-hover:translate-x-0.5" />
      </Link>

      <section className="mt-10">
        <div className="flex items-center gap-2"><BookOpen className="size-5 text-mh-red" /><h2 className="text-xl font-semibold text-white">Sua biblioteca</h2></div>
        {overview.access.length === 0 ? <p className="mt-4 rounded-xl bg-mh-surface p-5 text-sm text-mh-muted">Você ainda não possui conteúdos liberados. <Link href="/ebooks" className="font-medium text-white underline underline-offset-4">Conhecer conteúdos</Link></p> : <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{overview.access.map((access) => { const product = productById.get(access.product_id); const progress = progressById.get(access.product_id); if (!product) return null; const expired = !access.available; return <article key={access.id} className="rounded-xl bg-mh-surface p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-mh-muted">{product.type === "ebook" ? "E-book" : "Conteúdo"}</p><h3 className="mt-1 font-semibold text-white">{product.name}</h3></div><Badge tone={expired ? "muted" : "success"}>{expired ? "Indisponível" : access.permanent ? "Permanente" : "Liberado"}</Badge></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-mh-red" style={{ width: `${progress?.progress_percent ?? 0}%` }} /></div><p className="mt-2 text-xs text-mh-muted">{Math.round(progress?.progress_percent ?? 0)}% concluído</p>{!expired && product.type === "ebook" && <Button asChild className="mt-4 w-full"><Link href={`/minha-area/ler/${product.slug}`}>{progress ? "Continuar leitura" : "Começar leitura"}</Link></Button>}</article>; })}</div>}
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2"><Package className="size-5 text-mh-red" /><h2 className="text-xl font-semibold text-white">Pedidos</h2></div>
        {overview.orders.length === 0 ? <p className="mt-4 rounded-xl bg-mh-surface p-5 text-sm text-mh-muted">Nenhum pedido registrado nesta conta.</p> : <div className="mt-4 space-y-3">{overview.orders.map((order) => <article key={order.id} className="rounded-xl bg-mh-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-white">Pedido #{order.order_number}</p><p className="text-xs text-mh-muted">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(order.created_at))}</p></div><div className="text-right"><Badge tone={order.status === "cancelled" ? "muted" : order.status === "delivered" ? "success" : "red"}>{order.status}</Badge><p className="mt-2 font-semibold text-white">{formatBRL(order.total)}</p></div></div><ul className="mt-4 border-t border-white/8 pt-3 text-sm text-mh-muted">{order.items.map((item) => <li key={item.id}>{item.quantity}× {item.product_name}</li>)}</ul></article>)}</div>}
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2"><RefreshCw className="size-5 text-mh-red" /><h2 className="text-xl font-semibold text-white">Assinaturas</h2></div>
        {overview.subscriptions.length === 0 ? <p className="mt-4 rounded-xl bg-mh-surface p-5 text-sm text-mh-muted">Nenhuma assinatura vinculada à sua conta.</p> : <div className="mt-4 grid gap-4 sm:grid-cols-2">{overview.subscriptions.map((subscription) => { const product = productById.get(subscription.product_id); return <article key={subscription.id} className="rounded-xl bg-mh-surface p-5"><div className="flex justify-between gap-3"><div><h3 className="font-semibold text-white">{product?.name ?? "Conteúdo MoveHaus"}</h3><p className="mt-1 text-sm text-mh-muted">{formatBRL(subscription.monthly_amount)}/mês</p></div><Badge tone={subscription.status === "active" ? "success" : "muted"}>{subscription.status}</Badge></div>{subscription.current_period_end && <p className="mt-4 text-xs text-mh-muted">Acesso atual até {new Intl.DateTimeFormat("pt-BR").format(new Date(subscription.current_period_end))}</p>}{["pending", "active", "past_due"].includes(subscription.status) && <form action={cancelSubscription} className="mt-4"><input type="hidden" name="id" value={subscription.id} /><Button type="submit" variant="outline" size="sm">Solicitar cancelamento</Button></form>}</article>; })}</div>}
      </section>

      {/* Dados da conta */}
      <div className="mt-10 rounded-lg border border-white/10 bg-mh-surface p-6">
        <h2 className="text-lg font-semibold text-white">Seus dados</h2>
        <div className="mt-4"><ProfileForm name={profile?.full_name ?? ""} whatsapp={profile?.whatsapp ?? ""} email={user.email ?? ""} /></div>
        <Button asChild variant="ghost" size="sm" className="mt-4"><a href="/minha-area/exportar"><Download className="size-4" />Exportar meus dados</a></Button>
      </div>

      <div className="mt-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/loja">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}
