import type { Metadata } from "next";
import { Dumbbell, HeartPulse, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "A academia",
  description: "Conheça a MoveHaus Training Club.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <span className="inline-flex items-center rounded-full border border-mh-border px-3 py-1 text-xs font-medium uppercase tracking-widest text-mh-muted">
        A academia
      </span>
      <h1 className="mt-5 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl">
        MoveHaus <span className="text-mh-red">Training Club</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-mh-muted">
        A MoveHaus é um clube de treino que une vestuário, programas e conteúdo
        para quem leva o treino a sério. Esta é a loja oficial: aqui você
        encontra o que a gente usa e recomenda no dia a dia.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Dumbbell,
            title: "Treino com método",
            desc: "Programas estruturados, com progressão e orientação de execução.",
          },
          {
            icon: HeartPulse,
            title: "Nutrição na prática",
            desc: "Conteúdo educativo para organizar a alimentação em torno do treino.",
          },
          {
            icon: Users,
            title: "Comunidade",
            desc: "Um clube de gente que treina junto e evolui junto.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-mh border border-mh-border bg-mh-surface p-6"
          >
            <item.icon className="size-6 text-mh-red" />
            <h2 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-mh-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-mh border border-mh-border bg-[radial-gradient(90%_140%_at_0%_0%,rgba(229,18,28,0.14),transparent)] p-8 sm:p-10">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
          Quer treinar com a gente?
        </h2>
        <p className="mt-2 max-w-lg text-mh-muted">
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
