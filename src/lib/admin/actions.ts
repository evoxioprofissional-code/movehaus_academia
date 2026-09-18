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

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/avif", "avif"],
]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function validateImages(files: File[]) {
  for (const file of files.filter((item) => item.size > 0)) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error(`${file.name}: formato não permitido.`);
    if (file.size > MAX_IMAGE_SIZE) throw new Error(`${file.name}: o limite é 8 MB.`);
  }
}

async function uploadImages(productId: string, files: File[]) {
  const valid = files.filter((f) => f && f.size > 0);
  validateImages(valid);
  if (valid.length === 0) return [];
  const admin = createAdminClient();
  const uploaded: { storage_path: string; url: string; name: string }[] = [];
  for (const file of valid) {
    const ext = ALLOWED_IMAGE_TYPES.get(file.type)!;
    const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage
      .from("catalog")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(`Falha ao enviar ${file.name}: ${error.message}`);
    const { data } = admin.storage.from("catalog").getPublicUrl(path);
    uploaded.push({ storage_path: path, url: data.publicUrl, name: file.name.replace(/\.[^.]+$/, "") });
  }
  return uploaded;
}

function buildProductPayload(
  fd: FormData,
  images: string[] | null,
): Database["public"]["Tables"]["products"]["Insert"] {
  const type = String(fd.get("type")) as "physical" | "digital" | "ebook";
  const name = String(fd.get("name") ?? "").trim();
  const slug = slugify(String(fd.get("slug") || name));
  const billing = (String(fd.get("billing_model") || "one_time") as
    | "one_time"
    | "subscription");

  const status = String(fd.get("status") || "active");
  return {
    slug,
    type,
    name,
    short_description: String(fd.get("short_description") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    category_id: String(fd.get("category_id") || "") || null,
    ...(images ? { images } : {}),
    featured: fd.get("featured") === "on",
    active: fd.get("active") === "on" && status === "active",
    status,
    tags: String(fd.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    promotion_starts_at: String(fd.get("promotion_starts_at") || "") || null,
    promotion_ends_at: String(fd.get("promotion_ends_at") || "") || null,
    featured_order: toInt(fd.get("featured_order")),
    is_new: fd.get("is_new") === "on",
    show_on_home: fd.get("show_on_home") === "on",
    custom_badge: String(fd.get("custom_badge") || "").trim() || null,
    track_inventory: fd.get("track_inventory") === "on",
    minimum_stock: toInt(fd.get("minimum_stock")) ?? 5,
    allow_backorder: fd.get("allow_backorder") === "on",
    requires_shipping: type === "physical" && fd.get("requires_shipping") === "on",
    width_cm: Number(fd.get("width_cm")) || null,
    height_cm: Number(fd.get("height_cm")) || null,
    length_cm: Number(fd.get("length_cm")) || null,
    extra_lead_days: toInt(fd.get("extra_lead_days")) ?? 0,
    shipping_notes: String(fd.get("shipping_notes") || "").trim(),
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

  const files = fd.getAll("images") as File[];
  try { validateImages(files); } catch (error) { return { error: error instanceof Error ? error.message : "Imagem inválida." }; }
  const payload = buildProductPayload(fd, []);
  if (!payload.slug) return { error: "Nome/slug inválido." };

  if ((payload.price ?? 0) < 0 || (payload.monthly_price ?? 0) < 0) return { error: "O preço não pode ser negativo." };
  if (payload.compare_at_price && payload.price && payload.price >= payload.compare_at_price) return { error: "O preço promocional deve ser menor que o preço normal." };

  const supabase = await createClient();
  const { data: product, error } = await supabase.from("products").insert(payload).select("id, name").single();
  if (error) return { error: `Não foi possível salvar: ${error.message}` };

  try {
    const uploaded = await uploadImages(product.id, files);
    if (uploaded.length) {
      await supabase.from("product_images").insert(uploaded.map((image, index) => ({ product_id: product.id, storage_path: image.storage_path, alt_text: product.name, is_primary: index === 0, display_order: index })));
      await supabase.from("products").update({ images: uploaded.map((image) => image.url) }).eq("id", product.id);
    }
  } catch (uploadError) {
    return { error: uploadError instanceof Error ? uploadError.message : "Falha no upload." };
  }

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

  const files = fd.getAll("images") as File[];
  try { validateImages(files); } catch (error) { return { error: error instanceof Error ? error.message : "Imagem inválida." }; }
  const payload = buildProductPayload(fd, null);

  if ((payload.price ?? 0) < 0 || (payload.monthly_price ?? 0) < 0) return { error: "O preço não pode ser negativo." };
  if (payload.compare_at_price && payload.price && payload.price >= payload.compare_at_price) return { error: "O preço promocional deve ser menor que o preço normal." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) return { error: `Não foi possível salvar: ${error.message}` };

  const keptIds = (fd.getAll("existing_image_id") as string[]).filter(Boolean);
  const { data: currentImages } = await supabase.from("product_images").select("*").eq("product_id", id);
  const removed = (currentImages ?? []).filter((image) => !keptIds.includes(image.id));
  if (removed.length) {
    const admin = createAdminClient();
    const paths = removed.flatMap((image) => image.storage_path ? [image.storage_path] : []);
    if (paths.length) await admin.storage.from("catalog").remove(paths);
    await supabase.from("product_images").delete().in("id", removed.map((image) => image.id));
  }
  const primaryId = String(fd.get("primary_image_id") || "");
  for (const [index, imageId] of keptIds.entries()) {
    await supabase.from("product_images").update({ display_order: index, is_primary: imageId === primaryId, alt_text: String(fd.get(`alt_${imageId}`) || "") }).eq("id", imageId);
  }
  try {
    const uploaded = await uploadImages(id, files);
    if (uploaded.length) {
      const hasPrimary = keptIds.includes(primaryId);
      await supabase.from("product_images").insert(uploaded.map((image, index) => ({ product_id: id, storage_path: image.storage_path, alt_text: String(fd.get("name") || image.name), is_primary: !hasPrimary && index === 0, display_order: keptIds.length + index })));
    }
  } catch (uploadError) {
    return { error: uploadError instanceof Error ? uploadError.message : "Falha no upload." };
  }
  const { data: finalImages } = await supabase.from("product_images").select("storage_path, legacy_url").eq("product_id", id).order("display_order");
  const admin = createAdminClient();
  const urls = (finalImages ?? []).map((image) => image.legacy_url || (image.storage_path ? admin.storage.from("catalog").getPublicUrl(image.storage_path).data.publicUrl : "")).filter(Boolean);
  await supabase.from("products").update({ images: urls }).eq("id", id);

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/loja");
  redirect("/admin/produtos");
}

export async function deleteProduct(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const supabase = await createClient();
  const { data: images } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
  await supabase.from("products").delete().eq("id", id);
  const paths = (images ?? []).flatMap((image) => image.storage_path ? [image.storage_path] : []);
  if (paths.length) await createAdminClient().storage.from("catalog").remove(paths);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
  redirect("/admin/produtos");
}

export async function bulkUpdateProducts(fd: FormData): Promise<void> {
  await requireAdmin();
  const ids = fd.getAll("ids").map(String).filter(Boolean);
  const operation = String(fd.get("operation") || "");
  if (!ids.length) return;
  const supabase = await createClient();
  if (operation === "activate") await supabase.from("products").update({ active: true, status: "active" }).in("id", ids);
  if (operation === "deactivate") await supabase.from("products").update({ active: false, status: "inactive" }).in("id", ids);
  if (operation === "feature") await supabase.from("products").update({ featured: true, show_on_home: true }).in("id", ids);
  if (operation === "unfeature") await supabase.from("products").update({ featured: false }).in("id", ids);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
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
  const active = fd.get("active") === "on";
  const description = String(fd.get("description") ?? "").trim();
  const supabase = await createClient();
  if (id) {
    await supabase.from("categories").update({ name, slug, description, position, active }).eq("id", id);
  } else {
    await supabase.from("categories").insert({ name, slug, description, position, active });
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
  const cover = fd.get("cover");
  let coverPath = String(fd.get("existing_cover_path") || "") || null;
  let coverUrl = String(fd.get("cover_url") ?? "").trim() || null;
  if (cover instanceof File && cover.size > 0) {
    try { validateImages([cover]); } catch (error) { return { error: error instanceof Error ? error.message : "Capa inválida." }; }
    const ext = ALLOWED_IMAGE_TYPES.get(cover.type)!;
    const path = `ebooks/${productId}/${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();
    const { error } = await admin.storage.from("catalog").upload(path, cover, { contentType: cover.type, cacheControl: "31536000" });
    if (error) return { error: error.message };
    coverPath = path;
    coverUrl = admin.storage.from("catalog").getPublicUrl(path).data.publicUrl;
  }
  const payload = {
    product_id: productId,
    cover_url: coverUrl,
    cover_path: coverPath,
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

export async function createCoupon(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const code = String(fd.get("code") || "").trim().toUpperCase();
  const discountType = String(fd.get("discount_type") || "percentage") as "percentage" | "fixed";
  const rawValue = Number(String(fd.get("discount_value") || "0").replace(",", "."));
  if (!code) return { error: "Informe o código do cupom." };
  if (!Number.isFinite(rawValue) || rawValue <= 0) return { error: "Informe um desconto válido." };
  if (discountType === "percentage" && rawValue > 100) return { error: "O percentual não pode passar de 100%." };
  const discountValue = discountType === "percentage" ? Math.round(rawValue * 100) : Math.round(rawValue * 100);
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({ code, description: String(fd.get("description") || "").trim(), discount_type: discountType, discount_value: discountValue, minimum_order: toCents(fd.get("minimum_order")) ?? 0, usage_limit: toInt(fd.get("usage_limit")), usage_per_customer: toInt(fd.get("usage_per_customer")), starts_at: String(fd.get("starts_at") || "") || null, ends_at: String(fd.get("ends_at") || "") || null, active: fd.get("active") === "on" });
  if (error) return { error: error.message };
  revalidatePath("/admin/promocoes");
  return { message: "Cupom criado." };
}

export async function deleteCoupon(fd: FormData) {
  await requireAdmin();
  await (await createClient()).from("coupons").delete().eq("id", String(fd.get("id") || ""));
  revalidatePath("/admin/promocoes");
}

export async function createBanner(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = String(fd.get("title") || "").trim();
  if (!title) return { error: "Informe o título do banner." };
  const files = [fd.get("desktop_image"), fd.get("mobile_image")].filter((file): file is File => file instanceof File && file.size > 0);
  try { validateImages(files); } catch (error) { return { error: error instanceof Error ? error.message : "Imagem inválida." }; }
  const admin = createAdminClient();
  const paths: (string | null)[] = [];
  for (const file of files) {
    const ext = ALLOWED_IMAGE_TYPES.get(file.type)!;
    const path = `banners/${crypto.randomUUID()}.${ext}`;
    const { error } = await admin.storage.from("catalog").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) return { error: error.message };
    paths.push(path);
  }
  const desktop = fd.get("desktop_image") instanceof File && (fd.get("desktop_image") as File).size > 0 ? paths.shift() ?? null : null;
  const mobile = fd.get("mobile_image") instanceof File && (fd.get("mobile_image") as File).size > 0 ? paths.shift() ?? null : null;
  const { error } = await (await createClient()).from("banners").insert({ title, subtitle: String(fd.get("subtitle") || "").trim(), desktop_image_path: desktop, mobile_image_path: mobile, button_label: String(fd.get("button_label") || "").trim() || null, link: String(fd.get("link") || "").trim() || null, starts_at: String(fd.get("starts_at") || "") || null, ends_at: String(fd.get("ends_at") || "") || null, active: fd.get("active") === "on", position: toInt(fd.get("position")) ?? 0 });
  if (error) return { error: error.message };
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { message: "Banner criado." };
}

export async function deleteBanner(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") || "");
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("desktop_image_path, mobile_image_path").eq("id", id).maybeSingle();
  await supabase.from("banners").delete().eq("id", id);
  const paths = [data?.desktop_image_path, data?.mobile_image_path].filter((path): path is string => Boolean(path));
  if (paths.length) await createAdminClient().storage.from("catalog").remove(paths);
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
