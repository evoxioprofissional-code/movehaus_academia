"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List, Minus, Plus } from "lucide-react";
import { saveReadingProgress } from "@/lib/customer/actions";
import { Button } from "@/components/ui/button";

type Chapter = { id: string; title: string; position: number; content: string };

export function EbookReader({ product, chapters, initialChapterId, watermark }: { product: { id: string; name: string; author: string | null }; chapters: Chapter[]; initialChapterId?: string | null; watermark: string }) {
  const initial = Math.max(0, chapters.findIndex((chapter) => chapter.id === initialChapterId));
  const [index, setIndex] = useState(initial);
  const [fontSize, setFontSize] = useState(18);
  const [menu, setMenu] = useState(false);
  const [, startTransition] = useTransition();
  const chapter = chapters[index];
  const percent = chapters.length ? Math.round(((index + 1) / chapters.length) * 100) : 0;
  useEffect(() => {
    if (!chapter) return;
    const timer = window.setTimeout(() => startTransition(() => { void saveReadingProgress(product.id, chapter.id, percent); }), 700);
    return () => window.clearTimeout(timer);
  }, [chapter, percent, product.id]);
  if (!chapter) return <p className="p-8 text-mh-muted">Este conteúdo ainda não possui capítulos publicados.</p>;
  const change = (next: number) => { setIndex(Math.max(0, Math.min(chapters.length - 1, next))); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <div className="min-h-screen bg-[#f1eee8] text-[#171717]"><header className="sticky top-0 z-20 border-b border-black/10 bg-[#f1eee8]/95 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3"><Button asChild variant="ghost" size="sm"><Link href="/minha-area"><ChevronLeft className="size-4" />Biblioteca</Link></Button><div className="min-w-0 text-center"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-xs text-black/55">{percent}% concluído</p></div><button type="button" onClick={() => setMenu(!menu)} className="grid size-10 place-items-center rounded-full hover:bg-black/5" aria-label="Abrir sumário"><List className="size-5" /></button></div><div className="h-1 bg-black/10"><div className="h-full bg-mh-red transition-[width]" style={{ width: `${percent}%` }} /></div></header>{menu && <aside className="fixed inset-x-4 top-20 z-30 mx-auto max-h-[70vh] max-w-md overflow-auto rounded-xl border border-black/10 bg-white p-3"><p className="px-2 py-2 text-xs font-semibold uppercase tracking-widest text-black/50">Sumário</p>{chapters.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => { change(itemIndex); setMenu(false); }} className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${itemIndex === index ? "bg-mh-red text-white" : "hover:bg-black/5"}`}>{item.position}. {item.title}</button>)}</aside>}<main className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16"><div aria-hidden className="pointer-events-none fixed inset-0 z-10 grid place-items-center overflow-hidden opacity-[0.035]"><span className="-rotate-12 whitespace-nowrap text-3xl font-bold uppercase tracking-[0.25em]">{watermark}</span></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">Capítulo {index + 1} de {chapters.length}</p><h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">{chapter.title}</h1>{product.author && <p className="mt-3 text-sm text-black/55">Por {product.author}</p>}<article className="mt-9 whitespace-pre-wrap font-serif leading-[1.85]" style={{ fontSize }}>{chapter.content}</article><div className="mt-12 flex items-center justify-between border-t border-black/10 pt-6"><Button variant="outline" disabled={index === 0} onClick={() => change(index - 1)}><ChevronLeft className="size-4" />Anterior</Button><div className="flex items-center gap-1"><button onClick={() => setFontSize(Math.max(15, fontSize - 1))} className="grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Diminuir texto"><Minus className="size-4" /></button><span className="text-xs text-black/50">Aa</span><button onClick={() => setFontSize(Math.min(24, fontSize + 1))} className="grid size-9 place-items-center rounded-full hover:bg-black/5" aria-label="Aumentar texto"><Plus className="size-4" /></button></div><Button disabled={index === chapters.length - 1} onClick={() => change(index + 1)}>Próximo<ChevronRight className="size-4" /></Button></div></main></div>;
}
