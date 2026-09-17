"use client";

import { useEffect, useRef } from "react";

/**
 * Hero com expansão de mídia ao rolar (princípio do "scroll media expansion",
 * reimplementado de forma leve). A mídia começa levemente emoldurada e se
 * expande para full-bleed conforme a rolagem inicial avança.
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

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const startScale = isMobile ? 0.95 : 0.9;
    const maxRadius = isMobile ? 16 : 28;
    let ticking = false;

    const apply = () => {
      ticking = false;
      const vh = window.innerHeight;
      const top = section.getBoundingClientRect().top;
      // progresso: 0 no topo, 1 após ~55% da viewport rolada
      const p = Math.min(Math.max(-top / (vh * 0.55), 0), 1);
      const scale = startScale + (1 - startScale) * p;
      frame.style.transform = `scale(${scale.toFixed(4)})`;
      frame.style.borderRadius = `${(maxRadius * (1 - p)).toFixed(1)}px`;
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
    <section
      ref={sectionRef}
      className="relative isolate min-h-[72svh] sm:min-h-[80vh] lg:min-h-[88vh]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={frameRef}
          className="absolute inset-0 overflow-hidden will-change-transform"
          style={{ transform: "scale(0.9)", borderRadius: "28px" }}
        >
          {media}
        </div>
      </div>

      <div className="relative z-10 flex min-h-[72svh] items-end sm:min-h-[80vh] lg:min-h-[88vh]">
        {children}
      </div>
    </section>
  );
}
