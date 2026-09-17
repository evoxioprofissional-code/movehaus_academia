import Link from "next/link";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getUser } from "@/lib/auth/user";

export const NAV = [
  { href: "/loja", label: "Loja" },
  { href: "/ebooks", label: "Conteúdos" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/sobre", label: "Sobre a MoveHaus" },
];

export async function SiteHeader() {
  const user = await getUser();
  const authed = !!user;
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-mh-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        {/* Esquerda: menu mobile + logo */}
        <div className="flex items-center gap-2">
          <MobileNav items={NAV} authed={authed} />
          <Logo priority size={44} />
        </div>

        {/* Centro: navegação (desktop) */}
        <nav className="mx-auto hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-mh-muted transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Direita: ações */}
        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <HeaderSearch />
          <Link
            href={authed ? "/minha-area" : "/login"}
            aria-label={authed ? "Minha conta" : "Entrar"}
            className="grid size-10 place-items-center rounded-full text-mh-text transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"
          >
            <UserRound className="size-[22px]" strokeWidth={1.75} />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
