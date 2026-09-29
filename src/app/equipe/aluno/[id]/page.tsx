import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireStaff } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { getPlanTree } from "@/lib/coaching/workouts";
import { getProgress } from "@/lib/coaching/gamification";
import { getBodyData } from "@/lib/coaching/body";
import { getMealPlanTree } from "@/lib/coaching/nutrition";

export const metadata = { title: "Aluno | MoveHaus Equipe" };

const fmt = (d: string | null) => (d ? new Intl.DateTimeFormat("pt-BR").format(new Date(d)) : "—");

export default async function EquipeAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles").select("full_name, email, whatsapp").eq("id", id).maybeSingle();
  if (!profile) notFound();

  const [plan, progress, body, meals] = await Promise.all([
    getPlanTree(id),
    getProgress(id),
    getBodyData(id),
    getMealPlanTree(id),
  ]);
  const name = profile.full_name || profile.email || "Aluno";
  const wa = (profile.whatsapp ?? "").replace(/\D/g, "");
  const waUrl = wa ? `https://wa.me/${wa.length <= 11 ? "55" + wa : wa}` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/equipe" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Equipe
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{name}</h1>
          <p className="text-sm text-mh-muted">{profile.email}</p>
        </div>
        {waUrl && (
          <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600/15 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-600/25">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        )}
      </div>

      {/* Progresso */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-mh-surface p-4">
          <p className="text-xs text-mh-muted">Pontos</p>
          <p className="mt-1 text-2xl font-semibold text-white">{progress.points}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-mh-surface p-4">
          <p className="text-xs text-mh-muted">Conquistas</p>
          <p className="mt-1 text-2xl font-semibold text-white">{progress.achievements.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-mh-surface p-4">
          <p className="text-xs text-mh-muted">Metas ativas</p>
          <p className="mt-1 text-2xl font-semibold text-white">{progress.goals.filter((g) => g.status !== "achieved").length}</p>
        </div>
      </section>

      {progress.goals.length > 0 && (
        <section className="mt-4 rounded-lg border border-white/10 bg-mh-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Metas</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {progress.goals.map((g) => (
              <li key={g.id} className="flex justify-between gap-3">
                <span className="text-white">{g.title}</span>
                <span className="text-mh-muted">{g.status === "achieved" ? "concluída" : `${g.current}/${g.target}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Treino */}
      <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Treino</h2>
          <Link href={`/admin/acompanhamento/${id}/treino`} className="text-xs text-mh-red-soft hover:underline">Editar (admin)</Link>
        </div>
        {plan.plan ? (
          <ul className="mt-2 space-y-1 text-sm">
            {plan.days.map((d) => (
              <li key={d.id} className="text-white">{d.name} <span className="text-mh-muted">· {d.exercises.length} exercícios</span></li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-mh-muted">Sem plano de treino.</p>}
      </section>

      {/* Corpo */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-mh-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Medidas recentes</h2>
          {body.latest ? (
            <p className="mt-2 text-sm text-mh-muted">
              {fmt(body.latest.measured_on)}:{" "}
              {body.latest.weight != null && <span className="text-white">{body.latest.weight}kg </span>}
              {body.latest.waist != null && <span className="text-white">cintura {body.latest.waist}cm </span>}
              {body.latest.body_fat != null && <span className="text-white">%G {body.latest.body_fat}</span>}
            </p>
          ) : <p className="mt-2 text-sm text-mh-muted">Sem registros.</p>}
          <p className="mt-2 text-xs text-mh-muted">Hidratação hoje: {(body.hydration.total_ml / 1000).toFixed(2)}L</p>
          <p className="mt-1 text-xs text-mh-muted">Fotos de evolução são privadas do aluno.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-mh-surface p-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Check-ins</h2>
          {body.checkins.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {body.checkins.slice(0, 4).map((c) => (
                <li key={c.id} className="flex justify-between gap-2">
                  <span className="text-mh-muted">{fmt(c.created_at)}</span>
                  <span className="text-white">⚡{c.energy ?? "—"} 😴{c.sleep ?? "—"} 🍎{c.nutrition ?? "—"}{c.pain ? " · dor" : ""}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-mh-muted">Sem check-ins.</p>}
        </div>
      </section>

      {/* Nutrição */}
      <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Nutrição</h2>
          <Link href={`/admin/acompanhamento/${id}/nutricao`} className="text-xs text-mh-red-soft hover:underline">Editar (admin)</Link>
        </div>
        {meals.plan ? (
          <ul className="mt-2 space-y-1 text-sm">
            {meals.meals.map((m) => (
              <li key={m.id} className="text-white">{m.time_label && <span className="text-mh-muted">{m.time_label} · </span>}{m.name} <span className="text-mh-muted">· {m.items.length} itens</span></li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-mh-muted">Sem plano alimentar.</p>}
      </section>
    </div>
  );
}
