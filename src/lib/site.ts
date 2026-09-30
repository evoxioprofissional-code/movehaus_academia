/** Fallbacks usados somente quando as configurações públicas estão indisponíveis. */
export const SITE = {
  name: "MoveHaus Training Club",
  shortName: "MoveHaus",
  tagline: "Mais que treino. Um estilo de vida.",
  whatsapp: "",
  whatsappLabel: "",
  instagram: "",
  instagramHandle: "",
  email: "",
  city: "Colômbia/SP",
  address: "Colômbia, São Paulo",
};

/** Monta um link wa.me com mensagem pré-preenchida. */
export function whatsappLink(message?: string, number = SITE.whatsapp) {
  const base = "https://wa.me/" + number.replace(/\D/g, "");
  return message ? base + "?text=" + encodeURIComponent(message) : base;
}
