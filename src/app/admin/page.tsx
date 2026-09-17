import type { Metadata } from "next";
import {
  BookOpen,
  LayoutGrid,
  Package,
  Settings,
  Tag,
  Users,
} from "lucide-react";

export const metadata: Metadata = { title: "Painel administrativo" };

const SECTIONS = [
  { icon: Package, title: "Produtos", desc: "Físicos, digitais e e-books." },
  { icon: BookOpen, title: "Conteúdos", desc: "E-books e capítulos." },
  { icon: LayoutGrid, title: "Pedidos", desc: "Status de pagamento e entrega." },
  { icon: Users, title: "Clientes", desc: "Histórico e contato." },
  { icon: Tag, title: "Promoções", desc: "Cupons e campanhas." },
  { icon: Settings, title: "Configurações", desc: "Dados da academia e regras." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Painel administrativo
      </h1>
      <p className="mt-1 text-mh-muted">
        Área protegida — visível apenas para administradores.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="rounded-lg border border-white/10 bg-mh-surface p-5"
          >
            <s.icon className="size-5 text-mh-red" />
            <h2 className="mt-3 text-base font-semibold text-white">{s.title}</h2>
            <p className="mt-1 text-sm text-mh-muted">{s.desc}</p>
            <p className="mt-3 text-xs text-mh-muted">Em construção (Fase 4).</p>
          </div>
        ))}
      </div>
    </div>
  );
}
