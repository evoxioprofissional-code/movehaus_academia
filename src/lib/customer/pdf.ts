export const PDF_BUCKET = "reader-documents";
export const MAX_PDF_SIZE = 25 * 1024 * 1024;
const prefix = "MOVEHAUS_PDF_V1\n";

export type PdfAttachment = { path: string; name: string };

export function pdfAttachment(content: string): PdfAttachment | null {
  if (!content.startsWith(prefix)) return null;
  try {
    const data = JSON.parse(content.slice(prefix.length));
    if (typeof data.path !== "string" || typeof data.name !== "string") return null;
    if (!/^pdfs\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.pdf$/i.test(data.path)) return null;
    return { path: data.path, name: data.name };
  } catch {
    return null;
  }
}

export function pdfChapterContent(attachment: PdfAttachment) {
  return prefix + JSON.stringify(attachment);
}
