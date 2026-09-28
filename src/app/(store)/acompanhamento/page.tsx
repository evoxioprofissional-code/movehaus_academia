import type { Metadata } from "next";
import {
  Apple,
  Award,
  CheckCircle2,
  Dumbbell,
  Gift,
  LineChart,
  Lock,
  MessageCircle,
  Play,
  Star,
  Target,
} from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { getPlanTree, getRecentSessions, todayWeekday, WEEKDAYS } from "@/lib/coaching/workouts";
import { getProgress, getActiveRewards } from "@/lib/coaching/gamification";
import { startSession } from "@/lib/coaching/workout-actions";
import { redeemReward } from "@/lib/coaching/gamification-actions";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Acompanhamento" };

export default async function AcompanhamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ treino?: string; resgate?: string }>;
}) {
  const user = await requireUser("/acompanhamento");
  const [access, profile, params] = await Promise.all([
    hasCoachingAccess(),
    getProfile(),
    searchParams,
  ]);
  const firstName = (profile?.full_name || "atleta").split(" ")[0];

  // ---------- Sem acesso: convite ----------
  if (!access) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-mh-border px-3 py-1 text-xs font-medium uppercase tracking-widest text-mh-muted">
          <Lock className="size-3.5" /> Área exclusiva
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          MoveHaus <span className="text-mh-red">Acompanhamento</span>
        </h1>
        <p className="mt-3 max-w-xl text-mh-muted">
          Seu treino da semana, modo treino no celular, evolução de carga, metas e
          acompanhamento de nutrição — com a equipe da MoveHaus junto de você.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { icon: Dumbbell, t: "Treino guiado", d: "Plano semanal e modo treino." },
            { icon: LineChart, t: "Evolução", d: "Cargas, medidas e recordes." },
            { icon: Target, t: "Metas e recompensas", d: "Constância que rende benefícios." },
            { icon: Apple, t: "Nutrição", d: "Plano alimentar e receitas." },
          ].map((f) => (
            <li key={f.t} className="flex gap-3 rounded-lg border border-white/10 bg-mh-surface p-4">
              <f.icon className="size-5 shrink-0 text-mh-red" />
              <div>
                <p className="font-medium text-white">{f.t}</p>
                <p className="text-sm text-mh-muted">{f.d}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-lg border border-white/10 bg-[radial-gradient(90%_140%_at_0%_0%,rgba(229,18,28,0.12),transparent)] p-6">
          <p className="text-sm text-mh-muted">
            A assinatura online está sendo ativada. Para começar agora, fale com a
            equipe da MoveHaus.
          </p>
          <CtaButton
            href={whatsappLink("Olá! Quero assinar o MoveHaus Acompanhamento.")}
            external variant="whatsapp" size="lg"
            leadingIcon={<MessageCircle className="size-5" />} className="mt-4"
          >
            Quero assinar
          </CtaButton>
        </div>
      </div>
    );
  }

  // ---------- Com acesso: Meu dia ----------
  const [tree, sessions, progress, rewards] = await Promise.all([
    getPlanTree(user.id),
    getRecentSessions(user.id, 5),
    getProgress(user.id),
    getActiveRewards(),
  ]);
  const today = todayWeekday();
  const todayDay = tree.days.find((d) => d.weekday === today) ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
        MoveHaus Acompanhamento
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Bom treino, {firstName}
      </h1>

      {params.treino === "concluido" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="size-5" /> Treino registrado. Mandou bem! (+10 pts)
        </div>
      )}
      {params.resgate === "ok" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="size-5" /> Resgate solicitado! A equipe vai confirmar em breve.
        </div>
      )}
      {params.resgate === "saldo" && (
        <div className="mt-4 rounded-lg border border-mh-red/30 bg-mh-red/10 px-4 py-3 text-sm text-mh-red-soft">
          Pontos insuficientes para esse resgate.
        </div>
      )}

      {/* Atalhos */}
      <div className="mt-6">
        <Button asChild variant="outline" size="sm">
          <a href="/acompanhamento/corpo">
            <LineChart className="size-4" /> Corpo e evolução
          </a>
        </Button>
      </div>

      {/* Progresso */}
      <section className="mt-8 grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-lg border border-mh-red/30 bg-[radial-gradient(90%_140%_at_50%_0%,rgba(229,18,28,0.15),transparent)] p-5 text-center">
          <Star className="size-6 text-mh-red" />
          <p className="mt-2 text-4xl font-semibold tabular-nums text-white">{progress.points}</p>
          <p className="text-xs uppercase tracking-widest text-mh-muted">pontos</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-mh-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
            <Award className="size-4 text-mh-red" /> Conquistas
          </h2>
          {progress.achievements.length === 0 ? (
            <p className="mt-3 text-sm text-mh-muted">Complete treinos para desbloquear conquistas.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {progress.achievements.map((a) => (
                <span key={a.code} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-mh-black px-3 py-1 text-xs text-white">
                  <Award className="size-3.5 text-mh-red" /> {a.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Metas */}
      {progress.goals.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
            <Target className="size-4 text-mh-red" /> Metas
          </h2>
          <div className="grid gap-3">
            {progress.goals.map((g) => (
              <div key={g.id} className="rounded-lg border border-white/10 bg-mh-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{g.title}</p>
                  <span className="text-xs text-mh-muted">
                    {g.status === "achieved" ? "Concluída" : `${g.current}/${g.target}`}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-mh-red" style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recompensas */}
      {rewards.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
            <Gift className="size-4 text-mh-red" /> Recompensas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {rewards.map((rw) => {
              const canRedeem = progress.points >= rw.cost_points;
              return (
                <div key={rw.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-mh-surface p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{rw.title}</p>
                    {rw.description && <p className="text-xs text-mh-muted">{rw.description}</p>}
                    <p className="mt-1 text-xs text-mh-red-soft">{rw.cost_points} pts</p>
                  </div>
                  <form action={redeemReward}>
                    <input type="hidden" name="reward_id" value={rw.id} />
                    <Button type="submit" size="sm" variant={canRedeem ? "primary" : "outline"} disabled={!canRedeem}>
                      Resgatar
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Treino de hoje */}
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
          Treino de hoje ({WEEKDAYS[today - 1]})
        </h2>
        {todayDay ? (
          <WorkoutCard day={todayDay} highlight />
        ) : (
          <div className="rounded-lg border border-white/10 bg-mh-surface p-5 text-sm text-mh-muted">
            {tree.plan
              ? "Sem treino marcado para hoje. Escolha um treino abaixo ou aproveite para descansar."
              : "Seu plano de treino está sendo montado pela equipe. Em breve aparece aqui."}
          </div>
        )}
      </section>

      {/* Plano completo */}
      {tree.days.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-mh-muted">
            Seu plano
          </h2>
          <div className="grid gap-3">
            {tree.days.filter((d) => d.id !== todayDay?.id).map((day) => (
              <WorkoutCard key={day.id} day={day} />
            ))}
          </div>
        </section>
      )}

      {/* Histórico */}
      {sessions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-mh-muted">
            Últimos treinos
          </h2>
          <ul className="divide-y divide-white/6 rounded-lg border border-white/10 bg-mh-surface">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-white">{s.day_name || "Treino"}</span>
                <span className="flex items-center gap-3 text-mh-muted">
                  {s.feeling && <span className="capitalize">{s.feeling}</span>}
                  {s.finished_at && (
                    <span>{new Intl.DateTimeFormat("pt-BR").format(new Date(s.finished_at))}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <Button asChild variant="ghost" size="sm">
          <a href="/minha-area">Voltar para Minha área</a>
        </Button>
      </div>
    </div>
  );
}

function WorkoutCard({
  day,
  highlight,
}: {
  day: { id: string; name: string; exercises: { id: string }[] };
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border bg-mh-surface p-5 ${highlight ? "border-mh-red/40" : "border-white/10"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{day.name}</h3>
          <p className="text-sm text-mh-muted">{day.exercises.length} exercícios</p>
        </div>
        {day.exercises.length > 0 && (
          <form action={startSession}>
            <input type="hidden" name="day_id" value={day.id} />
            <input type="hidden" name="day_name" value={day.name} />
            <Button type="submit" size="sm">
              <Play className="size-4" /> Iniciar treino
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
