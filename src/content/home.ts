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
  eyebrow: "MoveHaus Training Club",
  title: "Sua loja.\nSeu próximo favorito.",
  text: "Produtos oficiais, PDFs e receitas para a sua rotina.",
  primary: { label: "Explorar a loja", href: "/loja" },
  secondary: { label: "Conhecer a MoveHaus", href: "/sobre" },
  image: {
    src: null,
    alt: "Seleção de produtos da loja MoveHaus",
    caption: "Produtos da loja",
  } as MediaSlot,
};

export const DIGITAL = {
  kicker: "Conteúdos",
  title: "PDFs, receitas e novas leituras",
  text: "Compre seu acesso e leia os materiais digitais na sua biblioteca.",
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
  { key: "offer", label: "Faixa de ofertas", hint: "Horizontal, tom mais escuro." },
  { key: "about", label: "Sobre a loja", hint: "Imagem da marca ou dos produtos." },
];

export const ABOUT = {
  kicker: "Sobre a MoveHaus",
  title: "A loja oficial da MoveHaus",
  text: "Produtos selecionados, receitas e conteúdos digitais reunidos em um só lugar.",
  image: { src: null, alt: "Loja MoveHaus", caption: "Produtos MoveHaus" } as MediaSlot,
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
