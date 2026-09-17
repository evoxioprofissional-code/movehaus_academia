"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

/** Busca do cabeçalho: um ícone que revela um campo (submete para /loja). */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Buscar"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-full text-mh-text transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"
      >
        {open ? (
          <X className="size-[22px]" strokeWidth={1.75} />
        ) : (
          <Search className="size-[22px]" strokeWidth={1.75} />
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-mh-border bg-mh-black/95 backdrop-blur">
          <form
            action="/loja"
            className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6"
            onSubmit={() => setOpen(false)}
          >
            <Search className="size-5 shrink-0 text-mh-muted" />
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Buscar produtos, programas e conteúdos..."
              aria-label="Buscar"
              className="h-9 w-full bg-transparent text-[15px] text-white placeholder:text-mh-muted focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-mh bg-mh-red px-4 py-1.5 text-sm font-medium text-white hover:bg-mh-red-hover"
            >
              Buscar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
