"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  BookOpenText,
  ExternalLink,
  Grid2x2,
  House,
  ImageIcon,
  LayoutGrid,
  LogOut,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import type { AdminNavCounts } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

type CountKey = "orders" | "stock" | "contents";
type NavItem = { href: string; label: string; short?: string; icon: LucideIcon; exact?: boolean; count?: CountKey };

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Vendas",
    items: [
      { href: "/admin", label: "Início", icon: House, exact: true },
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, count: "orders" },
      { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: Package, count: "stock" },
      { href: "/admin/conteudos", label: "PDFs e receitas", short: "PDFs", icon: BookOpenText, count: "contents" },
      { href: "/admin/categorias", label: "Categorias", icon: Tags },
      { href: "/admin/promocoes", label: "Cupons", icon: BadgePercent },
    ],
  },
  {
    title: "Loja",
    items: [
      { href: "/admin/home", label: "Vitrine", icon: Store },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

const ALL = GROUPS.flatMap((group) => group.items);
const TABS = ["/admin", "/admin/pedidos", "/admin/produtos", "/admin/conteudos"];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function countFor(key: CountKey | undefined, counts: AdminNavCounts) {
  if (key === "orders") return counts.ordersToHandle;
  if (key === "stock") return counts.lowStock + counts.outOfStock;
  if (key === "contents") return counts.draftContents;
  return 0;
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-2.5" aria-label="MoveHaus — início do painel">
      <span className="relative size-9 shrink-0 overflow-hidden rounded-[11px] bg-ad-ink">
        <Image src="/brand/movehaus-logo.jpg" alt="" fill sizes="36px" className="object-cover" priority />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[16px] font-bold tracking-[-0.03em] text-ad-ink">
            Move<span className="text-ad-red">Haus</span>
          </span>
          <span className="mt-1 block text-[11px] font-medium text-ad-muted">Painel da loja</span>
        </span>
      )}
    </Link>
  );
}

export function AdminShell({ children, adminName, counts }: { children: React.ReactNode; adminName: string; counts: AdminNavCounts }) {
  const pathname = usePathname();
  const router = useRouter();
  // A folha "Mais" fica aberta só na página em que foi aberta: navegar já fecha.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const moreOpen = openOn === pathname;
  const setMoreOpen = (open: boolean) => setOpenOn(open ? pathname : null);
  const searchRef = useRef<HTMLInputElement>(null);
  const firstName = adminName.split(" ")[0] || "Admin";
  const initials = adminName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";
  const current = ALL.find((item) => isActive(pathname, item));
  const moreActive = !!current && !TABS.includes(current.href);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setOpenOn(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = moreOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  return (
    <div className="admin-app min-h-dvh bg-ad-bg text-ad-ink">
      {/* ---------- Barra lateral (computador) ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[256px] flex-col border-r border-ad-line bg-white lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <Logo />
        </div>
        <nav className="admin-scrollbar flex-1 overflow-y-auto px-3 pb-4">
          {GROUPS.map((group) => (
            <div key={group.title} className="mt-4 first:mt-1">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ad-faint">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item);
                  const count = countFor(item.count, counts);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors",
                          active ? "bg-ad-ink text-white" : "text-ad-ink-2 hover:bg-ad-soft hover:text-ad-ink",
                        )}
                      >
                        <item.icon className={cn("size-[18px] shrink-0", active ? "text-white" : "text-ad-muted group-hover:text-ad-ink")} strokeWidth={1.9} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {count > 0 && (
                          <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums", active ? "bg-white/20 text-white" : "bg-ad-red text-white")}>
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-ad-line p-3">
          <Link href="/" target="_blank" className="flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-ad-ink-2 hover:bg-ad-soft">
            <ExternalLink className="size-[18px] text-ad-muted" strokeWidth={1.9} /> Ver loja
          </Link>
          <div className="mt-1 flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ad-red-soft text-[12px] font-bold text-ad-red">{initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-ad-ink">{adminName}</span>
              <span className="block text-[11.5px] text-ad-muted">Administrador</span>
            </span>
            <form action={signOut}>
              <button aria-label="Sair" title="Sair" className="grid size-9 place-items-center rounded-full text-ad-muted hover:bg-ad-soft hover:text-ad-ink">
                <LogOut className="size-[17px]" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[256px]">
        {/* ---------- Topo (computador) ---------- */}
        <header className="sticky top-0 z-30 hidden h-[72px] items-center gap-4 border-b border-ad-line bg-ad-bg/90 px-8 backdrop-blur-md lg:flex">
          <form
            className="relative w-full max-w-[420px]"
            onSubmit={(event) => {
              event.preventDefault();
              const q = String(new FormData(event.currentTarget).get("q") || "").trim();
              router.push(q ? `/admin/produtos?q=${encodeURIComponent(q)}` : "/admin/produtos");
            }}
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-ad-muted" />
            <input
              ref={searchRef}
              name="q"
              aria-label="Buscar produto"
              placeholder="Buscar produto por nome ou SKU"
              className="h-11 w-full rounded-full border-0 bg-white pl-10 pr-16 text-[14px] text-ad-ink shadow-[0_0_0_1px_rgb(32_37_34/0.08)] outline-none placeholder:text-ad-faint focus:shadow-[0_0_0_2px_rgb(32_37_34/0.25)]"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-ad-soft px-1.5 py-0.5 font-sans text-[11px] font-medium text-ad-muted">Ctrl K</kbd>
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-ad-ink-2 hover:bg-white">
              <ExternalLink className="size-4" /> Ver loja
            </Link>
            <Link href="/admin/produtos/novo" className="inline-flex h-11 items-center gap-2 rounded-full bg-ad-red px-5 text-[14px] font-semibold text-white transition-colors hover:bg-ad-red-hover">
              <Plus className="size-[18px]" strokeWidth={2.4} /> Novo produto
            </Link>
          </div>
        </header>

        {/* ---------- Topo (celular) ---------- */}
        <header className="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-ad-line/70 bg-ad-bg/90 px-4 backdrop-blur-md lg:hidden">
          <Logo compact />
          <p className="min-w-0 flex-1 truncate text-[16px] font-semibold tracking-[-0.01em]">{current?.label ?? "Painel"}</p>
          <Link href="/admin/produtos/novo" aria-label="Novo produto" className="grid size-10 place-items-center rounded-full bg-ad-red text-white active:scale-95">
            <Plus className="size-5" strokeWidth={2.4} />
          </Link>
          <button type="button" onClick={() => setMoreOpen(true)} aria-label={`Conta de ${firstName}`} className="grid size-10 place-items-center rounded-full bg-white text-[12px] font-bold text-ad-ink shadow-[0_0_0_1px_rgb(32_37_34/0.08)]">
            {initials}
          </button>
        </header>

        <main className="min-w-0">{children}</main>
      </div>

      {/* ---------- Abas inferiores (celular) ---------- */}
      <nav aria-label="Navegação do painel" className="fixed inset-x-0 bottom-0 z-40 border-t border-ad-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid h-[64px] max-w-[560px] grid-cols-5">
          {TABS.map((href) => {
            const item = ALL.find((entry) => entry.href === href)!;
            const active = isActive(pathname, item);
            const count = countFor(item.count, counts);
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? "page" : undefined} className="flex h-full flex-col items-center justify-center gap-1">
                  <span className={cn("relative grid h-8 w-14 place-items-center rounded-full transition-colors", active ? "bg-ad-ink text-white" : "text-ad-muted")}>
                    <item.icon className="size-[20px]" strokeWidth={active ? 2.2 : 1.9} />
                    {count > 0 && (
                      <span className="absolute -top-1 right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-ad-red px-1 text-[10px] font-bold leading-none text-white">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                  <span className={cn("text-[11px] font-medium", active ? "text-ad-ink" : "text-ad-muted")}>{item.short ?? item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setMoreOpen(true)} className="flex h-full w-full flex-col items-center justify-center gap-1">
              <span className={cn("grid h-8 w-14 place-items-center rounded-full", moreActive ? "bg-ad-ink text-white" : "text-ad-muted")}>
                <LayoutGrid className="size-[20px]" strokeWidth={1.9} />
              </span>
              <span className={cn("text-[11px] font-medium", moreActive ? "text-ad-ink" : "text-ad-muted")}>Mais</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ---------- Folha "Mais" (celular) ---------- */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mais opções">
          <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ad-ink/40 backdrop-blur-[2px]" onClick={() => setMoreOpen(false)} />
          <div className="admin-scrollbar absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-ad-bg px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-[0_-20px_50px_-20px_rgb(0_0_0/0.35)]">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#d6d4cd]" />
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_0_0_1px_rgb(32_37_34/0.06)]">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ad-red-soft text-[13px] font-bold text-ad-red">{initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{adminName}</span>
                <span className="block text-[12.5px] text-ad-muted">Administrador da loja</span>
              </span>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Fechar" className="grid size-10 place-items-center rounded-full bg-ad-soft text-ad-ink-2">
                <X className="size-5" />
              </button>
            </div>
            {GROUPS.map((group) => (
              <div key={group.title} className="mb-4">
                <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-ad-faint">{group.title}</p>
                <div className="grid grid-cols-3 gap-2">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item);
                    const count = countFor(item.count, counts);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-2xl p-2 text-center text-[12.5px] font-medium leading-tight transition-transform active:scale-[0.97]",
                          active ? "bg-ad-ink text-white" : "bg-white text-ad-ink shadow-[0_0_0_1px_rgb(32_37_34/0.06)]",
                        )}
                      >
                        <item.icon className={cn("size-[22px]", active ? "text-white" : "text-ad-ink-2")} strokeWidth={1.8} />
                        {item.label}
                        {count > 0 && <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ad-red px-1.5 text-[11px] font-bold text-white">{count}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" target="_blank" className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-[14px] font-semibold shadow-[0_0_0_1px_rgb(32_37_34/0.06)]">
                <Grid2x2 className="size-[18px]" /> Ver loja
              </Link>
              <form action={signOut}>
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[14px] font-semibold text-ad-red shadow-[0_0_0_1px_rgb(32_37_34/0.06)]">
                  <LogOut className="size-[18px]" /> Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
