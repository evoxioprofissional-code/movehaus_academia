import { createAdminClient } from "@/lib/supabase/server";
import { getProtectedEbook } from "@/lib/customer/data";
import { PDF_BUCKET, pdfAttachment } from "@/lib/customer/pdf";

export async function GET(_request: Request, context: { params: Promise<{ slug: string; chapterId: string }> }) {
  const { slug, chapterId } = await context.params;
  const content = await getProtectedEbook(slug);
  if (!content || content.denied) return new Response("Acesso indisponível.", { status: 403 });
  const chapter = content.chapters.find((item) => item.id === chapterId);
  const attachment = chapter && pdfAttachment(chapter.content);
  if (!attachment || !attachment.path.startsWith(`pdfs/${content.product.id}/`)) {
    return new Response("PDF não encontrado.", { status: 404 });
  }

  const { data, error } = await createAdminClient().storage.from(PDF_BUCKET).download(attachment.path);
  if (error || !data) return new Response("Não foi possível abrir o PDF.", { status: 503 });
  return new Response(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
