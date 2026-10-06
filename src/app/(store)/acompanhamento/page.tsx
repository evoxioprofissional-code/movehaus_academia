import type { Metadata } from "next";
import { Apple, Dumbbell, LineChart, Lock, MessageCircle, Target } from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import {
  getOpenSession,
  getPlanTree,
  getRecentSessions,
  todayWeekday,
} from "@/lib/coaching/workouts";
import { getProgress, getActiveRewards } from "@/lib/coaching/gamification";
import { CtaButton } from "@/components/ui/cta-button";
import { CoachingDashboard } from "@/components/coaching/coaching-dashboard";
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
          Seu treino da semana, evolução, metas e acompanhamento nutricional com a equipe da MoveHaus.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { icon: Dumbbell, title: "Treino guiado", text: "Plano semanal e modo treino." },
            { icon: LineChart, title: "Evolução", text: "Cargas, medidas e recordes." },
            { icon: Target, title: "Metas", text: "Constância acompanhada de perto." },
            { icon: Apple, title: "Nutrição", text: "Plano alimentar e receitas." },
          ].map((feature) => (
            <li key={feature.title} className="flex gap-3 rounded-lg border border-white/10 bg-mh-surface p-4">
              <feature.icon className="size-5 shrink-0 text-mh-red" />
              <div>
                <p className="font-medium text-white">{feature.title}</p>
                <p className="text-sm text-mh-muted">{feature.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-lg border border-white/10 bg-mh-surface p-6">
          <p className="text-sm text-mh-muted">
            Para ativar o acompanhamento, fale com a equipe da MoveHaus.
          </p>
          <CtaButton
            href={whatsappLink("Olá! Quero assinar o MoveHaus Acompanhamento.")}
            external
            variant="whatsapp"
            size="lg"
            leadingIcon={<MessageCircle className="size-5" />}
            className="mt-4"
          >
            Quero assinar
          </CtaButton>
        </div>
      </div>
    );
  }

  const [tree, sessions, progress, rewards, activeSession] = await Promise.all([
    getPlanTree(user.id),
    getRecentSessions(user.id, 5),
    getProgress(user.id),
    getActiveRewards(),
    getOpenSession(user.id),
  ]);
  const today = todayWeekday();
  const todayDay = tree.days.find((day) => day.weekday === today) ?? null;
  const activeDay = activeSession?.day_id
    ? tree.days.find((day) => day.id === activeSession.day_id) ?? null
    : null;
  const featuredDay = activeDay ?? todayDay;
  const otherDays = tree.days.filter((day) => day.id !== featuredDay?.id);
  const athleteName = profile?.full_name || "Aluno";
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <CoachingDashboard
      athleteName={athleteName}
      dateLabel={dateLabel}
      featuredDay={featuredDay}
      otherDays={otherDays}
      activeSession={activeSession}
      progress={progress}
      rewards={rewards}
      sessions={sessions}
      status={{ workout: params.treino, redemption: params.resgate }}
      coachHref={whatsappLink(`Olá! Aqui é ${athleteName}. Preciso falar com meu professor.`)}
    />
  );
}
