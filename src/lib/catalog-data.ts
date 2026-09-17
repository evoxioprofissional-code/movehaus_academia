import type { Category, Product } from "@/types/catalog";

/**
 * Dados de exemplo do catálogo (fallback). Servem quando o banco ainda não foi
 * populado ou está indisponível. A fonte real é o Supabase (ver catalog.ts).
 * Sem dependências de servidor — pode ser importado por qualquer componente.
 */

export const CATEGORIES: Category[] = [
  { slug: "vestuario", name: "Vestuário" },
  { slug: "acessorios", name: "Acessórios" },
  { slug: "programas", name: "Programas de treino" },
  { slug: "nutricao", name: "Nutrição" },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p-cam-dry", slug: "camiseta-dry-movehaus", type: "physical",
    name: "Camiseta Dry MoveHaus",
    shortDescription: "Tecido leve com secagem rápida para treino pesado.",
    description:
      "Camiseta de treino em malha dry com toque seco e caimento atlético. Costuras reforçadas e logo emborrachado no peito. Feita para suar sem pesar.",
    categorySlug: "vestuario", images: [], featured: true, active: true,
    price: 12900, compareAtPrice: 15900, stock: 42, sku: "MH-CAM-DRY",
    variants: [{ label: "Tamanho", options: ["P", "M", "G", "GG"] }], weightGrams: 180,
  },
  {
    id: "p-regata", slug: "regata-training", type: "physical",
    name: "Regata Training",
    shortDescription: "Cava ampla e liberdade total de movimento.",
    description:
      "Regata de treino com cava esportiva e tecido respirável. Corte reto, sem apertar. Ideal para dias de ombro e costas.",
    categorySlug: "vestuario", images: [], featured: false, active: true,
    price: 9900, stock: 30, sku: "MH-REG-01",
    variants: [{ label: "Tamanho", options: ["P", "M", "G", "GG"] }], weightGrams: 150,
  },
  {
    id: "p-moletom", slug: "moletom-movehaus", type: "physical",
    name: "Moletom MoveHaus",
    shortDescription: "Para o aquecimento e para a rua.",
    description:
      "Moletom flanelado por dentro, com capuz e bolso canguru. Peso médio, quente sem esquentar demais. Bordado da marca no peito.",
    categorySlug: "vestuario", images: [], featured: true, active: true,
    price: 21900, stock: 18, sku: "MH-MOL-01",
    variants: [{ label: "Tamanho", options: ["P", "M", "G", "GG"] }], weightGrams: 520,
  },
  {
    id: "p-squeeze", slug: "squeeze-1l", type: "physical",
    name: "Squeeze MoveHaus 1L",
    shortDescription: "Garrafa de 1 litro livre de BPA.",
    description:
      "Garrafa de treino de 1 litro com marcação de volume e bico de rosca vedante. Material resistente e livre de BPA.",
    categorySlug: "acessorios", images: [], featured: false, active: true,
    price: 5900, compareAtPrice: 6900, stock: 60, sku: "MH-SQZ-1L", weightGrams: 140,
  },
  {
    id: "p-straps", slug: "straps-de-treino", type: "physical",
    name: "Straps de Treino",
    shortDescription: "Pegada firme nos exercícios de puxada.",
    description:
      "Par de straps em algodão reforçado para auxiliar a pegada em levantamentos e puxadas. Costura dupla e boa durabilidade.",
    categorySlug: "acessorios", images: [], featured: false, active: true,
    price: 4500, stock: 0, sku: "MH-STR-01", weightGrams: 90,
  },
  {
    id: "d-hipertrofia-12", slug: "programa-hipertrofia-12-semanas", type: "digital",
    name: "Programa de Hipertrofia — 12 semanas",
    shortDescription: "Plano completo de 12 semanas para ganho de massa.",
    description:
      "Programa progressivo de 12 semanas com divisão de treinos, séries, repetições e orientações de execução. Pensado para quem já treina e quer estrutura para evoluir. Acesso permanente após a compra.",
    categorySlug: "programas", images: [], featured: true, active: true,
    billingModel: "one_time", price: 14900, accessDurationDays: null,
  },
  {
    id: "d-full-body-mensal", slug: "full-body-clube", type: "digital",
    name: "Full Body Clube — treinos mensais",
    shortDescription: "Treinos novos todo mês enquanto a assinatura estiver ativa.",
    description:
      "Assinatura com novos treinos full body publicados mensalmente, com variações para academia e para casa. O acesso acompanha a assinatura ativa.",
    categorySlug: "programas", images: [], featured: true, active: true,
    billingModel: "subscription", monthlyPrice: 3990, graceDays: 5,
  },
  {
    id: "e-alimentacao-treino", slug: "guia-alimentacao-para-treino", type: "ebook",
    name: "Guia de Alimentação para Treino",
    shortDescription: "Como organizar as refeições em torno do treino.",
    description:
      "Material introdutório sobre organização das refeições ao longo do dia de treino, hidratação e leitura de rótulos. Conteúdo educativo, sem substituir acompanhamento individual.",
    categorySlug: "nutricao", images: [], featured: true, active: true,
    author: "Equipe MoveHaus", chaptersCount: 6,
    billingModel: "one_time", price: 4900, accessDurationDays: null,
  },
  {
    id: "e-receitas-clube", slug: "receitas-do-clube", type: "ebook",
    name: "Receitas do Clube",
    shortDescription: "Novas receitas práticas todo mês.",
    description:
      "Coletânea de receitas práticas atualizada mensalmente, com opções para diferentes objetivos. O acesso acompanha a assinatura ativa.",
    categorySlug: "nutricao", images: [], featured: false, active: true,
    author: "Equipe MoveHaus", chaptersCount: 10,
    billingModel: "subscription", monthlyPrice: 2490, graceDays: 7,
  },
  {
    id: "e-organizacao-90", slug: "organizacao-de-rotina-90-dias", type: "ebook",
    name: "Organização de Rotina — 90 dias",
    shortDescription: "Planejamento de treino e alimentação por 90 dias.",
    description:
      "Guia com um plano de 90 dias para organizar treino, sono e refeições. Acesso liberado por 180 dias após a compra.",
    categorySlug: "nutricao", images: [], featured: false, active: true,
    author: "Equipe MoveHaus", chaptersCount: 8,
    billingModel: "one_time", price: 6900, accessDurationDays: 180,
  },
];
