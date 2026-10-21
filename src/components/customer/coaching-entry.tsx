import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  hasAccess: boolean;
  hasPlan: boolean;
  todayLabel: string | null;
  todayExercises: number;
  hasOpenSession: boolean;
  joinHref: string;
};

export function CoachingEntry({
  hasAccess,
  hasPlan,
  todayLabel,
  todayExercises,
  hasOpenSession,
  joinHref,
}: Props) {
  const title = !hasAccess
    ? "Seu treino começa aqui"
    : hasOpenSession
      ? "Treino em andamento"
      : !hasPlan
        ? "Seu plano está chegando"
        : todayLabel
          ? todayLabel
          : "Hoje é dia de descanso";
  const description = !hasAccess
    ? "Treino acompanhado pela equipe MoveHaus, no seu ritmo."
    : hasOpenSession
      ? "Sua sessão está pronta para continuar."
      : !hasPlan
        ? "Acompanhe a preparação do seu plano com a equipe."
        : todayLabel
          ? `${todayExercises} ${todayExercises === 1 ? "exercício" : "exercícios"} no plano de hoje.`
          : "Recuperar também faz parte do treino.";
  const actionLabel = !hasAccess
    ? "Conhecer acompanhamento"
    : hasOpenSession
      ? "Continuar treino"
      : todayLabel
        ? "Ver treino de hoje"
        : "Ver meu plano";

  return (
    <section className="relative isolate flex min-h-[325px] overflow-hidden rounded-[22px] border border-mh-red/40 bg-[#111216] sm:min-h-[355px]">
      <Image
        src="/images/member-training-plates.png"
        alt=""
        fill
        priority
        sizes="(max-width: 767px) 100vw, 52vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#08090b]/95 via-[#08090b]/72 to-[#08090b]/15" />
      <div aria-hidden="true" className="absolute -top-[20%] right-[20%] h-[92%] w-5 rotate-[28deg] bg-mh-red/85 sm:right-[28%] sm:w-7" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-start justify-end p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-mh-red">MoveHaus Acompanhamento</p>
        <h2 className="mt-3 max-w-[11ch] font-display text-[clamp(2.25rem,9vw,3.25rem)] font-bold uppercase leading-[0.98] text-white sm:text-[3.25rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-[26ch] text-[15px] leading-snug text-white/90 sm:text-base">{description}</p>
        {hasAccess ? (
          <Link href="/acompanhamento" className="mt-6 inline-flex min-h-12 w-full max-w-[245px] items-center justify-center gap-2 rounded-2xl bg-mh-red px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(245,0,25,.25)] transition-colors hover:bg-mh-red-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:min-w-[230px]">
            {actionLabel}<ArrowRight className="size-4" />
          </Link>
        ) : (
          <a href={joinHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 w-full max-w-[270px] items-center justify-center gap-2 rounded-2xl bg-mh-red px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(245,0,25,.25)] transition-colors hover:bg-mh-red-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto">
            {actionLabel}<ArrowRight className="size-4" />
          </a>
        )}
      </div>
    </section>
  );
}
