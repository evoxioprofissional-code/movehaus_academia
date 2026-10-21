"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";

export function MobileNav({
  items,
  tone = "dark",
}: {
  items: { href: string; label: string }[];
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const drawer = open && typeof document !== "undefined"
    ? createPortal(
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
        >
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
            onClick={close}
          />
          <nav className="absolute inset-y-0 left-0 flex h-dvh w-[min(88vw,22rem)] animate-[mh-slide-in_.26s_ease-out] flex-col overflow-hidden border-r border-white/10 bg-[#08090b] shadow-[24px_0_70px_rgba(0,0,0,.7)]">
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <Logo size={42} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Fechar menu"
                className="grid size-10 place-items-center rounded-full text-mh-muted transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              action="/loja"
              onSubmit={close}
              className="mx-4 mt-4 flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-3"
            >
              <Search className="size-4 shrink-0 text-mh-muted" />
              <input
                type="search"
                name="q"
                placeholder="Buscar na MoveHaus"
                aria-label="Buscar"
                className="h-12 w-full bg-transparent text-sm text-white placeholder:text-mh-muted focus:outline-none"
              />
            </form>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red",
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-white/75 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    {item.label}
                    <ArrowUpRight className={cn("size-4", active ? "text-mh-red" : "text-white/35")} />
                  </Link>
                );
              })}
            </div>

            <div className="shrink-0 space-y-1 border-t border-white/[0.08] px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3">
              <Link
                href="/conta"
                onClick={close}
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <UserRound className="size-5 text-white/45" />
                Minha conta
              </Link>
              <Link
                href="/carrinho"
                onClick={close}
                className="flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <ShoppingBag className="size-5 text-white/45" />
                Carrinho
              </Link>
              <a
                href={whatsappLink("Olá! Vim pela loja da MoveHaus.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                <MessageCircle className="size-5" />
                Falar no WhatsApp
              </a>
            </div>
          </nav>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className={`-ml-1 grid size-10 place-items-center rounded-full transition-all active:scale-95 ${tone === "light" ? "text-mh-paper-ink hover:bg-black/[0.06]" : "text-mh-text hover:bg-white/5 hover:text-white"}`}
      >
        <Menu className="size-6" />
      </button>

      {drawer}
    </div>
  );
}
