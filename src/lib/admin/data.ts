import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type EbookRow = Database["public"]["Tables"]["ebooks"]["Row"];
export type ChapterRow = Database["public"]["Tables"]["ebook_chapters"]["Row"];
export type SettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function dashboardStats() {
  const supabase = await createClient();
  const [products, activeProducts, ebooks, customers, categories, lowStock] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("type", "ebook"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("type", "physical").lte("stock", 5),
    ]);

  return {
    products: products.count ?? 0,
    activeProducts: activeProducts.count ?? 0,
    ebooks: ebooks.count ?? 0,
    customers: customers.count ?? 0,
    categories: categories.count ?? 0,
    lowStock: lowStock.count ?? 0,
  };
}

export async function listProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProductById(id: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function listCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  return data ?? [];
}

export async function listEbookProducts(): Promise<
  (ProductRow & { ebook: EbookRow | null })[]
> {
  const supabase = await createClient();
  const [{ data: products }, { data: ebooks }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("type", "ebook")
      .order("created_at", { ascending: false }),
    supabase.from("ebooks").select("*"),
  ]);
  const metaById = new Map((ebooks ?? []).map((e) => [e.product_id, e]));
  return (products ?? []).map((p) => ({ ...p, ebook: metaById.get(p.id) ?? null }));
}

export async function getEbook(productId: string) {
  const supabase = await createClient();
  const [{ data: product }, { data: ebook }, { data: chapters }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", productId).maybeSingle(),
      supabase.from("ebooks").select("*").eq("product_id", productId).maybeSingle(),
      supabase
        .from("ebook_chapters")
        .select("*")
        .eq("product_id", productId)
        .order("position", { ascending: true }),
    ]);
  return { product, ebook, chapters: chapters ?? [] };
}

export async function listCustomers(): Promise<
  (ProfileRow & { role: string })[]
> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  const roleById = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
  return (profiles ?? []).map((p) => ({ ...p, role: roleById.get(p.id) ?? "customer" }));
}

export async function getSettings(): Promise<SettingsRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data ?? null;
}
