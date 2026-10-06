"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BadgePercent, Bell, BookOpenText, ChartNoAxesColumnIncreasing, ChevronDown, Dumbbell, ExternalLink, Home, ImageIcon, LayoutDashboard, LogOut, Menu, Package, Search, Settings, ShoppingBag, Tags, Users, X } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const groups = [
  { title: "Geral", items: [{ href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true }] },
  { title: "Loja", items: [{ href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag }, { href: "/admin/produtos", label: "Produtos", icon: Package }, { href: "/admin/categorias", label: "Categorias", icon: Tags }, { href: "/admin/promocoes", label: "Cupons e promoções", icon: BadgePercent }] },
  { title: "Acompanhamento", items: [{ href: "/admin/acompanhamento", label: "Alunos e treinos", icon: Dumbbell }, { href: "/admin/conteudos", label: "Conteúdos", icon: BookOpenText }, { href: "/admin/clientes", label: "Clientes", icon: Users }] },
  { title: "Gestão", items: [{ href: "/admin/banners", label: "Banners", icon: ImageIcon }, { href: "/admin/home", label: "Página inicial", icon: Home }, { href: "/admin/configuracoes", label: "Configurações", icon: Settings }] },
];

const labels: Record<string, string> = { admin: "Visão geral", pedidos: "Pedidos", produtos: "Produtos", categorias: "Categorias", promocoes: "Cupons e promoções", acompanhamento: "Acompanhamento", conteudos: "Conteúdos", clientes: "Clientes", banners: "Banners", home: "Página inicial", configuracoes: "Configurações" };

export function AdminShell({ children, adminName }: { children: React.ReactNode; adminName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const parts = pathname.split("/").filter(Boolean);
  const workoutEditor = parts[0] === "admin" && parts[1] === "acompanhamento" && Boolean(parts[2]) && parts[3] === "treino";
  const studentId = workoutEditor ? parts[2] : "";
  const currentLabel = labels[parts[1] || "admin"] || "Administração";
  const initials = adminName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";
  const editorItems = [
    { href: "/admin", label: "Visão geral", icon: Home, exact: true },
    { href: "/admin/acompanhamento", label: "Alunos", icon: Users, exact: true },
    { href: pathname, label: "Treinos", icon: Dumbbell, exact: true },
    { href: "/equipe/aluno/" + studentId, label: "Evolução", icon: ChartNoAxesColumnIncreasing, exact: true },
  ];

  const nav = <>
    <div className="flex h-[60px] items-center justify-between border-b border-admin-border px-4"><Link href="/admin" className="text-[21px] font-bold tracking-[-0.04em] text-white">Move<span className="text-admin-red">Haus</span></Link><button type="button" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-md text-mh-muted lg:hidden" aria-label="Fechar menu"><X className="size-5" /></button></div>
    <nav className="admin-scrollbar flex-1 overflow-y-auto py-3">
      {workoutEditor ? <div className="space-y-1 px-2">{editorItems.map((item) => { const active = item.href === pathname; return <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className={cn("relative flex h-11 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors", active ? "bg-[#17191e] text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-admin-red" : "text-[#b5bac7] hover:bg-white/[0.035] hover:text-white")}><item.icon className="size-[17px] shrink-0" strokeWidth={1.8} /><span>{item.label}</span></Link>; })}</div> : groups.map((group) => <div key={group.title} className="mb-4"><p className="px-5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#747986]">{group.title}</p><div className="space-y-0.5">{group.items.map((item) => { const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className={cn("relative flex h-10 items-center gap-3 px-5 text-[13px] font-medium transition-colors", active ? "bg-[#621019] text-white before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-admin-red" : "text-[#b5bac7] hover:bg-white/[0.035] hover:text-white")}><item.icon className="size-[17px] shrink-0" strokeWidth={1.8} /><span className="truncate">{item.label}</span></Link>; })}</div></div>)}
    </nav>
    <div className="border-t border-admin-border p-3">{!workoutEditor && <Link href="/" target="_blank" className="flex h-10 items-center gap-3 rounded-md px-2 text-[13px] text-[#b5bac7] hover:bg-white/5 hover:text-white"><ExternalLink className="size-[17px]" /><span>Ver loja</span></Link>}<div className="mt-1 flex items-center gap-3 rounded-md px-2 py-2"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-admin-red text-xs font-semibold text-white">{initials}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{adminName}</p><p className="text-[11px] text-[#858b98]">{workoutEditor ? "Professor" : "Administrador"}</p></div><form action={signOut}><button aria-label="Sair" className="grid size-8 place-items-center rounded-md text-[#858b98] hover:bg-white/5 hover:text-white"><LogOut className="size-4" /></button></form></div></div>
  </>;

  return <div className="admin-app min-h-screen bg-admin-bg text-white"><aside className="fixed inset-y-0 left-0 z-50 hidden w-[214px] flex-col border-r border-admin-border bg-admin-sidebar lg:flex">{nav}</aside>{mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Fechar menu" className="absolute inset-0 bg-black/75" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[min(86vw,280px)] flex-col border-r border-admin-border bg-admin-sidebar">{nav}</aside></div>}<div className="lg:pl-[214px]">{workoutEditor ? <header className="flex h-[56px] items-center border-b border-admin-border bg-admin-bg px-3 lg:hidden"><button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center text-mh-muted" aria-label="Abrir menu"><Menu className="size-5" /></button><span className="ml-2 text-sm font-semibold">Montar treino</span></header> : <header className="sticky top-0 z-40 flex h-[60px] items-center border-b border-admin-border bg-admin-bg/95 px-4 backdrop-blur sm:px-6 lg:px-8"><button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-white lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button><div className="hidden items-center gap-2 text-[13px] lg:flex"><span className="text-[#858b98]">Administração</span><span className="text-[#555b67]">/</span><span className="font-medium text-white">{currentLabel}</span></div><div className="ml-auto flex items-center gap-3"><form action="/admin/produtos" className="relative hidden md:block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#949aa7]" /><input name="search" aria-label="Buscar produto" placeholder="Buscar produto" className="h-9 w-[270px] rounded-lg border border-admin-border bg-admin-card pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#777d8a] focus:border-admin-red" /></form><button type="button" aria-label="Notificações" className="grid size-9 place-items-center rounded-md text-[#b5bac7] hover:bg-white/5 hover:text-white"><Bell className="size-[18px]" /></button><div className="h-7 w-px bg-admin-border" /><span className="grid size-8 place-items-center rounded-full bg-admin-red text-[11px] font-semibold">{initials}</span><div className="hidden sm:block"><p className="max-w-36 truncate text-xs font-semibold">{adminName}</p><p className="text-[10px] text-[#858b98]">Administrador</p></div><ChevronDown className="hidden size-4 text-[#858b98] sm:block" /></div></header>}<main className="min-w-0">{children}</main></div></div>;
}
