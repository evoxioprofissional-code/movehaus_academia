import "server-only";

import { cache } from "react";
import { requireUser } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

export const getCustomerOverview = cache(async () => {
  const user = await requireUser("/minha-area");
  const supabase = await createClient();
  const [ordersResult, accessResult, subscriptionsResult, progressResult] = await Promise.all([
    supabase.from("orders").select("*").eq("customer_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("digital_access").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reading_progress").select("*").eq("user_id", user.id),
  ]);
  const orderIds = (ordersResult.data ?? []).map((order) => order.id);
  const { data: orderItems } = orderIds.length ? await supabase.from("order_items").select("*").in("order_id", orderIds) : { data: [] };
  const productIds = [...new Set([...(accessResult.data ?? []).map((row) => row.product_id), ...(subscriptionsResult.data ?? []).map((row) => row.product_id), ...(orderItems ?? []).flatMap((row) => row.product_id ? [row.product_id] : [])])];
  const { data: products } = productIds.length ? await supabase.from("products").select("id,slug,name,type,images,author,chapters_count,billing_model").in("id", productIds) : { data: [] };
  return {
    orders: (ordersResult.data ?? []).map((order) => ({ ...order, items: (orderItems ?? []).filter((item) => item.order_id === order.id) })),
    access: (accessResult.data ?? []).map((row) => ({ ...row, available: row.status === "active" && (row.permanent || !row.expires_at || Date.parse(row.expires_at) > Date.now()) })),
    subscriptions: subscriptionsResult.data ?? [],
    progress: progressResult.data ?? [],
    products: products ?? [],
  };
});

export async function getProtectedEbook(slug: string) {
  const user = await requireUser(`/minha-area/ler/${slug}`);
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("id,slug,name,type,author,images,chapters_count").eq("slug", slug).in("type", ["ebook", "digital"]).maybeSingle();
  if (!product) return null; // produto inexistente -> 404 de verdade
  const { data: access } = await supabase.from("digital_access").select("*").eq("user_id", user.id).eq("product_id", product.id).eq("status", "active").maybeSingle();
  const valid = access && (access.permanent || !access.expires_at || Date.parse(access.expires_at) > Date.now());
  if (!valid) return { denied: true as const, product }; // existe, mas o aluno não tem acesso
  const [{ data: chapters }, { data: progress }, { data: profile }, { data: publication }] = await Promise.all([
    supabase.from("ebook_chapters").select("id,title,position,content").eq("product_id", product.id).order("position"),
    supabase.from("reading_progress").select("chapter_id,progress_percent").eq("user_id", user.id).eq("product_id", product.id).maybeSingle(),
    supabase.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle(),
    supabase.from("ebooks").select("status").eq("product_id", product.id).eq("status", "published").maybeSingle(),
  ]);
  await supabase.from("access_logs").insert({ user_id: user.id, product_id: product.id, action: "ebook_opened" });
  return { denied: false as const, product, chapters: publication ? chapters ?? [] : [], progress, watermark: profile?.full_name || profile?.email || user.email || "Cliente MoveHaus" };
}

export async function getCustomerOrder(id: string) {
  const user = await requireUser(`/minha-area/compras/${id}`);
  if (!/^[a-f0-9-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).eq("customer_id", user.id).maybeSingle();
  if (error || !order) return null;
  const { data: items, error: itemError } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  if (itemError) throw new Error("Não foi possível consultar os itens do pedido.");
  const ids = (items ?? []).flatMap((item) => item.product_id ? [item.product_id] : []);
  const { data: products } = ids.length ? await supabase.from("products").select("id,type").in("id", ids) : { data: [] };
  return { ...order, items: items ?? [], products: products ?? [] };
}
