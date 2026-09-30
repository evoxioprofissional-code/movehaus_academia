"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function MobileNav({ items, tone = "dark" }: { items: { href: string; label: string }[]; tone?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu" className={cn("grid size-10 place-items-center transition-colors", tone === "light" ? "text-mh-paper-ink" : "text-white")}><Menu className="size-6" /></button>
      {open && <div className="fixed inset-0 z-[60]">
        <button aria-label="Fechar menu" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={close} />
        <nav className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm animate-[mh-slide-in_.26s_ease-out] flex-col border-r border-white/10 bg-[#090a0c] shadow-2xl">
          <div className="flex h-[68px] items-center justify-between px-5"><Logo size={58} className="[&_img]:rounded-none" /><button type="button" onClick={close} aria-label="Fechar menu" className="grid size-10 place-items-center text-white"><X className="size-6" /></button></div>
          <form action="/loja" onSubmit={close} className="mx-5 mb-3 flex items-center gap-2 border-b border-white/20 px-1"><Search className="size-4 shrink-0 text-mh-muted" /><input type="search" name="q" placeholder="Buscar produtos" aria-label="Buscar" className="h-12 w-full bg-transparent text-sm text-white placeholder:text-mh-muted focus:outline-none" /></form>
          <div className="flex-1 overflow-y-auto px-3 py-2">{items.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} onClick={close} className={cn("flex items-center justify-between px-4 py-4 text-lg font-medium transition-colors", active ? "text-white" : "text-white/70 hover:text-white")}>{item.label}<ArrowUpRight className={cn("size-5", active ? "text-mh-red" : "text-white/35")} /></Link>; })}</div>
          <div className="grid grid-cols-2 border-t border-white/10 p-3"><Link href="/minha-area" onClick={close} className="flex items-center justify-center gap-2 py-4 text-sm font-medium text-white"><UserRound className="size-5" />Minha conta</Link><Link href="/carrinho" onClick={close} className="flex items-center justify-center gap-2 border-l border-white/10 py-4 text-sm font-medium text-white"><ShoppingBag className="size-5" />Carrinho</Link></div>
        </nav>
      </div>}
    </div>
  );
}
