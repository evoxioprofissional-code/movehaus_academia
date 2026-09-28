import type { Metadata } from "next";
import {
  Apple,
  CalendarCheck,
  Dumbbell,
  LineChart,
  Lock,
  Target,
} from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { whatsappLink } from "@/lib/site";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = { title: "Acompanhamento" };

export default async function AcompanhamentoPage() {
  await requireUser("/acompanhamento");
  const [access, profile] = await Promise.all([
    hasCoachingAccess(),
    getProfile(),
  ]);
  const firstName = (profile?.full_name || "atleta").split(" ")[0];

  // Sem acesso → convite para assinar (pagamento entra na Fase 5).
  if (!access) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-mh-border px-3 py-1 text-xs font-medium uppercase tracking-widest text-mh-muted">
          <Lock className="size-3.5" />
          Área exclusiva
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          MoveHaus <span className="text-mh-red">Acompanhamento</span>
        </h1>
        <p className="mt-3 max-w-xl text-mh-muted">
          Seu treino da semana, modo treino no celular, evolução de carga, metas,
          medidas e acompanhamento de nutrição — tudo em um lugar, com a equipe
          da MoveHaus junto de você.
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

  // Com acesso → "Meu dia" (shell; conteúdo real nas próximas sub-fases).
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
        MoveHaus Acompanhamento
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Bom treino, {firstName}
      </h1>
      <p className="mt-1 text-mh-muted">Seu dia na MoveHaus, organizado.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { icon: Dumbbell, t: "Treino de hoje", d: "Seu treino aparece aqui." },
          { icon: Target, t: "Meta da semana", d: "Acompanhe sua constância." },
          { icon: LineChart, t: "Evolução recente", d: "Cargas e medidas." },
          { icon: CalendarCheck, t: "Próxima ação", d: "O que fazer agora." },
        ].map((c) => (
          <div key={c.t} className="rounded-lg border border-white/10 bg-mh-surface p-5">
            <c.icon className="size-5 text-mh-red" />
            <h2 className="mt-3 text-base font-semibold text-white">{c.t}</h2>
            <p className="mt-1 text-sm text-mh-muted">{c.d}</p>
            <p className="mt-3 text-xs text-mh-muted">Em breve nesta área.</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button asChild variant="ghost" size="sm">
          <a href="/minha-area">Voltar para Minha área</a>
        </Button>
      </div>
    </div>
  );
}
