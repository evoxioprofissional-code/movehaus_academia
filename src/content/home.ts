export interface MediaSlot {
  src: string | null;
  alt: string;
  caption?: string;
}

export const HERO = {
  eyebrow: "MoveHaus Training Club — Colômbia/SP",
  title: "Seu próximo nível\ncomeça aqui.",
  text: "Treino, produtos e conteúdo para evoluir todos os dias.",
  primary: { label: "Explorar a loja", href: "/loja" },
  secondary: { label: "Conhecer o clube", href: "/sobre" },
  image: { src: null, alt: "Treino na MoveHaus Training Club", caption: "Foto de treino" } as MediaSlot,
};

export const COMMUNITY = {
  kicker: "Comunidade",
  title: "Isso é MoveHaus.",
  text: "Gente treinando, evoluindo e fazendo parte de algo maior que um treino.",
  items: [
    { caption: "Treino com acompanhamento", tone: "dark", media: { src: null, alt: "Treino com acompanhamento", caption: "Treino" } },
    { caption: "Uma comunidade que evolui junta", tone: "red", media: { src: null, alt: "Comunidade MoveHaus", caption: "Comunidade" } },
    { caption: "Estrutura para treinar de verdade", tone: "dark", media: { src: null, alt: "Estrutura da academia", caption: "Estrutura" } },
    { caption: "Constância gera resultado", tone: "dark", media: { src: null, alt: "Aluno em evolução", caption: "Resultado" } },
    { caption: "MoveHaus Training Club", tone: "red", media: { src: null, alt: "Ambiente MoveHaus", caption: "Ambiente" } },
  ] as { caption: string; tone: "dark" | "red"; media: MediaSlot }[],
};

export const DIGITAL = {
  kicker: "Conteúdos",
  title: "Seu treino continua fora da academia.",
  text: "Materiais de nutrição e organização de rotina, lidos no leitor interno com acompanhamento e exclusividade.",
};

export const OFFER = {
  kicker: "Campanha",
  title: "Ofertas da semana",
  text: "Condições especiais nos itens selecionados da loja.",
  image: { src: null, alt: "Produtos MoveHaus em oferta", caption: "Campanha de ofertas" } as MediaSlot,
};

export const HOME_MEDIA_SLOTS: { key: string; label: string; hint: string }[] = [
  { key: "hero", label: "Topo (hero)", hint: "Fotografia horizontal de treino, ambiente ou aluno. Não envie a logo neste campo." },
  { key: "community_0", label: "Galeria 1 — Treino com acompanhamento", hint: "Foto de aluno ou professor em treino." },
  { key: "community_1", label: "Galeria 2 — Comunidade", hint: "Foto de alunos, equipe ou evento." },
  { key: "community_2", label: "Galeria 3 — Estrutura", hint: "Foto horizontal da academia ou equipamentos." },
  { key: "community_3", label: "Galeria 4 — Constância", hint: "Foto de rotina ou evolução." },
  { key: "community_4", label: "Galeria 5 — Clube", hint: "Foto institucional da MoveHaus." },
  { key: "offer", label: "Faixa de ofertas", hint: "Fotografia horizontal de produto, em ambiente escuro." },
  { key: "about", label: "Sobre a MoveHaus", hint: "Foto da equipe, alunos ou comunidade." },
];

export const ABOUT = {
  kicker: "Sobre a MoveHaus",
  title: "Evolução com treino sério e gente por perto",
  text: "Treino, acompanhamento próximo e uma comunidade que cresce junto.",
  image: { src: null, alt: "Comunidade MoveHaus", caption: "Comunidade e equipe" } as MediaSlot,
};
