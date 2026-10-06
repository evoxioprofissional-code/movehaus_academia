import Link from "next/link";
import {
  Apple,
  Award,
  Check,
  ChevronDown,
  Dumbbell,
  Gift,
  Play,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import type { Database } from "@/types/database";
import type { DayWithExercises, Session } from "@/lib/coaching/workouts";
import type { Progress } from "@/lib/coaching/gamification";
import { startSession } from "@/lib/coaching/workout-actions";
import { redeemReward } from "@/lib/coaching/gamification-actions";
import { cn } from "@/lib/utils";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];

type CoachingDashboardProps = {
  athleteName: string;
  dateLabel: string;
  featuredDay: DayWithExercises | null;
  otherDays: DayWithExercises[];
  activeSession: Session | null;
  progress: Progress;
  rewards: Reward[];
  sessions: Session[];
  status?: { workout?: string; redemption?: string };
  coachHref: string;
};

export function CoachingDashboard({
  athleteName,
  dateLabel,
  featuredDay,
  otherDays,
  activeSession,
  progress,
  rewards,
  sessions,
  status,
  coachHref,
}: CoachingDashboardProps) {
  const initials = athleteName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AL";
  const exercises = featuredDay?.exercises ?? [];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#050608] sm:p-3">
      <div className="mx-auto flex h-full max-w-[430px] flex-col overflow-hidden bg-[#08090b] sm:rounded-[28px] sm:border sm:border-[#363a43] sm:shadow-2xl">
        <header className="shrink-0 px-4 pb-3 pt-[max(.65rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-[19px] font-bold tracking-[-0.055em] text-white"
            >
              Move<span className="text-mh-red">Haus</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/acompanhamento/nutricao"
                aria-label="Nutrição"
                className="grid size-9 place-items-center rounded-full text-[#a5abb6] transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Apple className="size-[18px]" />
              </Link>
              <span className="grid size-9 place-items-center rounded-full bg-[#292d35] text-[11px] font-semibold text-white">
                {initials}
              </span>
            </div>
          </div>

          <h1 className="mt-3 text-[22px] font-bold leading-none tracking-[-0.035em] text-white">
            Seu treino de hoje
          </h1>
          <p className="mt-1 text-[11px] capitalize text-[#959ba7]">{dateLabel}</p>

          {featuredDay && (
            <div className="mt-3">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-semibold text-white">
                    {featuredDay.name}
                  </h2>
                  <p className="mt-0.5 text-[9px] text-[#8f95a1]">
                    {exercises.length} {exercises.length === 1 ? "exercício" : "exercícios"}
                  </p>
                </div>
                <p className="shrink-0 text-[9px] text-[#a0a6b1]">
                  {activeSession ? "Treino em andamento" : `0 de ${exercises.length} concluídos`}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={cn("h-full rounded-full bg-mh-red", activeSession ? "w-[12%]" : "w-0")} />
              </div>
            </div>
          )}
        </header>

        <main className="admin-scrollbar flex-1 overflow-y-auto px-3 pb-5">
          {status?.workout === "concluido" && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-[11px] text-emerald-300">
              <Check className="size-4" /> Treino registrado. Mandou bem! (+10 pts)
            </div>
          )}
          {status?.redemption === "ok" && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-[11px] text-emerald-300">
              <Check className="size-4" /> Resgate solicitado com sucesso.
            </div>
          )}

          {!featuredDay ? (
            <div className="rounded-xl border border-white/10 bg-[#111318] p-5 text-center">
              <Dumbbell className="mx-auto size-6 text-[#777e8b]" />
              <p className="mt-3 text-sm font-semibold text-white">Hoje é dia de recuperar</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#9298a4]">
                Não há treino marcado para hoje. Seu plano completo continua logo abaixo.
              </p>
            </div>
          ) : (
            <section className="space-y-1.5">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#111318] px-2.5 py-2.5"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#252932] text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-white">{exercise.name}</p>
                    <p className="truncate text-[8px] text-[#9298a4]">
                      {exercise.sets} séries · {exercise.reps}
                      {exercise.target_load ? ` · ${exercise.target_load} kg` : ""}
                    </p>
                  </div>
                  <ChevronDown className="size-3.5 -rotate-90 text-[#6f7682]" />
                </div>
              ))}

              {exercises.length > 0 && (
                activeSession ? (
                  <Link
                    href={`/acompanhamento/treino/${activeSession.id}`}
                    className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mh-red text-xs font-semibold text-white transition-colors hover:bg-mh-red-hover"
                  >
                    <Play className="size-4 fill-white" /> Continuar treino
                  </Link>
                ) : (
                  <form action={startSession} className="mt-2">
                    <input type="hidden" name="day_id" value={featuredDay.id} />
                    <input type="hidden" name="day_name" value={featuredDay.name} />
                    <button
                      type="submit"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mh-red text-xs font-semibold text-white transition-colors hover:bg-mh-red-hover"
                    >
                      <Play className="size-4 fill-white" /> Iniciar treino
                    </button>
                  </form>
                )
              )}
            </section>
          )}

          <section className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.08] bg-[#111318] p-3">
              <Award className="size-4 text-mh-red" />
              <p className="mt-2 text-xl font-bold tabular-nums text-white">{progress.points}</p>
              <p className="text-[8px] uppercase tracking-[0.15em] text-[#9298a4]">pontos</p>
            </div>
            <Link
              href="/acompanhamento/corpo"
              className="rounded-xl border border-white/[0.08] bg-[#111318] p-3 transition-colors hover:bg-[#16191f]"
            >
              <TrendingUp className="size-4 text-mh-red" />
              <p className="mt-2 text-[11px] font-semibold text-white">Sua evolução</p>
              <p className="mt-0.5 text-[8px] text-[#9298a4]">Medidas, carga e progresso</p>
            </Link>
          </section>

          {progress.goals.length > 0 && (
            <section className="mt-3 rounded-xl border border-white/[0.08] bg-[#111318] p-3">
              <h2 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a0a6b1]">
                <Target className="size-3.5 text-mh-red" /> Metas
              </h2>
              <div className="mt-3 space-y-3">
                {progress.goals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between gap-3 text-[10px]">
                      <span className="truncate text-white">{goal.title}</span>
                      <span className="shrink-0 text-[#9298a4]">
                        {goal.status === "achieved" ? "Concluída" : `${goal.current}/${goal.target}`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-mh-red" style={{ width: `${goal.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {otherDays.length > 0 && (
            <section className="mt-3">
              <h2 className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9298a4]">Seu plano</h2>
              <div className="space-y-1.5">
                {otherDays.map((day) => (
                  <details key={day.id} className="group rounded-xl border border-white/[0.08] bg-[#111318]">
                    <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-3">
                      <Dumbbell className="size-4 text-[#8f95a1]" />
                      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-white">{day.name}</span>
                      <span className="text-[8px] text-[#9298a4]">{day.exercises.length} exercícios</span>
                      <ChevronDown className="size-3.5 text-[#727987] transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-white/[0.06] p-2">
                      <form action={startSession}>
                        <input type="hidden" name="day_id" value={day.id} />
                        <input type="hidden" name="day_name" value={day.name} />
                        <button type="submit" disabled={day.exercises.length === 0} className="h-9 w-full rounded-md border border-mh-red/60 text-[10px] font-semibold text-mh-red disabled:opacity-40">
                          Iniciar este treino
                        </button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {rewards.length > 0 && (
            <section className="mt-3 rounded-xl border border-white/[0.08] bg-[#111318] p-3">
              <h2 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a0a6b1]">
                <Gift className="size-3.5 text-mh-red" /> Recompensas
              </h2>
              <div className="mt-2 divide-y divide-white/[0.06]">
                {rewards.map((reward) => {
                  const enabled = progress.points >= reward.cost_points;
                  return (
                    <div key={reward.id} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-medium text-white">{reward.title}</p>
                        <p className="text-[8px] text-mh-red-soft">{reward.cost_points} pontos</p>
                      </div>
                      <form action={redeemReward}>
                        <input type="hidden" name="reward_id" value={reward.id} />
                        <button type="submit" disabled={!enabled} className="h-7 rounded-md border border-white/15 px-2.5 text-[9px] font-semibold text-white disabled:text-[#646b77]">
                          Resgatar
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {sessions.length > 0 && (
            <section className="mt-3 pb-2">
              <h2 className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9298a4]">Últimos treinos</h2>
              <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-[#111318] px-3">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between gap-3 py-2.5 text-[10px]">
                    <span className="truncate text-white">{session.day_name || "Treino"}</span>
                    <span className="shrink-0 text-[#9298a4]">
                      {session.finished_at && new Intl.DateTimeFormat("pt-BR").format(new Date(session.finished_at))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="shrink-0 border-t border-white/[0.08] bg-[#090a0c] pb-[max(.35rem,env(safe-area-inset-bottom))]">
          <nav className="grid grid-cols-3 px-3 py-2 text-[9px]">
            <Link href="/acompanhamento" className="flex flex-col items-center gap-1 text-mh-red">
              <Dumbbell className="size-[18px]" /> Treino
            </Link>
            <Link href="/acompanhamento/corpo" className="flex flex-col items-center gap-1 text-[#9298a4]">
              <TrendingUp className="size-[18px]" /> Evolução
            </Link>
            <a href={coachHref} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[#9298a4]">
              <UserRound className="size-[18px]" /> Professor
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
