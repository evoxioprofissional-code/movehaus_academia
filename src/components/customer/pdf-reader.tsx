"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { loadPdfEngine } from "@/lib/customer/pdf-engine";
import { saveReadingProgress } from "@/lib/customer/actions";

type PdfReaderProps = {
  url: string;
  productId: string;
  chapterId: string;
  initialPercent: number;
  watermark: string;
};

export function PdfReader({ url, productId, chapterId, initialPercent, watermark }: PdfReaderProps) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [rendering, setRendering] = useState(true);
  const [text, setText] = useState("");
  const [progressError, setProgressError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const firstPercent = useRef(initialPercent);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let stopped = false;
    let task: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    async function open() {
      try {
        const pdf = await loadPdfEngine();
        if (stopped) return;
        task = pdf.getDocument({ url, disableRange: true, disableStream: true, disableWorkerRendering: true });
        const loaded = await task.promise;
        if (stopped) return;
        setPage(Math.max(1, Math.min(loaded.numPages, Math.round(firstPercent.current / 100 * loaded.numPages))));
        setDocument(loaded);
      } catch {
        if (!stopped) setError("Não foi possível abrir o PDF. Confira sua conexão e tente novamente.");
      }
    }
    void open();
    return () => { stopped = true; void task?.destroy(); };
  }, [url, retry]);

  useEffect(() => {
    if (!document || !width || !canvas.current) return;
    const target = canvas.current;
    let stopped = false;
    let renderTask: RenderTask | undefined;
    async function render() {
      try {
        const pdfPage = await document!.getPage(page);
        if (stopped) return;
        setRendering(true);
        const base = pdfPage.getViewport({ scale: 1 });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = pdfPage.getViewport({ scale: width / base.width * pixelRatio });
        target.width = viewport.width;
        target.height = viewport.height;
        target.style.width = "100%";
        target.style.height = "auto";
        const context = target.getContext("2d");
        if (!context) throw new Error("Canvas indisponível");
        renderTask = pdfPage.render({ canvas: target, canvasContext: context, viewport });
        await renderTask.promise;
        const content = await pdfPage.getTextContent();
        if (stopped) return;
        setText(content.items.map((item) => "str" in item ? item.str : "").join(" "));
        setRendering(false);
      } catch {
        if (!stopped) setError("Não foi possível exibir esta página.");
      }
    }
    void render();
    return () => { stopped = true; renderTask?.cancel(); };
  }, [document, page, width]);

  useEffect(() => {
    if (!document || rendering || error) return;
    const timer = window.setTimeout(() => {
      void saveReadingProgress(productId, chapterId, Math.round(page / document.numPages * 10000) / 100)
        .then((result) => setProgressError("error" in result ? result.error! : ""))
        .catch(() => setProgressError("Sua posição não foi salva. Confira a conexão."));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [document, rendering, error, page, productId, chapterId]);

  function changePage(next: number) {
    setPage(next);
    setRendering(true);
    container.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  return (
    <section className="space-y-4" aria-label="Leitor de PDF">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-black/15 bg-white/70 p-2">
        <button className="grid size-11 place-items-center rounded-lg disabled:opacity-30" aria-label="Página anterior do PDF" disabled={!document || page <= 1 || rendering} onClick={() => changePage(page - 1)}><ChevronLeft size={21} /></button>
        <p className="text-sm font-semibold" aria-live="polite">{document ? `Página ${page} de ${document.numPages}` : "Abrindo PDF..."}</p>
        <button className="grid size-11 place-items-center rounded-lg disabled:opacity-30" aria-label="Próxima página do PDF" disabled={!document || page >= document.numPages || rendering} onClick={() => changePage(page + 1)}><ChevronRight size={21} /></button>
      </div>
      {error && <div role="alert" className="rounded-lg border border-red-800/20 p-4 text-sm"><p>{error}</p><button className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold" onClick={() => { setError(""); setDocument(null); setRendering(true); setRetry(retry + 1); }}><RotateCcw size={16} /> Tentar novamente</button></div>}
      <div ref={container} className="relative min-h-40 scroll-mt-24 overflow-hidden rounded-lg border border-black/10 bg-white" aria-busy={rendering}>
        {rendering && !error && <p role="status" className="p-4 text-center text-sm text-black/60">Carregando página...</p>}
        <canvas ref={canvas} role="img" aria-label={`Página ${page} do PDF`} />
        <p className="sr-only">{text}</p>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[8%] text-center text-xs text-black/15">{watermark}</span>
      </div>
      {progressError && <p role="status" className="text-xs text-red-800">{progressError}</p>}
    </section>
  );
}
