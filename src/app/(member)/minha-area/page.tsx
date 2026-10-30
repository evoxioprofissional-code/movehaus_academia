import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  Download,
  Dumbbell,
  LogOut,
  Package,
  Pencil,
  RefreshCw,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { getPlanTree, getOpenSession, todayWeekday } from "@/lib/coaching/workouts";
import { getProgress } from "@/lib/coaching/gamification";
import { signOut } from "@/lib/auth/actions";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/customer/profile-form";
import { CoachingEntry } from "@/components/customer/coaching-entry";
import { getCustomerOverview } from "@/lib/customer/data";
import { cancelSubscription } from "@/lib/customer/actions";
import { whatsappLink } from "@/lib/site";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Minha MoveHaus" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "America/Sao_Paulo" }).format(new Date()));
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
}

function SectionTitle({ icon: Icon, children }: { icon: typeof BookOpen; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-6 shrink-0 text-mh-red" strokeWidth={1.8} aria-hidden="true" />
      <h2 className="text-[22px] font-bold tracking-tight text-white sm:text-2xl">{children}</h2>
    </div>
  );
}

export default async function MinhaAreaPage() {
  const user = await requireUser("/minha-area");
  const [profile, coaching, overview] = await Promise.all([getProfile(), hasCoachingAccess(), getCustomerOverview()]);
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Atleta";
  const rawFirstName = displayName.trim().split(/\s+/)[0];
  const firstName = rawFirstName.charAt(0).toLocaleUpperCase("pt-BR") + rawFirstName.slice(1);
  const productById = new Map(overview.products.map((product) => [product.id, product]));
  const progressById = new Map(overview.progress.map((progress) => [progress.product_id, progress]));

  let coachingEntry = { hasPlan: false, todayLabel: null as string | null, todayExercises: 0, points: 0, hasOpenSession: false };
  if (coaching) {
    const [tree, progress, openSession] = await Promise.all([
      getPlanTree(user.id),
      getProgress(user.id),
      getOpenSession(user.id),
    ]);
    const todayDay = tree.days.find((day) => day.weekday === todayWeekday()) ?? null;
    coachingEntry = {
      hasPlan: Boolean(tree.plan),
      todayLabel: todayDay?.name ?? null,
      todayExercises: todayDay?.exercises.length ?? 0,
      points: progress.points,
      hasOpenSession: Boolean(openSession),
    };
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-x-12 px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,.97fr)] lg:gap-x-14 lg:pt-16">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mh-red">Minha área</p>
        <h1 className="mt-2 text-[clamp(2rem,7.5vw,2.9rem)] font-bold leading-[1.1] tracking-[-0.045em] text-white">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-2 text-[15px] text-white/55">Seu espaço de treino e evolução.</p>

        {coaching && (
          <span className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-[#111216] px-4 text-sm font-medium text-white">
            <Star className="size-5 text-mh-red" strokeWidth={1.8} aria-hidden="true" />
            {coachingEntry.points} {coachingEntry.points === 1 ? "ponto" : "pontos"}
          </span>
        )}

        <div className="mt-5">
          <CoachingEntry
            hasAccess={coaching}
            hasPlan={coachingEntry.hasPlan}
            todayLabel={coachingEntry.todayLabel}
            todayExercises={coachingEntry.todayExercises}
            hasOpenSession={coachingEntry.hasOpenSession}
            joinHref={whatsappLink("Olá! Quero assinar o MoveHaus Acompanhamento.")}
          />
        </div>

        <nav aria-label="Acesso rápido" className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {[
            { href: "/acompanhamento", label: "Treino", icon: Dumbbell },
            { href: "#biblioteca", label: "Biblioteca", icon: BookOpen },
            { href: "#compras", label: "Compras", icon: ShoppingBag },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href} className="group flex min-h-28 min-w-0 flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#111216] p-3.5 transition-colors hover:border-white/20 hover:bg-[#17191e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red sm:min-h-32 sm:p-5">
              <Icon className="size-6 text-mh-red sm:size-7" strokeWidth={1.7} aria-hidden="true" />
              <span className="flex w-full items-center justify-between gap-1 text-[13px] font-semibold text-white sm:text-base">
                <span className="truncate">{label}</span><ChevronRight className="size-4 shrink-0 text-white/60 group-hover:text-white" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </nav>

        <Link href="/acompanhamento/corpo" className="mt-5 hidden items-center gap-2 text-sm font-medium text-white/60 hover:text-white lg:inline-flex">
          <BarChart3 className="size-4 text-mh-red" /> Ver minha evolução <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="min-w-0 pt-12 lg:pt-0">
        <section id="biblioteca" className="scroll-mt-24">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle icon={BookOpen}>Sua biblioteca</SectionTitle>
            <Link href="/ebooks" className="shrink-0 text-xs font-semibold text-mh-red hover:text-mh-red-soft sm:text-sm">Ver todos <ArrowRight className="ml-1 inline size-4" /></Link>
          </div>

          {overview.access.length === 0 ? (
            <div className="mt-4 flex min-h-28 items-center gap-5 rounded-2xl border border-white/[0.08] bg-[#111216] p-5">
              <BookOpen className="size-9 shrink-0 text-white/20" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-sm text-white/60">Nenhum conteúdo liberado ainda.</p>
                <Link href="/ebooks" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-mh-red hover:text-mh-red-soft">Explorar conteúdos <ArrowRight className="size-4" /></Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {overview.access.map((access) => {
                const product = productById.get(access.product_id);
                if (!product) return null;
                const progress = progressById.get(access.product_id);
                const complete = Math.round(progress?.progress_percent ?? 0);
                return (
                  <article key={access.id} className="rounded-2xl border border-white/[0.08] bg-[#111216] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[11px] font-semibold uppercase tracking-widest text-mh-red">{product.type === "ebook" ? "E-book" : "Conteúdo"}</p><h3 className="mt-1 font-semibold text-white">{product.name}</h3></div>
                      <Badge tone={access.available ? "success" : "muted"}>{access.available ? access.permanent ? "Permanente" : "Liberado" : "Indisponível"}</Badge>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mh-red" style={{ width: `${complete}%` }} /></div>
                    <p className="mt-2 text-xs text-white/50">{complete}% concluído{access.expires_at && !access.permanent ? ` · Acesso até ${new Intl.DateTimeFormat("pt-BR").format(new Date(access.expires_at))}` : ""}</p>
                    {access.available && product.type === "ebook" && <Link href={`/minha-area/ler/${product.slug}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-mh-red hover:text-mh-red-soft">{complete > 0 ? "Continuar leitura" : "Começar leitura"}<ArrowRight className="size-4" /></Link>}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="compras" className="mt-10 scroll-mt-24">
          <SectionTitle icon={Package}>Compras e assinaturas</SectionTitle>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111216]">
            <details className="group">
              <summary className="flex min-h-21 cursor-pointer list-none items-center gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red [&::-webkit-details-marker]:hidden">
                <ShoppingBag className="size-6 shrink-0 text-white/65" strokeWidth={1.7} aria-hidden="true" />
                <span className="min-w-0 flex-1"><strong className="block text-sm text-white">Pedidos</strong><span className="mt-0.5 block text-sm text-white/55">{overview.orders.length ? `${overview.orders.length} ${overview.orders.length === 1 ? "pedido" : "pedidos"}` : "Nenhum pedido"}</span></span>
                <ChevronRight className="size-5 text-white/60 transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <div className="space-y-3 border-t border-white/[0.08] px-5 py-4">
                {overview.orders.length === 0 ? <p className="text-sm text-white/55">Nenhum pedido registrado nesta conta.</p> : overview.orders.map((order) => (
                  <article key={order.id} className="border-b border-white/[0.08] pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-white">Pedido #{order.order_number}</p><p className="text-xs text-white/50">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(order.created_at))}</p></div><div className="text-right"><Badge tone={order.status === "cancelled" ? "muted" : order.status === "delivered" ? "success" : "red"}>{order.status}</Badge><p className="mt-1 text-sm font-semibold text-white">{formatBRL(order.total)}</p></div></div>
                    <ul className="mt-2 text-xs text-white/55">{order.items.map((item) => <li key={item.id}>{item.quantity}× {item.product_name}</li>)}</ul>
                  </article>
                ))}
              </div>
            </details>
            <details className="group border-t border-white/[0.08]">
              <summary className="flex min-h-21 cursor-pointer list-none items-center gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red [&::-webkit-details-marker]:hidden">
                <RefreshCw className="size-6 shrink-0 text-mh-red" strokeWidth={1.7} aria-hidden="true" />
                <span className="min-w-0 flex-1"><strong className="block text-sm text-white">Assinaturas</strong><span className="mt-0.5 block text-sm text-white/55">{overview.subscriptions.length ? `${overview.subscriptions.length} ${overview.subscriptions.length === 1 ? "assinatura" : "assinaturas"}` : "Nenhuma assinatura"}</span></span>
                <ChevronRight className="size-5 text-white/60 transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <div className="space-y-4 border-t border-white/[0.08] px-5 py-4">
                {overview.subscriptions.length === 0 ? <p className="text-sm text-white/55">Nenhuma assinatura vinculada à sua conta.</p> : overview.subscriptions.map((subscription) => {
                  const product = productById.get(subscription.product_id);
                  return <article key={subscription.id} className="border-b border-white/[0.08] pb-4 last:border-0 last:pb-0"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-white">{product?.name ?? "Conteúdo MoveHaus"}</h3><p className="mt-1 text-xs text-white/55">{formatBRL(subscription.monthly_amount)}/mês</p></div><Badge tone={subscription.status === "active" ? "success" : "muted"}>{({ pending: "Aguardando pagamento", active: "Ativa", past_due: "Pagamento pendente", cancelled: "Cancelada", expired: "Encerrada" })[subscription.status]}</Badge></div>{subscription.current_period_end && <p className="mt-2 text-xs text-white/55">Acesso atual até {new Intl.DateTimeFormat("pt-BR").format(new Date(subscription.current_period_end))}</p>}{["pending", "active", "past_due"].includes(subscription.status) && <form action={cancelSubscription} className="mt-3"><input type="hidden" name="id" value={subscription.id} /><button type="submit" className="min-h-10 text-xs font-semibold text-mh-red hover:text-mh-red-soft">Cancelar cobrança mensal</button></form>}</article>;
                })}
              </div>
            </details>
          </div>
        </section>

        <section id="perfil" className="mt-10 scroll-mt-24">
          <SectionTitle icon={UserRound}>Seus dados</SectionTitle>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111216]">
            <details className="group">
              <summary className="flex min-h-17 cursor-pointer list-none items-center gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red [&::-webkit-details-marker]:hidden"><Pencil className="size-5 text-white/75" aria-hidden="true" /><span className="flex-1 text-sm font-semibold text-white">Editar perfil</span><ChevronRight className="size-5 text-white/60 transition-transform group-open:rotate-90" aria-hidden="true" /></summary>
              <div className="border-t border-white/[0.08] px-5 py-5"><ProfileForm name={profile?.full_name ?? ""} whatsapp={profile?.whatsapp ?? ""} email={user.email ?? ""} /></div>
            </details>
            <a href="/minha-area/exportar" className="flex min-h-17 items-center gap-4 border-t border-white/[0.08] px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red"><Download className="size-5 text-white/75" aria-hidden="true" /><span className="flex-1 text-sm font-semibold text-white">Exportar dados</span><ChevronRight className="size-5 text-white/60" aria-hidden="true" /></a>
          </div>
          <form action={signOut} className="mt-3 flex justify-end"><button type="submit" className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-white/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"><LogOut className="size-4" /> Sair da conta</button></form>
        </section>
      </div>
    </div>
  );
}
