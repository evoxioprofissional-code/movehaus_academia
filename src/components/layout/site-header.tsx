"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { HeaderSearch } from "@/components/layout/header-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/loja", label: "Loja" },
  { href: "/ebooks", label: "Conteúdos" },
  { href: "/sobre", label: "O clube" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const onHome = pathname === "/";

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
    return () => { window.removeEventListener("scroll", update); if (frame) cancelAnimationFrame(frame); };
  }, []);

  return (
    <header className={cn(onHome ? "absolute" : "sticky", "inset-x-0 top-0 z-40 border-b transition-colors duration-200", scrolled || !onHome ? "border-white/10 bg-[#090a0c]/95 backdrop-blur" : "border-transparent bg-transparent")}>
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-8">
          <MobileNav items={NAV} />
          <Logo priority size={58} className="[&_img]:rounded-none" />
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return <Link key={item.href} href={item.href} className={cn("relative py-2 text-[13px] font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red", active ? "text-white" : "text-white/72")}>{item.label}{active && <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-mh-red" />}</Link>;
            })}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <HeaderSearch />
          <Link href="/minha-area" aria-label="Minha conta" className="grid size-10 place-items-center text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"><UserRound className="size-5" strokeWidth={1.8} /></Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
