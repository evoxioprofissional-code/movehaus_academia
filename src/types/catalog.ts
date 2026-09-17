/**
 * Tipos de domínio do catálogo. Compartilhados entre a UI e (na Fase 3) as
 * queries do Supabase. Valores monetários em CENTAVOS (inteiro).
 */

export type ProductType = "physical" | "digital" | "ebook";
export type BillingModel = "one_time" | "subscription";

export interface Category {
  slug: string;
  name: string;
}

interface BaseProduct {
  id: string;
  slug: string;
  type: ProductType;
  name: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  images: string[];
  featured: boolean;
  active: boolean;
}

export interface PhysicalProduct extends BaseProduct {
  type: "physical";
  price: number;
  /** Preço "de" (antes da promoção), quando houver. */
  compareAtPrice?: number;
  stock: number;
  sku: string;
  variants?: { label: string; options: string[] }[];
  weightGrams?: number;
}

/** Configuração de cobrança de conteúdo digital / e-book. */
export interface DigitalBilling {
  billingModel: BillingModel;
  /** Preço do pagamento único (centavos). */
  price?: number;
  /** Valor mensal da assinatura (centavos). */
  monthlyPrice?: number;
  /** Dias de acesso no pagamento único. null = permanente. */
  accessDurationDays?: number | null;
  /** Carência da assinatura em dias. */
  graceDays?: number;
}

export interface DigitalProduct extends BaseProduct, DigitalBilling {
  type: "digital";
}

export interface EbookProduct extends BaseProduct, DigitalBilling {
  type: "ebook";
  author?: string;
  chaptersCount?: number;
}

export type Product = PhysicalProduct | DigitalProduct | EbookProduct;

export function isPhysical(p: Product): p is PhysicalProduct {
  return p.type === "physical";
}
export function isDigital(p: Product): p is DigitalProduct {
  return p.type === "digital";
}
export function isEbook(p: Product): p is EbookProduct {
  return p.type === "ebook";
}
export function hasBilling(p: Product): p is DigitalProduct | EbookProduct {
  return p.type === "digital" || p.type === "ebook";
}

/** Preço efetivo mostrado no card (centavos). */
export function displayPrice(p: Product): number {
  if (isPhysical(p)) return p.price;
  if (p.billingModel === "subscription") return p.monthlyPrice ?? 0;
  return p.price ?? 0;
}
