import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Check, ChevronRight, Dumbbell, Gift, MessageCircle, Star, Target, TrendingUp, UtensilsCrossed } from "lucide-react";
import type { Database } from "@/types/database";
import type { DayWithExercises, Session } from "@/lib/coaching/workouts";
import type { Progress } from "@/lib/coaching/gamification";
import { startSession } from "@/lib/coaching/workout-actions";
import { redeemReward } from "@/lib/coaching/gamification-actions";
import { WorkoutSubmit } from "@/components/coaching/workout-submit";
import { loadLabel } from "@/lib/coaching/format";

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

function StartDay({ day, label }: { day: DayWithExercises; label: string }) {
  return (
    <form action={startSession}>
      <input type="hidden" name="day_id" value={day.id} />
      <input type="hidden" name="day_name" value={day.name} />
      <WorkoutSubmit
        label={label}
        withIcon={false}
        disabled={day.exercises.length === 0}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-mh-red px-5 text-sm font-semibold text-white transition-colors hover:bg-mh-red-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-45"
      />
    </form>
  );
}

export function CoachingDashboard({
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
  const allDays = featuredDay ? [featuredDay, ...otherDays] : otherDays;
  const dayWithExercises = featuredDay && featuredDay.exercises.length > 0 ? featuredDay : null;
  const isRestDay = !featuredDay && !activeSession;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-mh-red">Meu treino</p>
      <h1 className="mt-2 max-w-[14ch] text-[clamp(2rem,8vw,2.9rem)] font-bold leading-[1.04] tracking-[-0.045em] text-white">
        {isRestDay ? "Hoje é dia de recuperar." : activeSession ? "Treino em andamento." : dayWithExercises ? "Seu treino de hoje." : "Seu plano está chegando."}
      </h1>
      <p className="mt-2 text-[15px] text-white/60">{dateLabel}</p>

      {status?.workout === "concluido" && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300"><Check className="size-4" /> Treino registrado. Mandou bem! (+10 pts)</p>}
      {status?.redemption === "ok" && <p role="status" className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300"><Check className="size-4" /> Resgate solicitado com sucesso.</p>}

      <section className="relative isolate mt-5 flex min-h-64 flex-col justify-end overflow-hidden rounded-2xl bg-[#141519] p-5 sm:min-h-72 sm:p-6">
        <Image src="/images/member-training-plates.png" alt="" fill priority sizes="(max-width: 640px) 100vw, 480px" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090b]/95 via-[#08090b]/50 to-[#08090b]/10" aria-hidden="true" />
        <span className="absolute -top-14 right-9 h-52 w-11 rotate-[29deg] bg-mh-red/85" aria-hidden="true" />
        <div className="relative z-10">
          <h2 className="max-w-[16ch] text-[clamp(1.75rem,7vw,2.4rem)] font-bold leading-[1.07] tracking-[-0.04em] text-white">
            {isRestDay ? "Descanso também é treino." : dayWithExercises?.name || activeSession?.day_name || featuredDay?.name || "Treino MoveHaus"}
          </h2>
          <p className="mt-2 max-w-[28ch] text-sm leading-snug text-white/85 sm:text-base">
            {isRestDay ? "Seu plano continua no próximo treino." : dayWithExercises ? `${dayWithExercises.exercises.length} ${dayWithExercises.exercises.length === 1 ? "exercício" : "exercícios"} no plano de hoje.` : featuredDay ? "Seu professor ainda vai adicionar os exercícios." : "Continue de onde parou."}
          </p>
          {activeSession ? (
            <Link href={`/acompanhamento/treino/${activeSession.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-mh-red px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Continuar treino <ArrowRight className="size-4" /></Link>
          ) : dayWithExercises ? (
            <div className="mt-5 max-w-[250px]"><StartDay day={dayWithExercises} label="Iniciar treino" /></div>
          ) : null}
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/[0.07] bg-[#111216] py-4">
        <div className="flex min-w-0 items-center justify-center gap-3 px-2"><Star className="size-6 shrink-0 text-mh-red" strokeWidth={1.7} /><div><strong className="block text-2xl leading-none text-white">{progress.points}</strong><span className="text-xs text-white/60">pontos</span></div></div>
        <div className="flex min-w-0 items-center justify-center gap-3 px-2"><TrendingUp className="size-6 shrink-0 text-mh-red" strokeWidth={1.7} /><div><strong className="block text-2xl leading-none text-white">{allDays.length}</strong><span className="text-xs text-white/60">{allDays.length === 1 ? "treino no plano" : "treinos no plano"}</span></div></div>
      </div>

      <section className="mt-7">
        <h2 className="text-[23px] font-bold tracking-tight text-white">Seu plano</h2>
        {allDays.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-[#111216] p-5 text-sm text-white/60">Seu professor ainda está preparando o plano de treino.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {allDays.map((day) => (
              <details key={day.id} className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#111216]">
                <summary className="flex min-h-18 cursor-pointer list-none items-center gap-4 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red [&::-webkit-details-marker]:hidden">
                  <Dumbbell className="size-6 shrink-0 text-mh-red" strokeWidth={1.6} aria-hidden="true" />
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{day.name}</strong><span className="block text-xs text-white/55">{day.exercises.length} {day.exercises.length === 1 ? "exercício" : "exercícios"}</span></span>
                  <ChevronRight className="size-5 shrink-0 text-white/75 transition-transform group-open:rotate-90" aria-hidden="true" />
                </summary>
                <div className="border-t border-white/[0.07] px-4 pb-4 pt-3">
                  {day.exercises.length > 0 ? <ul className="mb-4 space-y-2 text-sm text-white/75">{day.exercises.map((exercise) => <li key={exercise.id} className="flex items-start justify-between gap-3"><span>{exercise.name}</span><span className="shrink-0 text-xs text-white/45">{exercise.sets} × {exercise.reps}{exercise.target_load ? ` · ${loadLabel(exercise.target_load)}` : ""}</span></li>)}</ul> : <p className="mb-4 text-sm text-white/55">Exercícios ainda não cadastrados.</p>}
                  {activeSession?.day_id === day.id ? <Link href={`/acompanhamento/treino/${activeSession.id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mh-red">Continuar treino <ArrowRight className="size-4" /></Link> : <StartDay day={day} label="Iniciar este treino" />}
                </div>
              </details>
            ))}
          </div>
        )}
        <Link href="/acompanhamento/corpo" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mh-red hover:text-mh-red-soft">Ver evolução <ChevronRight className="size-4" /></Link>
      </section>

      {(progress.goals.length > 0 || rewards.length > 0) && (
        <details className="group mt-4 rounded-xl border border-white/[0.07] bg-[#111216]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red [&::-webkit-details-marker]:hidden"><Award className="size-5 text-mh-red" /> Metas e recompensas <ChevronRight className="ml-auto size-4 text-white/60 transition-transform group-open:rotate-90" /></summary>
          <div className="space-y-5 border-t border-white/[0.07] px-4 py-4">
            {progress.goals.map((goal) => <div key={goal.id}><div className="flex justify-between gap-3 text-sm"><span>{goal.title}</span><span className="text-white/55">{goal.status === "achieved" ? "Concluída" : `${goal.current}/${goal.target}`}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-mh-red" style={{ width: `${goal.pct}%` }} /></div></div>)}
            {rewards.length > 0 && <div><h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/55"><Gift className="size-4 text-mh-red" /> Recompensas</h3>{rewards.map((reward) => <div key={reward.id} className="flex items-center gap-3 border-t border-white/[0.07] py-3"><div className="min-w-0 flex-1"><p className="truncate text-sm text-white">{reward.title}</p><p className="text-xs text-mh-red">{reward.cost_points} pontos</p></div><form action={redeemReward}><input type="hidden" name="reward_id" value={reward.id} /><button type="submit" disabled={progress.points < reward.cost_points} className="min-h-10 rounded-lg border border-white/20 px-3 text-xs font-semibold text-white disabled:opacity-40">Resgatar</button></form></div>)}</div>}
          </div>
        </details>
      )}

      {sessions.length > 0 && <details className="group mt-3 rounded-xl border border-white/[0.07] bg-[#111216]"><summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red [&::-webkit-details-marker]:hidden"><Target className="size-5 text-mh-red" /> Últimos treinos <ChevronRight className="ml-auto size-4 text-white/60 transition-transform group-open:rotate-90" /></summary><div className="divide-y divide-white/[0.07] border-t border-white/[0.07] px-4">{sessions.slice(0, 3).map((session) => <div key={session.id} className="flex items-center justify-between gap-3 py-3 text-xs"><span className="truncate text-white">{session.day_name || "Treino"}</span><span className="shrink-0 text-white/55">{session.finished_at && new Intl.DateTimeFormat("pt-BR").format(new Date(session.finished_at))}</span></div>)}</div></details>}

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
        <Link href="/acompanhamento/nutricao" className="inline-flex min-h-10 items-center gap-2 hover:text-white"><UtensilsCrossed className="size-4 text-mh-red" /> Nutrição</Link>
        <a href={coachHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 hover:text-white"><MessageCircle className="size-4 text-mh-red" /> Falar com professor</a>
      </div>
    </div>
  );
}
