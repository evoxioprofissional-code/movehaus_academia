"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileText, FileUp } from "lucide-react";
import { Alert, FormField, Input, btn } from "@/components/admin/kit";
import { preparePdfUpload, publishPdfChapter } from "@/lib/admin/pdf-actions";
import { createClient } from "@/lib/supabase/client";
import { MAX_PDF_SIZE, PDF_BUCKET } from "@/lib/customer/pdf";
import { loadPdfEngine } from "@/lib/customer/pdf-engine";

export function PdfUpload({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);
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
      setPicked(null);
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível adicionar o PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <FormField label="Nome no sumário" hint="Como o item aparece para o cliente.">
        <Input name="title" maxLength={180} placeholder="Ex.: Livro de receitas" />
      </FormField>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-[#d9d7d0] bg-ad-soft/60 p-4 transition-colors hover:border-ad-ink/30">
        <span className={picked ? "grid size-11 shrink-0 place-items-center rounded-xl bg-ad-red text-white" : "grid size-11 shrink-0 place-items-center rounded-xl bg-white text-ad-ink-2 shadow-sm"}>
          {picked ? <FileText className="size-5" /> : <FileUp className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-ad-ink">{picked ? picked.name : "Escolher arquivo PDF"}</span>
          <span className="block text-[12.5px] text-ad-muted">{picked ? `${(picked.size / 1024 / 1024).toFixed(1)} MB` : "Até 25 MB, sem senha"}</span>
        </span>
        <input
          name="pdf"
          type="file"
          accept=".pdf,application/pdf"
          required
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPicked(file ? { name: file.name, size: file.size } : null);
          }}
        />
      </label>
      {error && <Alert>{error}</Alert>}
      {message && <Alert tone="green">{message}</Alert>}
      <button disabled={busy} className={btn("brand", "md", "sm:justify-self-start")}>{busy ? "Enviando e verificando…" : "Adicionar PDF"}</button>
    </form>
  );
}
