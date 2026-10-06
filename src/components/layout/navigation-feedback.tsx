"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Mostra resposta imediata ao toque enquanto o Next prepara a próxima rota.
 * Isso é especialmente útil antes de rotas protegidas, cuja sessão precisa ser
 * validada no servidor antes da troca de tela.
 */
export function NavigationFeedback() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPending(false));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const begin = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.href === window.location.href) return;
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      setPending(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(false), 10_000);
    };

    document.addEventListener("click", begin, true);
    return () => {
      document.removeEventListener("click", begin, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!pending) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-white/5"
      role="progressbar"
      aria-label="Abrindo página"
    >
      <span className="block h-full w-1/3 animate-[mh-route-loading_1s_ease-in-out_infinite] bg-mh-red" />
    </div>
  );
}
