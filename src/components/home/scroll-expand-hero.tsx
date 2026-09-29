"use client";

import { useEffect, useRef } from "react";

/**
 * Hero editorial responsivo. No desktop a mídia ocupa uma coluna própria e
 * recebe uma expansão curta ao rolar. No celular não há transformação: o
 * conteúdo empilha naturalmente, evitando cortes e sobreposição.
 *
 * - Sem biblioteca de animação; usa um listener de scroll com rAF.
 * - Atualiza o estilo via ref (não re-renderiza a cada scroll).
 * - Simplifica no mobile e respeita prefers-reduced-motion.
 * - `media` é renderizada no servidor e passada como prop (next/image fica RSC).
 */
export function ScrollExpandHero({
  media,
  children,
}: {
  media: React.ReactNode;
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const section = sectionRef.current;
    if (!frame || !section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      frame.style.transform = "scale(1)";
      frame.style.borderRadius = "0px";
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      frame.style.transform = "scale(1)";
      return;
    }
    const startScale = 0.965;
    let ticking = false;

    const apply = () => {
      ticking = false;
      const vh = window.innerHeight;
      const top = section.getBoundingClientRect().top;
      const p = Math.min(Math.max(-top / (vh * 0.65), 0), 1);
      const scale = startScale + (1 - startScale) * p;
      frame.style.transform = `scale(${scale.toFixed(4)})`;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden bg-mh-black">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-7 px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 md:min-h-[38rem] md:grid-cols-2 md:items-center md:gap-10 lg:min-h-[42rem] lg:gap-14 lg:py-12">
        <div
          ref={frameRef}
          className="relative order-1 aspect-[16/10] min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-mh-surface shadow-mh will-change-transform md:order-2 md:aspect-[4/3] md:max-h-[34rem] lg:rounded-[1.75rem]"
          style={{ transform: "scale(0.965)" }}
        >
          {media}
        </div>
        <div className="relative z-10 order-2 flex min-w-0 items-center md:order-1">
          {children}
        </div>
      </div>
    </section>
  );
}
