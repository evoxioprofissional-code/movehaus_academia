"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgePercent,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/conteudos", label: "Conteúdos", icon: BookOpenText },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/promocoes", label: "Cupons e promoções", icon: BadgePercent },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <div className={cn("overflow-hidden", collapsed && "lg:hidden")}>
          <Logo className="h-9 w-auto" />
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden size-9 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-white lg:grid"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="grid size-9 place-items-center rounded-md text-mh-muted lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {sections.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-mh-red text-white"
                  : "text-mh-muted hover:bg-white/5 hover:text-white",
                collapsed && "lg:justify-center lg:px-0",
              )}
            >
              <item.icon className="size-[18px] shrink-0" />
              <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/8 p-3">
        <Link
          href="/"
          target="_blank"
          className={cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm text-mh-muted hover:bg-white/5 hover:text-white", collapsed && "lg:justify-center lg:px-0")}
        >
          <ExternalLink className="size-[18px] shrink-0" />
          <span className={cn(collapsed && "lg:hidden")}>Ver loja</span>
        </Link>
        <form action={signOut}>
          <button className={cn("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-mh-muted hover:bg-white/5 hover:text-white", collapsed && "lg:justify-center lg:px-0")}>
            <LogOut className="size-[18px] shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Sair</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">
      <aside className={cn("fixed inset-y-0 left-0 z-50 hidden border-r border-white/8 bg-[#111113] transition-[width] duration-200 lg:flex lg:flex-col", collapsed ? "w-[72px]" : "w-60")}>{nav}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Fechar menu" className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(86vw,288px)] flex-col bg-[#111113] shadow-2xl">{nav}</aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-60")}>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/8 bg-[#0d0d0f]/95 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-white lg:hidden" aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <div className="hidden text-sm text-mh-muted lg:block">Administração MoveHaus</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-full bg-mh-red/15 text-xs font-semibold text-mh-red-soft">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="max-w-40 truncate text-sm font-medium text-white">{adminName}</p>
              <p className="text-xs text-mh-muted">Administrador</p>
            </div>
          </div>
        </header>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
