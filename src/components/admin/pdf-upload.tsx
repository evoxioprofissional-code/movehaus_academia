"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { preparePdfUpload, publishPdfChapter } from "@/lib/admin/pdf-actions";
import { createClient } from "@/lib/supabase/client";
import { MAX_PDF_SIZE, PDF_BUCKET } from "@/lib/customer/pdf";
import { loadPdfEngine } from "@/lib/customer/pdf-engine";

export function PdfUpload({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const uploaded = useRef<{ file: File; path: string; pages: number } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("pdf");
    if (!(file instanceof File) || !file.size || file.size > MAX_PDF_SIZE || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Escolha um arquivo PDF de até 25 MB.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!uploaded.current || uploaded.current.file.name !== file.name || uploaded.current.file.size !== file.size || uploaded.current.file.lastModified !== file.lastModified) {
        const pdf = await loadPdfEngine();
        const task = pdf.getDocument({ data: new Uint8Array(await file.arrayBuffer()), disableWorkerRendering: true });
        let pages: number;
        try { pages = (await task.promise).numPages; }
        finally { await task.destroy(); }
        const result = await preparePdfUpload(productId, file.name, file.size);
        if ("error" in result) throw new Error(result.error);
        const { error: uploadError } = await createClient().storage.from(PDF_BUCKET).uploadToSignedUrl(result.path, result.token, file, { contentType: "application/pdf" });
        if (uploadError) throw new Error("Não foi possível enviar o PDF. Tente novamente.");
        uploaded.current = { file, path: result.path, pages };
      }
      const result = await publishPdfChapter(productId, uploaded.current.path, file.name, String(data.get("title") ?? ""), uploaded.current.pages);
      if ("error" in result) throw new Error(result.error);
      setMessage("PDF adicionado. Publique o conteúdo acima para liberar a leitura aos compradores.");
      uploaded.current = null;
      form.reset();
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível adicionar o PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-lg border border-white/10 bg-mh-surface p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><FileUp size={20} /> Adicionar PDF</h2>
      <p className="text-sm text-mh-muted">O arquivo será um item do sumário e terá leitura dentro da plataforma.</p>
      <label className="block space-y-1 text-sm">Título no sumário
        <input name="title" maxLength={180} placeholder="Ex.: Livro de receitas" className="block h-11 w-full rounded-md border border-mh-border bg-mh-black px-3" />
      </label>
      <label className="block space-y-1 text-sm">Arquivo PDF
        <input name="pdf" type="file" accept=".pdf,application/pdf" required className="block w-full text-sm text-mh-muted" />
      </label>
      <p className="text-xs text-mh-muted">Até 25 MB. Use um PDF que abra sem senha.</p>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
      <Button disabled={busy}>{busy ? "Enviando e verificando..." : "Adicionar PDF ao conteúdo"}</Button>
    </form>
  );
}
