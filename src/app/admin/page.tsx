import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Package,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import { dashboardStats } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Painel administrativo" };

export default async function AdminDashboardPage() {
  const s = await dashboardStats();

  const cards = [
    { label: "Produtos ativos", value: `${s.activeProducts}/${s.products}`, icon: Package, href: "/admin/produtos" },
    { label: "Conteúdos (e-books)", value: s.ebooks, icon: BookOpen, href: "/admin/conteudos" },
    { label: "Categorias", value: s.categories, icon: Tag, href: "/admin/categorias" },
    { label: "Clientes", value: s.customers, icon: Users, href: "/admin/clientes" },
    { label: "Estoque baixo (≤5)", value: s.lowStock, icon: AlertTriangle, href: "/admin/produtos", warn: s.lowStock > 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Visão geral
      </h1>
      <p className="mt-1 text-mh-muted">Resumo da loja MoveHaus.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-white/10 bg-mh-surface p-5 transition-colors hover:border-white/25"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-mh-muted">{c.label}</span>
              <c.icon
                className={c.warn ? "size-5 text-mh-red" : "size-5 text-mh-muted"}
              />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-white">
              {c.value}
            </p>
          </Link>
        ))}

        {/* Vendas/pedidos entram na Fase 5 (pagamentos) */}
        <div className="rounded-lg border border-dashed border-white/10 bg-mh-surface/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-mh-muted">Vendas e pedidos</span>
            <ShoppingCart className="size-5 text-mh-muted" />
          </div>
          <p className="mt-3 text-sm text-mh-muted">
            Faturamento, pedidos e assinaturas aparecem aqui após a integração de
            pagamentos (Fase 5).
          </p>
        </div>
      </div>
    </div>
  );
}
