import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { EditorialPageHero } from "@/components/ui/editorial-page-hero";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "A academia",
  description: "Conheça a MoveHaus Training Club.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <EditorialPageHero
        kicker="A academia"
        title="Treino sério. Acompanhamento próximo."
        description="A MoveHaus nasceu para quem busca evolução com método e uma comunidade que cresce junto. A loja reúne o que faz parte dessa rotina."
        aside="MoveHaus Training Club • Colômbia, São Paulo"
      />

      <div className="grid border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">
        {[
          {
            number: "01",
            title: "Treino com método",
            desc: "Programas estruturados, com progressão e orientação de execução.",
          },
          {
            number: "02",
            title: "Nutrição na prática",
            desc: "Conteúdo educativo para organizar a alimentação em torno do treino.",
          },
          {
            number: "03",
            title: "Comunidade",
            desc: "Um clube de gente que treina junto e evolui junto.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="group border-b border-white/10 py-8 last:border-b-0 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
          >
            <span className="font-display text-4xl font-bold text-white/15 transition-colors group-hover:text-mh-red">
              {item.number}
            </span>
            <h2 className="mt-5 text-xl font-semibold text-white">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mh-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-12 overflow-hidden bg-mh-paper p-8 text-mh-paper-ink sm:p-12">
        <div className="absolute right-0 top-0 h-2 w-1/3 bg-mh-red" aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mh-red">Comece por aqui</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl font-bold leading-none sm:text-5xl">
          Quer treinar com a gente?
        </h2>
        <p className="mt-4 max-w-lg text-mh-paper-muted">
          Fale com a equipe no WhatsApp para saber sobre planos, horários e como
          começar.
        </p>
        <Button asChild size="lg" className="mt-6">
          <a
            href={whatsappLink("Olá! Quero saber mais sobre a MoveHaus Training Club.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar no WhatsApp
          </a>
        </Button>
      </div>

      <p className="mt-8 text-xs text-mh-muted">
        O conteúdo nutricional oferecido na loja é educativo e não substitui a
        avaliação individual de um profissional.
      </p>
    </div>
  );
}
