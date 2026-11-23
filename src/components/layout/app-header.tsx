"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { HeaderSearch } from "./header-search";
import { MobileNav } from "./mobile-nav";

const menu = [
  { href: "/", label: "Início" },
  { href: "/loja", label: "Loja" },
  { href: "/ebooks", label: "PDFs e receitas" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/minha-area/biblioteca", label: "Minha biblioteca" },
  { href: "/minha-area/compras", label: "Meus pedidos" },
  { href: "/sobre", label: "Atendimento" },
];

function screenInfo(pathname: string) {
  if (pathname.startsWith("/minha-area/compras/")) return { title: "Meu pedido", back: "/minha-area/compras" };
  if (pathname.startsWith("/loja/")) return { title: "Produto", back: "/loja" };
  if (pathname.startsWith("/ebooks/")) return { title: "Conteúdo", back: "/ebooks" };
  if (pathname === "/checkout") return { title: "Pagamento", back: "/carrinho" };
  const titles: Record<string, string> = {
    "/loja": "Loja", "/ebooks": "Conteúdos", "/ofertas": "Ofertas",
    "/carrinho": "Carrinho", "/minha-area": "Minha MoveHaus",
    "/minha-area/biblioteca": "Biblioteca", "/minha-area/compras": "Compras",
    "/sobre": "Atendimento", "/termos": "Termos de uso", "/privacidade": "Privacidade",
  };
  return { title: titles[pathname] ?? "Loja oficial", back: undefined };
}

export function AppHeader() {
  const pathname = usePathname();
  const { title, back } = screenInfo(pathname);

  return (
    <header className="mh-app-header">
      {back && <Link href={back} className="mh-app-back" aria-label="Voltar"><ArrowLeft size={21} /></Link>}
      <Link href="/" className="mh-app-brand" aria-label="MoveHaus, início">
        <span className="mh-app-logo"><Image src="/brand/movehaus-logo.jpg" alt="" width={96} height={96} priority /></span>
        <span><strong>MoveHaus</strong><small>{title}</small></span>
      </Link>
      <div className="mh-app-header-actions">
        {pathname === "/"
          ? <Link href="/conta" className="mh-app-profile" aria-label="Minha conta" prefetch={false}><UserRound size={20} strokeWidth={1.6} /></Link>
          : <HeaderSearch tone="light" />}
        {!back && <MobileNav items={menu} tone="light" />}
      </div>
    </header>
  );
}
