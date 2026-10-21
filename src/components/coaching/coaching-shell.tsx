"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Dumbbell, House, UserRound } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";

const menuItems = [
  { href: "/minha-area", label: "Minha área" },
  { href: "/acompanhamento", label: "Treino" },
  { href: "/acompanhamento/corpo", label: "Evolução" },
  { href: "/acompanhamento/nutricao", label: "Nutrição" },
  { href: "/minha-area#perfil", label: "Perfil" },
];

const tabs = [
  { href: "/minha-area", label: "Início", icon: House },
  { href: "/acompanhamento", label: "Treino", icon: Dumbbell },
  { href: "/acompanhamento/corpo", label: "Evolução", icon: BarChart3 },
  { href: "/minha-area#perfil", label: "Perfil", icon: UserRound },
];

export function CoachingShell({ children, initial }: { children: React.ReactNode; initial: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#08090b] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#08090b]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/acompanhamento" aria-label="MoveHaus — treino" className="text-[23px] font-bold tracking-[-0.065em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red">
            Move<span className="text-mh-red">Haus</span>
          </Link>
          <nav aria-label="Acompanhamento" className="hidden items-center gap-6 text-sm text-white/65 md:flex">
            <Link href="/acompanhamento" className="hover:text-white">Treino</Link>
            <Link href="/acompanhamento/corpo" className="hover:text-white">Evolução</Link>
            <Link href="/acompanhamento/nutricao" className="hover:text-white">Nutrição</Link>
          </nav>
          <div className="flex items-center gap-2">
            <MobileNav items={menuItems} mode="member" />
            <Link href="/minha-area#perfil" aria-label="Meu perfil" className="grid size-10 place-items-center rounded-full bg-[#282b32] text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red">
              {initial}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl pb-28">{children}</main>

      <nav aria-label="Navegação do aluno" className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-3xl border-t border-white/10 bg-[#0c0d10]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="grid grid-cols-4 px-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = label === "Treino"
              ? pathname === "/acompanhamento" || pathname.startsWith("/acompanhamento/treino/")
              : label === "Evolução" && pathname === "/acompanhamento/corpo";
            return (
              <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`relative flex min-h-17 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red ${active ? "text-mh-red" : "text-white/55 hover:text-white"}`}>
                <Icon className="size-[21px]" strokeWidth={1.8} aria-hidden="true" />
                {label}
                {active && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full bg-mh-red" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
