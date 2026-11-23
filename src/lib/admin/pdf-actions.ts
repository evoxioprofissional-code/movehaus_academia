"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/user";
import { createAdminClient } from "@/lib/supabase/server";
import { MAX_PDF_SIZE, PDF_BUCKET, pdfChapterContent } from "@/lib/customer/pdf";

export async function preparePdfUpload(productId: string, name: string, size: number) {
  await requireAdmin();
  if (!/^[a-f0-9-]{36}$/i.test(productId) || !name.toLowerCase().endsWith(".pdf") || !Number.isFinite(size) || size <= 0 || size > MAX_PDF_SIZE) {
    return { error: "Selecione um PDF de até 25 MB." };
  }
  const admin = createAdminClient();
  const { data: product } = await admin.from("products").select("id,type").eq("id", productId).maybeSingle();
  if (!product || product.type === "physical") return { error: "Selecione um produto digital." };

  const { data: bucket, error: bucketError } = await admin.storage.getBucket(PDF_BUCKET);
  if (!bucket) {
    if (bucketError && !["404", "400"].includes(String(bucketError.status))) return { error: "Não foi possível consultar a biblioteca de arquivos." };
    const { error } = await admin.storage.createBucket(PDF_BUCKET, { public: false, allowedMimeTypes: ["application/pdf"], fileSizeLimit: MAX_PDF_SIZE });
    if (error) {
      const { data: created } = await admin.storage.getBucket(PDF_BUCKET);
      if (!created || created.public) return { error: "Não foi possível preparar a biblioteca de PDFs." };
    }
  } else if (bucket.public) {
    return { error: "O armazenamento de PDFs deve ser privado." };
  }

  const path = `pdfs/${productId}/${randomUUID()}.pdf`;
  const { data, error } = await admin.storage.from(PDF_BUCKET).createSignedUploadUrl(path);
  return error || !data ? { error: "Não foi possível preparar o envio do PDF." } : { path, token: data.token };
}

export async function publishPdfChapter(productId: string, path: string, name: string, title: string, pages: number) {
  await requireAdmin();
  if (!/^[a-f0-9-]{36}$/i.test(productId) || !new RegExp(`^pdfs/${productId}/[a-f0-9-]{36}\\.pdf$`, "i").test(path)) {
    return { error: "Arquivo inválido." };
  }
  const admin = createAdminClient();
  const { data: product } = await admin.from("products").select("id,type").eq("id", productId).maybeSingle();
  if (!product || product.type === "physical") return { error: "Produto digital não encontrado." };
  const { data: file } = await admin.storage.from(PDF_BUCKET).download(path);
  if (!file || file.size > MAX_PDF_SIZE || !await file.slice(0, 5).text().then((header) => header === "%PDF-")) {
    return { error: "O arquivo enviado não é um PDF válido." };
  }
  if (!Number.isInteger(pages) || pages <= 0) return { error: "Não foi possível verificar as páginas do PDF." };

  const chapterId = path.split("/").at(-1)!.replace(/\.pdf$/i, "");
  const { data: existing } = await admin.from("ebook_chapters").select("id").eq("product_id", productId).eq("id", chapterId).maybeSingle();
  if (existing) return { ok: true };
  const { data: last } = await admin.from("ebook_chapters").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1).maybeSingle();
  const { error } = await admin.from("ebook_chapters").insert({
    id: chapterId,
    product_id: productId,
    title: title.trim().slice(0, 180) || name.replace(/\.pdf$/i, "").slice(0, 180),
    position: (last?.position ?? 0) + 1,
    content: pdfChapterContent({ path, name: name.slice(0, 180) }),
  });
  if (error && error.code !== "23505") return { error: "O PDF foi enviado. Tente salvar novamente para adicioná-lo ao conteúdo." };
  revalidatePath(`/admin/conteudos/${productId}`);
  revalidatePath("/admin/conteudos");
  revalidatePath("/minha-area", "layout");
  return { ok: true };
}
