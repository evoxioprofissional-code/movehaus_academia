import Link from "next/link";
import { ArrowRight, Dumbbell, Star } from "lucide-react";

type Props = {
  hasAccess: boolean;
  todayLabel: string | null; // nome do treino de hoje, ou null (descanso)
  todayExercises: number;
  points: number;
  hasOpenSession: boolean;
  joinHref: string; // WhatsApp para quem ainda não tem acesso
};

export function CoachingEntry({ hasAccess, todayLabel, todayExercises, points, hasOpenSession, joinHref }: Props) {
  // --- Aluno com acesso: cockpit do treino ---
  if (hasAccess) {
    return (
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-mh-red/40 bg-[radial-gradient(120%_160%_at_100%_0%,rgba(229,18,28,0.22),transparent_60%),linear-gradient(180deg,#141416,#0c0c0d)]">
        <Dumbbell className="pointer-events-none absolute -right-6 -top-6 size-40 rotate-12 text-white/[0.04]" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mh-red">MoveHaus Acompanhamento</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white sm:text-[28px]">
              {todayLabel ? <>Hoje: {todayLabel}</> : "Hoje é dia de descanso"}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {todayLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 font-medium text-white">
                  <Dumbbell className="size-3.5 text-mh-red" />
                  {todayExercises} {todayExercises === 1 ? "exercício" : "exercícios"}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 font-medium text-white">
                <Star className="size-3.5 text-mh-red" />
                {points} {points === 1 ? "ponto" : "pontos"}
              </span>
            </div>
          </div>
          <Link
            href="/acompanhamento"
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-mh-red px-6 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(229,18,28,0.6)] transition-colors hover:bg-mh-red-hover"
          >
            {hasOpenSession ? "Continuar treino" : todayLabel ? "Começar o treino de hoje" : "Entrar na área"}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    );
  }

  // --- Sem acesso: convite concreto ---
  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(120%_160%_at_100%_0%,rgba(229,18,28,0.18),transparent_60%),linear-gradient(180deg,#141416,#0c0c0d)]">
      <Dumbbell className="pointer-events-none absolute -right-6 -top-6 size-40 rotate-12 text-white/[0.04]" />
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mh-red">MoveHaus Acompanhamento</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white sm:text-[28px]">
            Treine com método, não no escuro.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mh-muted">
            Plano semanal montado pra você, modo treino no celular, evolução de carga e a equipe acompanhando de perto.
          </p>
        </div>
        <a
          href={joinHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-mh-red px-6 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(229,18,28,0.6)] transition-colors hover:bg-mh-red-hover"
        >
          Quero fazer parte
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
