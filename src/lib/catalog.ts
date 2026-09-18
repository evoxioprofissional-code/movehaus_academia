import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types/catalog";
import type { Database } from "@/types/database";
import { CATEGORIES, SAMPLE_PRODUCTS } from "@/lib/catalog-data";

export { CATEGORIES } from "@/lib/catalog-data";

/**
 * Acesso ao catálogo. Lê do Supabase; se o banco estiver indisponível ou vazio
 * por erro, cai para os dados de exemplo (catalog-data.ts) para a loja não
 * quebrar. O painel administrativo (Fase 4) é a fonte real dos dados.
 */

type Row = Database["public"]["Tables"]["products"]["Row"];

function mapRow(r: Row, slugById: Map<string, string>): Product {
  const now = Date.now();
  const promotionActive =
    (!r.promotion_starts_at || new Date(r.promotion_starts_at).getTime() <= now) &&
    (!r.promotion_ends_at || new Date(r.promotion_ends_at).getTime() >= now);
  const base = {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description,
    description: r.description,
    categorySlug: r.category_id ? (slugById.get(r.category_id) ?? "") : "",
    images: r.images ?? [],
    featured: r.featured,
    active: r.active,
  };
  if (r.type === "physical") {
    return {
      ...base,
      type: "physical",
      price: r.price ?? 0,
      ...(promotionActive && r.compare_at_price ? { compareAtPrice: r.compare_at_price } : {}),
      stock: r.stock,
      sku: r.sku ?? "",
      variants: r.variants ?? [],
      ...(r.weight_grams != null ? { weightGrams: r.weight_grams } : {}),
    };
  }
  if (r.type === "digital") {
    return {
      ...base,
      type: "digital",
      billingModel: r.billing_model ?? "one_time",
      ...(r.price != null ? { price: r.price } : {}),
      ...(r.monthly_price != null ? { monthlyPrice: r.monthly_price } : {}),
      accessDurationDays: r.access_duration_days,
      ...(r.grace_days != null ? { graceDays: r.grace_days } : {}),
    };
  }
  return {
    ...base,
    type: "ebook",
    billingModel: r.billing_model ?? "one_time",
    ...(r.price != null ? { price: r.price } : {}),
    ...(r.monthly_price != null ? { monthlyPrice: r.monthly_price } : {}),
    accessDurationDays: r.access_duration_days,
    ...(r.grace_days != null ? { graceDays: r.grace_days } : {}),
    ...(r.author ? { author: r.author } : {}),
    ...(r.chapters_count != null ? { chaptersCount: r.chapters_count } : {}),
  };
}

async function fetchAll(): Promise<Product[] | null> {
  try {
    const supabase = await createClient();
    const [{ data: cats }, { data, error }] = await Promise.all([
      supabase.from("categories").select("id, slug"),
      supabase.from("products").select("*").eq("active", true),
    ]);
    if (error || !data) return null;
    const slugById = new Map((cats ?? []).map((c) => [c.id, c.slug]));
    return data.map((r) => mapRow(r as Row, slugById));
  } catch {
    return null;
  }
}

function applyFilter(
  list: Product[],
  filter?: { type?: Product["type"]; categorySlug?: string; query?: string },
): Product[] {
  let out = list;
  if (filter?.type) out = out.filter((p) => p.type === filter.type);
  if (filter?.categorySlug)
    out = out.filter((p) => p.categorySlug === filter.categorySlug);
  if (filter?.query) {
    const q = filter.query.toLowerCase().trim();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q),
    );
  }
  return out;
}

async function allProducts(): Promise<Product[]> {
  const fromDb = await fetchAll();
  return fromDb ?? SAMPLE_PRODUCTS.filter((p) => p.active);
}

export async function getProducts(filter?: {
  type?: Product["type"];
  categorySlug?: string;
  query?: string;
}): Promise<Product[]> {
  return applyFilter(await allProducts(), filter);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await allProducts()).find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await allProducts()).filter((p) => p.featured);
}

export async function getOnSaleProducts(): Promise<Product[]> {
  return (await allProducts()).filter(
    (p) => p.type === "physical" && p.compareAtPrice && p.compareAtPrice > p.price,
  );
}

export async function getEbooks(): Promise<Product[]> {
  return (await allProducts()).filter((p) => p.type === "ebook");
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("slug, name")
      .eq("active", true)
      .order("position", { ascending: true });
    if (error || !data || data.length === 0) return CATEGORIES;
    return data.map((c) => ({ slug: c.slug, name: c.name }));
  } catch {
    return CATEGORIES;
  }
}
