import Link from "next/link";
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
// a cada acesso. A conta leva a /minha-area, que é protegida no servidor.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-2.5 py-2.5 sm:px-5 sm:py-3">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center gap-2 rounded-full border border-black/10 bg-mh-paper px-2.5 text-mh-paper-ink shadow-[0_14px_40px_-20px_rgba(0,0,0,.85)] sm:h-[60px] sm:gap-3 sm:px-4">
        <span className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-mh-red/70 to-transparent" aria-hidden="true" />
        {/* Marca e navegação formam uma única unidade visual. */}
        <div className="flex min-w-0 items-center gap-2 md:gap-6">
          <MobileNav items={NAV} tone="light" />
          <Logo priority size={42} />

          <span className="hidden h-6 w-px bg-black/12 md:block" aria-hidden="true" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-mh-paper-muted transition-colors duration-200 hover:bg-black/[0.055] hover:text-mh-paper-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Direita: ações */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <HeaderSearch tone="light" />
          <Link
            href="/minha-area"
            aria-label="Minha conta"
            className="grid size-10 place-items-center rounded-full text-mh-paper-ink transition-all duration-200 hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red active:scale-95"
          >
            <UserRound className="size-[22px]" strokeWidth={1.75} />
          </Link>
          <CartButton tone="light" />
        </div>
      </div>
    </header>
  );
}
