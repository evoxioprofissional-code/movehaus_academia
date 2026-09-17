"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Entrada tipográfica discreta: palavras surgem com opacidade e leve
 * deslocamento vertical, em stagger curto, UMA vez. Sem máquina de escrever,
 * sem embaralhar, sem loop. Respeita prefers-reduced-motion.
 */
export function TextEffect({
  text,
  as: Tag = "span",
  className,
  trigger = "inView",
  stagger = 55,
  y = 14,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  trigger?: "mount" | "inView";
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => {
        setInstant(true);
        setPlay(true);
      });
      return () => cancelAnimationFrame(id);
    }
    if (trigger === "mount") {
      const id = requestAnimationFrame(() => setPlay(true));
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setPlay(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  const lines = text.split("\n");
  let wordIndex = 0;

  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.split(" ").map((word, wi) => {
            const i = wordIndex++;
            return (
              <span
                key={wi}
                className="inline-block whitespace-pre"
                style={{
                  opacity: play ? 1 : 0,
                  transform: play ? "none" : `translateY(${y}px)`,
                  transition: instant
                    ? "none"
                    : "opacity 520ms ease-out, transform 520ms ease-out",
                  transitionDelay: instant ? "0ms" : `${i * stagger}ms`,
                }}
              >
                {word}
                {wi < line.split(" ").length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
