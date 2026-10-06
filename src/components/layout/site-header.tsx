"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { MobileNav } from "@/components/layout/mobile-nav";

export const NAV = [
  { href: "/loja", label: "Loja" },
  { href: "/ebooks", label: "Conteúdos" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/sobre", label: "Sobre a MoveHaus" },
];

// Sem getUser aqui: o header é público e não deve depender do serviço de auth
// a cada acesso. /conta resolve o destino sem bloquear o primeiro feedback.
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = window.scrollY > 24;
        if (next !== scrolledRef.current) {
          scrolledRef.current = next;
          setScrolled(next);
        }
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-40 px-2.5 transition-[padding] duration-300 sm:px-5 ${scrolled ? "py-1.5 sm:py-2" : "py-2.5 sm:py-3"}`}>
      <div className={`relative mx-auto flex max-w-5xl animate-[mh-navbar-enter_.45s_ease-out_both] items-center gap-2 rounded-full border px-2.5 text-white transition-[height,background-color,border-color,box-shadow] duration-300 sm:gap-3 sm:px-4 sm:backdrop-blur-xl ${scrolled ? "h-12 border-white/10 bg-black/85 shadow-[0_12px_38px_-18px_rgba(0,0,0,.9)] sm:h-13 sm:bg-black/75" : "h-14 border-white/[0.07] bg-black/60 shadow-none sm:h-[58px] sm:bg-black/35"}`}>
        <span className={`absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-mh-red to-transparent transition-opacity duration-300 ${scrolled ? "opacity-70" : "opacity-35"}`} aria-hidden="true" />
        {/* Marca e navegação formam uma única unidade visual. */}
        <div className="flex min-w-0 items-center gap-2 md:gap-6">
          <MobileNav items={NAV} />
          <Logo priority size={42} />

          <span className="hidden h-6 w-px bg-white/12 md:block" aria-hidden="true" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red ${active ? "text-white" : "text-white/62"}`}
                >
                  {item.label}
                  <span className={`absolute inset-x-3.5 -bottom-px h-0.5 origin-left bg-mh-red transition-transform duration-200 ${active ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Direita: ações */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <HeaderSearch />
          <Link
            href="/conta"
            aria-label="Minha conta"
            className="grid size-10 place-items-center rounded-full text-white/85 transition-all duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red active:scale-95"
          >
            <UserRound className="size-[22px]" strokeWidth={1.75} />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
