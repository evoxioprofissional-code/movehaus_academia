"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";

/**
 * Prévia visual do leitor interno: barra de progresso e contador de capítulo
 * avançando devagar. Abstrato de propósito (linhas neutras) — não simula uma
 * interface de software real. Pausa fora da viewport e em reduced-motion.
 */
export function ReaderPreview({ chapters = 6 }: { chapters?: number }) {
  const total = Math.max(3, chapters);
  const ref = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(1);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setChapter(Math.ceil(total / 2)));
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setAnimate(entries[0]?.isIntersecting ?? false),
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [total]);

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => {
      setChapter((c) => (c >= total ? 1 : c + 1));
    }, 2200);
    return () => clearInterval(id);
  }, [animate, total]);

  const progress = Math.round((chapter / total) * 100);

  return (
    <div
      ref={ref}
      className="rounded-lg border border-white/10 bg-mh-ink/70 p-4 backdrop-blur"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-white">
          <BookOpen className="size-3.5 text-mh-red" />
          Leitor interno
        </span>
        <span className="tabular-nums text-mh-muted">
          Capítulo {chapter} de {total}
        </span>
      </div>

      {/* Linhas neutras (representam o texto, sem conteúdo falso) */}
      <div key={chapter} className="mt-4 space-y-2">
        <span className="block h-2 w-11/12 rounded-full bg-white/12" />
        <span className="block h-2 w-full rounded-full bg-white/10" />
        <span className="block h-2 w-9/12 rounded-full bg-white/10" />
      </div>

      {/* Progresso */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-mh-red transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
