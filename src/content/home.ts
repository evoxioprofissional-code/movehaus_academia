/**
 * Conteúdo e mídia da página inicial — ponto único de edição.
 *
 * COMO TROCAR AS FOTOS
 * 1. Coloque a imagem em /public/images (ex.: /public/images/hero.jpg).
 * 2. Aponte o `src` do slot para o caminho ("/images/hero.jpg").
 * 3. Enquanto `src` for null, aparece um placeholder de marca elegante.
 *
 * Nada aqui depende do banco. Na Fase 4, textos e banners podem passar a vir
 * das Configurações do painel; a estrutura já está isolada para isso.
 */

export interface MediaSlot {
  /** Caminho em /public (ex.: "/images/hero.jpg") ou null para placeholder. */
  src: string | null;
  alt: string;
  /** Rótulo discreto do que a foto deve mostrar (aparece só no placeholder). */
  caption?: string;
}

export const HERO = {
  eyebrow: "MoveHaus Training Club — Colômbia/SP",
  title: "Seu próximo nível\ncomeça aqui.",
  text: "Treino, produtos e conteúdos para transformar constância em resultado.",
  primary: { label: "Explorar a loja", href: "/loja" },
  secondary: { label: "Conhecer a MoveHaus", href: "/sobre" },
  image: {
    src: null,
    alt: "Treino na MoveHaus Training Club",
    caption: "Foto ou vídeo de treino",
  } as MediaSlot,
};

/** Seção "Isso é MoveHaus." — narrativa visual da comunidade (carrossel). */
export const COMMUNITY = {
  kicker: "Comunidade",
  title: "Isso é MoveHaus.",
  text: "Gente de verdade treinando, evoluindo e fazendo parte de algo maior que um treino.",
  items: [
    { caption: "Treino com acompanhamento", tone: "dark", media: { src: null, alt: "Treino com acompanhamento", caption: "Treino" } },
    { caption: "Uma comunidade que evolui junta", tone: "red", media: { src: null, alt: "Comunidade MoveHaus", caption: "Comunidade" } },
    { caption: "Estrutura para treinar de verdade", tone: "dark", media: { src: null, alt: "Estrutura da academia", caption: "Estrutura" } },
    { caption: "Constância gera resultado", tone: "dark", media: { src: null, alt: "Aluno em evolução", caption: "Resultado" } },
    { caption: "MoveHaus Training Club", tone: "red", media: { src: null, alt: "Ambiente MoveHaus", caption: "Ambiente" } },
  ] as { caption: string; tone: "dark" | "red"; media: MediaSlot }[],
};

export const BRAND = {
  kicker: "A academia",
  title: "Feita por quem treina de verdade",
  text: "Um espaço para evoluir com método, acompanhamento próximo e uma comunidade que puxa junto. Aqui, cada treino tem propósito.",
  pillars: ["Treino guiado", "Acompanhamento próximo", "Comunidade que evolui junto"],
  images: {
    main: { src: null, alt: "Ambiente da MoveHaus", caption: "Ambiente da academia" } as MediaSlot,
    top: { src: null, alt: "Aluno treinando", caption: "Aluno em treino" } as MediaSlot,
    bottom: { src: null, alt: "Professor acompanhando o treino", caption: "Professor" } as MediaSlot,
  },
};

export const DIGITAL = {
  kicker: "Conteúdos",
  title: "Conhecimento que acompanha o seu treino",
  text: "Materiais de nutrição e organização de rotina, lidos no leitor interno — com acompanhamento e exclusividade.",
};

export const OFFER = {
  kicker: "Campanha",
  title: "Ofertas da semana",
  text: "Condições especiais por tempo limitado nos itens selecionados da loja.",
  image: { src: null, alt: "Produtos MoveHaus em oferta", caption: "Campanha de ofertas" } as MediaSlot,
};

/**
 * Slots de imagem da home editáveis pelo admin (tabela home_media).
 * A chave liga o upload do admin ao lugar certo na página.
 */
export const HOME_MEDIA_SLOTS: { key: string; label: string; hint: string }[] = [
  { key: "hero", label: "Topo (hero)", hint: "Imagem/foto grande do topo. Horizontal, alta resolução." },
  { key: "community_0", label: "Galeria 1 — Treino com acompanhamento", hint: "Vertical (retrato)." },
  { key: "community_1", label: "Galeria 2 — Comunidade que evolui junta", hint: "Vertical (retrato)." },
  { key: "community_2", label: "Galeria 3 — Estrutura para treinar", hint: "Vertical (retrato)." },
  { key: "community_3", label: "Galeria 4 — Constância gera resultado", hint: "Vertical (retrato)." },
  { key: "community_4", label: "Galeria 5 — MoveHaus Training Club", hint: "Vertical (retrato)." },
  { key: "offer", label: "Faixa de ofertas", hint: "Horizontal, tom mais escuro." },
  { key: "about", label: "Sobre a MoveHaus", hint: "Foto do ambiente/comunidade." },
];

export const ABOUT = {
  kicker: "Sobre a MoveHaus",
  title: "Evolução com treino sério e gente por perto",
  text: "A MoveHaus nasceu para quem busca evolução com treino sério, acompanhamento próximo e uma comunidade que cresce junto.",
  image: { src: null, alt: "Comunidade MoveHaus", caption: "Comunidade / alunos" } as MediaSlot,
};

/**
 * Textos da home editáveis pelo admin (tabela home_content). `key` liga o campo
 * ao lugar na página; `default` é o texto atual, usado quando não há override.
 */
export type HomeTextField = { key: string; group: string; label: string; multiline?: boolean; default: string };

export const HOME_TEXT_FIELDS: HomeTextField[] = [
  { key: "hero.eyebrow", group: "Topo", label: "Selo (linha fina acima do título)", default: HERO.eyebrow },
  { key: "hero.title", group: "Topo", label: "Título", multiline: true, default: HERO.title },
  { key: "hero.text", group: "Topo", label: "Descrição", multiline: true, default: HERO.text },
  { key: "hero.primary", group: "Topo", label: "Texto do botão principal", default: HERO.primary.label },
  { key: "hero.secondary", group: "Topo", label: "Texto do botão secundário", default: HERO.secondary.label },

  { key: "community.kicker", group: "Comunidade", label: "Selo", default: COMMUNITY.kicker },
  { key: "community.title", group: "Comunidade", label: "Título", default: COMMUNITY.title },
  { key: "community.text", group: "Comunidade", label: "Descrição", multiline: true, default: COMMUNITY.text },
  ...COMMUNITY.items.map((item, index) => ({ key: `community.item${index}`, group: "Comunidade", label: `Legenda da foto ${index + 1}`, default: item.caption })),

  { key: "digital.kicker", group: "Conteúdos", label: "Selo", default: DIGITAL.kicker },
  { key: "digital.title", group: "Conteúdos", label: "Título", default: DIGITAL.title },
  { key: "digital.text", group: "Conteúdos", label: "Descrição", multiline: true, default: DIGITAL.text },

  { key: "offer.kicker", group: "Ofertas", label: "Selo", default: OFFER.kicker },
  { key: "offer.title", group: "Ofertas", label: "Título", default: OFFER.title },
  { key: "offer.text", group: "Ofertas", label: "Descrição", multiline: true, default: OFFER.text },

  { key: "about.kicker", group: "Sobre", label: "Selo", default: ABOUT.kicker },
  { key: "about.title", group: "Sobre", label: "Título", default: ABOUT.title },
  { key: "about.text", group: "Sobre", label: "Descrição", multiline: true, default: ABOUT.text },
];
