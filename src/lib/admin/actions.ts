"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/user";
import type { Database, VariantGroup } from "@/types/database";

export type FormState = { error?: string; message?: string };

// ---------- helpers ----------
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Converte "129,90" / "129.90" / "12990" em centavos; vazio => null. */
function toCents(v: FormDataEntryValue | null): number | null {
  let s = String(v ?? "").trim();
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

function toInt(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

/** "Tamanho: P, M, G" por linha => [{label, options}]. */
function parseVariants(text: string): VariantGroup[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, rest] = line.split(":");
      const options = (rest ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      return { label: (label ?? "").trim(), options };
    })
    .filter((v) => v.label && v.options.length > 0);
}

async function uploadImages(files: File[]): Promise<string[]> {
  const valid = files.filter((f) => f && f.size > 0);
  if (valid.length === 0) return [];
  const admin = createAdminClient();
  const urls: string[] = [];
  for (const file of valid) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage
      .from("catalog")
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (!error) {
      const { data } = admin.storage.from("catalog").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
  }
  return urls;
}

function buildProductPayload(
  fd: FormData,
  images: string[],
): Database["public"]["Tables"]["products"]["Insert"] {
  const type = String(fd.get("type")) as "physical" | "digital" | "ebook";
  const name = String(fd.get("name") ?? "").trim();
  const slug = slugify(String(fd.get("slug") || name));
  const billing = (String(fd.get("billing_model") || "one_time") as
    | "one_time"
    | "subscription");

  return {
    slug,
    type,
    name,
    short_description: String(fd.get("short_description") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    category_id: String(fd.get("category_id") || "") || null,
    images,
    featured: fd.get("featured") === "on",
    active: fd.get("active") === "on",
    // preço à vista: físico, ou digital/ebook com pagamento único
    price:
      type === "physical" || billing === "one_time"
        ? toCents(fd.get("price"))
        : null,
    compare_at_price: type === "physical" ? toCents(fd.get("compare_at_price")) : null,
    stock: type === "physical" ? (toInt(fd.get("stock")) ?? 0) : 0,
    sku: type === "physical" ? String(fd.get("sku") ?? "").trim() || null : null,
    weight_grams: type === "physical" ? toInt(fd.get("weight_grams")) : null,
    variants: type === "physical" ? parseVariants(String(fd.get("variants") ?? "")) : [],
    // digital / ebook
    billing_model: type === "physical" ? null : billing,
    monthly_price: type !== "physical" && billing === "subscription" ? toCents(fd.get("monthly_price")) : null,
    access_duration_days:
      type !== "physical" && billing === "one_time" ? toInt(fd.get("access_duration_days")) : null,
    grace_days: type !== "physical" && billing === "subscription" ? toInt(fd.get("grace_days")) : null,
    // ebook
    author: type === "ebook" ? String(fd.get("author") ?? "").trim() || null : null,
    chapters_count: type === "ebook" ? toInt(fd.get("chapters_count")) : null,
  };
}

// ---------- produtos ----------
export async function createProduct(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do produto." };

  const uploaded = await uploadImages(fd.getAll("images") as File[]);
  const payload = buildProductPayload(fd, uploaded);
  if (!payload.slug) return { error: "Nome/slug inválido." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(payload);
  if (error) return { error: `Não foi possível salvar: ${error.message}` };

  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect("/admin/produtos");
}

export async function updateProduct(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Produto inválido." };

  const kept = (fd.getAll("existingImages") as string[]).filter(Boolean);
  const uploaded = await uploadImages(fd.getAll("images") as File[]);
  const payload = buildProductPayload(fd, [...kept, ...uploaded]);

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) return { error: `Não foi possível salvar: ${error.message}` };

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/loja");
  redirect("/admin/produtos");
}

export async function deleteProduct(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect("/admin/produtos");
}

export async function toggleProductActive(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const active = fd.get("active") === "true";
  const supabase = await createClient();
  await supabase.from("products").update({ active }).eq("id", id);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
}

// ---------- categorias ----------
export async function upsertCategory(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") || "");
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(String(fd.get("slug") || name));
  const position = toInt(fd.get("position")) ?? 0;
  const active = fd.get("active") !== "off";
  const supabase = await createClient();
  if (id) {
    await supabase.from("categories").update({ name, slug, position, active }).eq("id", id);
  } else {
    await supabase.from("categories").insert({ name, slug, position, active });
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/loja");
}

export async function deleteCategory(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categorias");
}

// ---------- e-books / capítulos ----------
export async function saveEbookMeta(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireAdmin();
  const productId = String(fd.get("product_id") ?? "");
  if (!productId) return { error: "E-book inválido." };
  const payload = {
    product_id: productId,
    cover_url: String(fd.get("cover_url") ?? "").trim() || null,
    intro: String(fd.get("intro") ?? "").trim(),
    status: (String(fd.get("status") || "draft") as "draft" | "published"),
  };
  const supabase = await createClient();
  const { error } = await supabase
    .from("ebooks")
    .upsert(payload, { onConflict: "product_id" });
  if (error) return { error: error.message };
  revalidatePath(`/admin/conteudos/${productId}`);
  return { message: "Conteúdo salvo." };
}

export async function createChapter(fd: FormData): Promise<void> {
  await requireAdmin();
  const productId = String(fd.get("product_id") ?? "");
  const title = String(fd.get("title") ?? "").trim();
  if (!productId || !title) return;
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("ebook_chapters")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;
  await supabase.from("ebook_chapters").insert({
    product_id: productId,
    title,
    content: String(fd.get("content") ?? ""),
    position,
  });
  revalidatePath(`/admin/conteudos/${productId}`);
}

export async function updateChapter(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const productId = String(fd.get("product_id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("ebook_chapters")
    .update({
      title: String(fd.get("title") ?? "").trim(),
      content: String(fd.get("content") ?? ""),
    })
    .eq("id", id);
  revalidatePath(`/admin/conteudos/${productId}`);
}

export async function deleteChapter(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const productId = String(fd.get("product_id") ?? "");
  const supabase = await createClient();
  await supabase.from("ebook_chapters").delete().eq("id", id);
  revalidatePath(`/admin/conteudos/${productId}`);
}

export async function moveChapter(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const productId = String(fd.get("product_id") ?? "");
  const dir = String(fd.get("dir") ?? "");
  const supabase = await createClient();
  const { data: chapters } = await supabase
    .from("ebook_chapters")
    .select("id, position")
    .eq("product_id", productId)
    .order("position", { ascending: true });
  if (!chapters) return;
  const idx = chapters.findIndex((c) => c.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= chapters.length) return;
  const a = chapters[idx];
  const b = chapters[swapIdx];
  await Promise.all([
    supabase.from("ebook_chapters").update({ position: b.position }).eq("id", a.id),
    supabase.from("ebook_chapters").update({ position: a.position }).eq("id", b.id),
  ]);
  revalidatePath(`/admin/conteudos/${productId}`);
}

// ---------- configurações ----------
export async function updateSettings(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireAdmin();
  const payload = {
    academy_name: String(fd.get("academy_name") ?? "").trim(),
    whatsapp: String(fd.get("whatsapp") ?? "").trim(),
    whatsapp_label: String(fd.get("whatsapp_label") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    instagram: String(fd.get("instagram") ?? "").trim(),
    address: String(fd.get("address") ?? "").trim(),
    city: String(fd.get("city") ?? "").trim(),
    delivery_rules: String(fd.get("delivery_rules") ?? "").trim(),
    device_limit: toInt(fd.get("device_limit")) ?? 3,
    grace_days: toInt(fd.get("grace_days")) ?? 5,
    nutritionist_name: String(fd.get("nutritionist_name") ?? "").trim(),
    nutritionist_bio: String(fd.get("nutritionist_bio") ?? "").trim(),
    terms: String(fd.get("terms") ?? ""),
    privacy: String(fd.get("privacy") ?? ""),
  };
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { message: "Configurações salvas." };
}
