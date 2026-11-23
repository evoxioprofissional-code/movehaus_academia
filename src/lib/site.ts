/** Fallbacks usados somente quando as configurações públicas estão indisponíveis. */
export const SITE = {
  name: "MoveHaus Training Club",
  shortName: "MoveHaus",
  tagline: "Produtos, PDFs e receitas em um só lugar.",
  // Número no formato internacional só com dígitos (ex.: 55 + DDD + número).
  whatsapp: "5517996548450",
  whatsappLabel: "(17) 99654-8450",
  instagram: "https://instagram.com/",
  instagramHandle: "@movehaus",
  email: "contato@movehaus.com.br",
  city: "Colômbia/SP",
  address: "Colômbia, São Paulo",
};

/** Monta um link wa.me com mensagem pré-preenchida. */
export function whatsappLink(message?: string, number = SITE.whatsapp) {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
