import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type EbookRow = Database["public"]["Tables"]["ebooks"]["Row"];
export type ChapterRow = Database["public"]["Tables"]["ebook_chapters"]["Row"];
export type SettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];
export type BannerRow = Database["public"]["Tables"]["banners"]["Row"];

export async function dashboardStats() {
  const supabase = await createClient();
  const [products, activeProducts, ebooks, customers, categories, lowStock, orders, approvedOrders, subscriptions] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("type", "ebook"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("type", "physical").lte("stock", 5),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total", { count: "exact" }).eq("payment_status", "approved"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("billing_model", "subscription").eq("active", true),
    ]);

  const revenue = (approvedOrders.data ?? []).reduce((sum, order) => sum + order.total, 0);
  const sales = approvedOrders.count ?? 0;

  return {
    products: products.count ?? 0,
    activeProducts: activeProducts.count ?? 0,
    ebooks: ebooks.count ?? 0,
    customers: customers.count ?? 0,
    categories: categories.count ?? 0,
    lowStock: lowStock.count ?? 0,
    orders: orders.count ?? 0,
    revenue,
    sales,
    averageTicket: sales > 0 ? Math.round(revenue / sales) : 0,
    subscriptions: subscriptions.count ?? 0,
  };
}

export type ProductListFilters = {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  stock?: string;
  featured?: string;
  sort?: string;
  page?: number;
};

export async function listProductsPage(filters: ProductListFilters) {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = 20;
  let query = supabase.from("products").select("*", { count: "exact" });
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.type) query = query.eq("type", filters.type as "physical" | "digital" | "ebook");
  if (filters.status === "active") query = query.eq("active", true);
  if (filters.status === "inactive") query = query.eq("active", false);
  if (filters.stock === "low") query = query.eq("type", "physical").lte("stock", 5);
  if (filters.stock === "out") query = query.eq("type", "physical").lte("stock", 0);
  if (filters.featured === "yes") query = query.eq("featured", true);
  if (filters.featured === "no") query = query.eq("featured", false);
  const ascending = filters.sort === "oldest" || filters.sort === "name";
  const sortColumn = filters.sort === "name" ? "name" : filters.sort === "stock" ? "stock" : "updated_at";
  const { data, count } = await query
    .order(sortColumn, { ascending })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const ids = (data ?? []).map((product) => product.id);
  const { data: images } = ids.length
    ? await supabase.from("product_images").select("*").in("product_id", ids).order("display_order")
    : { data: [] as ProductImageRow[] };
  const primaryByProduct = new Map<string, ProductImageRow>();
  for (const image of images ?? []) {
    if (!primaryByProduct.has(image.product_id) || image.is_primary) primaryByProduct.set(image.product_id, image);
  }
  return { products: data ?? [], count: count ?? 0, page, pageSize, primaryByProduct };
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

export async function getProductImages(productId: string): Promise<ProductImageRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("product_images").select("*").eq("product_id", productId).order("display_order");
  return data ?? [];
}

export async function listCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  return data ?? [];
}

export async function listCategoriesWithCounts() {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);
  return categories.map((category) => ({ ...category, productCount: products.filter((product) => product.category_id === category.id).length }));
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
  (ProfileRow & { role: string; orderCount: number; totalSpent: number })[]
> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("orders").select("customer_id,total,payment_status"),
  ]);
  const roleById = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
  return (profiles ?? []).map((p) => {
    const customerOrders = (orders ?? []).filter((order) => order.customer_id === p.id);
    return { ...p, role: roleById.get(p.id) ?? "customer", orderCount: customerOrders.length, totalSpent: customerOrders.filter((order) => order.payment_status === "approved").reduce((sum, order) => sum + order.total, 0) };
  });
}

export async function getSettings(): Promise<SettingsRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data ?? null;
}

export async function listOrders(): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
  return data ?? [];
}

export async function listCoupons(): Promise<CouponRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function listBanners(): Promise<BannerRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").order("position");
  return data ?? [];
}
