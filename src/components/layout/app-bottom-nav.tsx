"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

const tabs = [
  { href: "/", label: "Descobrir", icon: House },
  { href: "/loja", label: "Loja", icon: ShoppingBag },
  { href: "/ebooks", label: "Conteúdos", icon: BookOpen },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { href: "/conta", label: "Você", icon: UserRound },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <nav className="mh-app-tabs" aria-label="Navegação do aplicativo MoveHaus">
      <div>
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/"
            : href === "/conta" ? pathname.startsWith("/minha-area") || ["/login", "/cadastro", "/recuperar-senha", "/redefinir-senha", "/conta"].includes(pathname)
            : href === "/loja" ? pathname.startsWith("/loja") || pathname === "/ofertas"
            : href === "/carrinho" ? pathname === href || pathname === "/checkout"
            : pathname.startsWith(href);

          return (
            <Link key={href} href={href} prefetch={false} aria-current={active ? "page" : undefined}
              aria-label={href === "/carrinho" && ready && count > 0 ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}` : label}>
              <span className="mh-app-tab-icon">
                <Icon size={22} strokeWidth={active ? 1.9 : 1.6} aria-hidden="true" />
                {href === "/carrinho" && ready && count > 0 && <span className="mh-app-cart-count" aria-hidden="true">{count > 9 ? "9+" : count}</span>}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
