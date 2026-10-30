"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, ShoppingBag, Dumbbell, House, MapPin } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";

const memberLinks = [
  { href: "/minha-area", label: "Início" },
  { href: "/acompanhamento", label: "Treino" },
  { href: "/minha-area/biblioteca", label: "Biblioteca" },
  { href: "/minha-area/compras", label: "Compras" },
  { href: "/minha-area#perfil", label: "Perfil" },
];

function MemberWordmark({ size = "normal" }: { size?: "normal" | "small" }) {
  return (
    <Link
      href="/minha-area"
      aria-label="MoveHaus — Minha área"
      className={`relative block shrink-0 overflow-hidden ${size === "small" ? "h-8 w-[78px]" : "h-10 w-[98px]"}`}
    >
      <Image
        src="/brand/movehaus-logo.jpg"
        alt="MoveHaus"
        width={160}
        height={160}
        priority
        className={`absolute left-0 max-w-none ${size === "small" ? "-top-[20px] h-[78px] w-[78px]" : "-top-[25px] h-[98px] w-[98px]"}`}
      />
    </Link>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/minha-area", label: "Início", icon: House, active: true },
    { href: "/acompanhamento", label: "Treino", icon: Dumbbell, active: false },
    { href: "/minha-area/biblioteca", label: "Biblioteca", icon: BookOpen, active: false },
    { href: "/minha-area/compras", label: "Compras", icon: ShoppingBag, active: false },
  ];

  return (
    <nav aria-label="Navegação da minha área" className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0c0d10]/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-14px_35px_rgba(0,0,0,.45)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== "/minha-area" && pathname.startsWith(href + "/")); return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red ${active ? "text-white" : "text-white/55 hover:text-white"}`}
          >
            <Icon className={`size-[21px] ${active ? "text-mh-red" : ""}`} strokeWidth={1.8} />
            {label}
            {active && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full bg-mh-red" aria-hidden="true" />}
          </Link>
        ); })}
      </div>
    </nav>
  );
}

export function MemberShell({
  children,
  initials,
  city,
  helpHref,
}: {
  children: React.ReactNode;
  initials: string;
  city: string;
  helpHref: string;
}) {
  const pathname = usePathname();

  // O leitor possui navegação própria e precisa de toda a altura da tela.
  if (pathname.startsWith("/minha-area/ler/")) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col bg-[#08090b] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#08090b]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-3 px-4 sm:px-6">
          <MobileNav items={memberLinks} mode="member" />
          <MemberWordmark />
          <nav aria-label="Minha área" className="ml-7 hidden items-center gap-7 text-sm text-white/65 md:flex">
            <Link href="/minha-area" aria-current={pathname === "/minha-area" ? "page" : undefined} className="hover:text-white">Início</Link>
            <Link href="/acompanhamento" className="hover:text-white">Treino</Link>
            <Link href="/minha-area/biblioteca" aria-current={pathname.startsWith("/minha-area/biblioteca") ? "page" : undefined} className={pathname.startsWith("/minha-area/biblioteca") ? "font-semibold text-white" : "hover:text-white"}>Biblioteca</Link>
            <Link href="/minha-area/compras" aria-current={pathname.startsWith("/minha-area/compras") ? "page" : undefined} className={pathname.startsWith("/minha-area/compras") ? "font-semibold text-white" : "hover:text-white"}>Compras</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <Link href="/loja" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red">
              Loja <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/minha-area#perfil" aria-label="Ir para meu perfil" className="grid size-10 place-items-center rounded-full border border-white/35 bg-[#252932] text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red">
              {initials}
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 pb-24 md:pb-0">{children}</main>

      <footer className="border-t border-white/10 bg-[#08090b] pb-20 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm text-white/55 sm:px-6 md:flex-row md:items-center md:justify-between">
          <MemberWordmark size="small" />
          <nav aria-label="Links da MoveHaus" className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link href="/loja" className="hover:text-white">Loja</Link><span aria-hidden="true">·</span>
            <Link href="/ebooks" className="hover:text-white">Conteúdos</Link><span aria-hidden="true">·</span>
            <a href={helpHref} target={helpHref.startsWith("http") ? "_blank" : undefined} rel={helpHref.startsWith("http") ? "noopener noreferrer" : undefined} className="hover:text-white">Ajuda</a>
          </nav>
          <p className="flex items-center gap-2"><MapPin className="size-4" />{city || "Colômbia, SP"}</p>
          <nav aria-label="Informações legais" className="flex items-center gap-3">
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link><span aria-hidden="true">·</span>
            <Link href="/termos" className="hover:text-white">Termos</Link>
          </nav>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
