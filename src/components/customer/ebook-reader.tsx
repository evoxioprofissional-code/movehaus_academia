"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List, Minus, Plus } from "lucide-react";
import { saveReadingProgress } from "@/lib/customer/actions";
import { pdfAttachment } from "@/lib/customer/pdf";
import { Button } from "@/components/ui/button";
import { PdfReader } from "./pdf-reader";

type Chapter = { id: string; title: string; position: number; content: string };
type ReaderProps = {
  product: { id: string; slug: string; name: string; author: string | null };
  chapters: Chapter[];
  initialChapterId?: string | null;
  initialPercent?: number;
  watermark: string;
};

export function EbookReader({ product, chapters, initialChapterId, initialPercent = 0, watermark }: ReaderProps) {
  const initial = Math.max(0, chapters.findIndex((chapter) => chapter.id === initialChapterId));
  const [index, setIndex] = useState(initial);
  const [fontSize, setFontSize] = useState(18);
  const [menu, setMenu] = useState(false);
  const [, startTransition] = useTransition();
  const chapter = chapters[index];
  const pdf = chapter ? pdfAttachment(chapter.content) : null;
  const percent = chapters.length ? Math.round(((index + 1) / chapters.length) * 100) : 0;

  useEffect(() => {
    if (!chapter || pdfAttachment(chapter.content)) return;
    const timer = window.setTimeout(() => startTransition(() => {
      void saveReadingProgress(product.id, chapter.id, percent);
    }), 700);
    return () => window.clearTimeout(timer);
  }, [chapter, percent, product.id]);

  if (!chapter) return <p className="p-8 text-mh-muted">Este conteúdo ainda não possui materiais publicados.</p>;

  function change(next: number) {
    setIndex(Math.max(0, Math.min(chapters.length - 1, next)));
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-dvh bg-[#f1eee8] pb-[env(safe-area-inset-bottom)] text-[#171717]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f1eee8]/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/minha-area/biblioteca" className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold"><ChevronLeft size={18} /> Biblioteca</Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-xs text-black/55">{pdf ? "Leitura de PDF" : `${percent}% concluído`}</p>
          </div>
          <button type="button" onClick={() => setMenu(!menu)} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-black/5" aria-label="Abrir sumário" aria-expanded={menu} aria-controls="reader-summary"><List size={21} /></button>
        </div>
        {!pdf && <div className="h-1 bg-black/10"><div className="h-full bg-mh-red transition-[width]" style={{ width: `${percent}%` }} /></div>}
      </header>

      {menu && (
        <aside id="reader-summary" className="fixed inset-x-4 top-[calc(5rem+env(safe-area-inset-top))] z-30 mx-auto max-h-[70dvh] max-w-md overflow-auto rounded-xl border border-black/10 bg-white p-3 shadow-lg">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-widest text-black/50">Sumário</p>
          {chapters.map((item, itemIndex) => (
            <button key={item.id} type="button" aria-current={itemIndex === index ? "page" : undefined} onClick={() => change(itemIndex)}
              className={`block min-h-11 w-full rounded-lg px-3 py-2.5 text-left text-sm ${itemIndex === index ? "bg-mh-red text-white" : "hover:bg-black/5"}`}>
              {item.position}. {item.title}
            </button>
          ))}
        </aside>
      )}

      <main className="relative mx-auto max-w-3xl px-4 py-7 sm:px-8 sm:py-12">
        {!pdf && <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 grid place-items-center overflow-hidden opacity-[0.035]"><span className="-rotate-12 whitespace-nowrap text-3xl font-bold uppercase tracking-[0.25em]">{watermark}</span></div>}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">{pdf ? "PDF" : "Capítulo"} {index + 1} de {chapters.length}</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">{chapter.title}</h1>
        {product.author && <p className="mt-3 text-sm text-black/55">Por {product.author}</p>}

        {pdf ? (
          <div className="mt-6">
            <PdfReader key={chapter.id} url={`/minha-area/ler/${encodeURIComponent(product.slug)}/pdf/${chapter.id}`}
              productId={product.id} chapterId={chapter.id} initialPercent={chapter.id === initialChapterId ? initialPercent : 0} watermark={watermark} />
          </div>
        ) : (
          <article className="mt-9 whitespace-pre-wrap font-serif leading-[1.85]" style={{ fontSize }}>{chapter.content}</article>
        )}

        {(!pdf || chapters.length > 1) && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-5">
            <Button variant="outline" className="border-black/20 text-[#171717] hover:bg-black/5 hover:text-black" disabled={index === 0} onClick={() => change(index - 1)}><ChevronLeft size={16} /> Anterior</Button>
            {!pdf && <div className="flex items-center gap-1">
              <button className="grid size-11 place-items-center rounded-full hover:bg-black/5" onClick={() => setFontSize(Math.max(15, fontSize - 1))} aria-label="Diminuir texto"><Minus size={16} /></button>
              <span className="text-xs text-black/50">Aa</span>
              <button className="grid size-11 place-items-center rounded-full hover:bg-black/5" onClick={() => setFontSize(Math.min(24, fontSize + 1))} aria-label="Aumentar texto"><Plus size={16} /></button>
            </div>}
            <Button disabled={index === chapters.length - 1} onClick={() => change(index + 1)}>Próximo <ChevronRight size={16} /></Button>
          </div>
        )}
      </main>
    </div>
  );
}
