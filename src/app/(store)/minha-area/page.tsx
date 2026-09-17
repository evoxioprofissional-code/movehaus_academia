import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, LogOut, Package, RefreshCw } from "lucide-react";
import { requireUser, getProfile } from "@/lib/auth/user";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Minha área" };

export default async function MinhaAreaPage() {
  const user = await requireUser("/minha-area");
  const profile = await getProfile();
  const displayName = profile?.full_name || user.email || "Atleta";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
            Minha MoveHaus
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-mh-muted">
            Acompanhe suas compras, assinaturas e conteúdos liberados.
          </p>
        </div>
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="size-4" />
            Sair
          </Button>
        </form>
      </div>

      {/* Atalhos (conteúdo completo na Fase 6) */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, title: "Biblioteca", desc: "Seus conteúdos liberados." },
          { icon: Package, title: "Pedidos", desc: "Acompanhe suas compras." },
          { icon: RefreshCw, title: "Assinaturas", desc: "Gerencie seus planos." },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-white/10 bg-mh-surface p-5"
          >
            <item.icon className="size-5 text-mh-red" />
            <h2 className="mt-3 text-base font-semibold text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-mh-muted">{item.desc}</p>
            <p className="mt-3 text-xs text-mh-muted">Em breve nesta área.</p>
          </div>
        ))}
      </div>

      {/* Dados da conta */}
      <div className="mt-8 rounded-lg border border-white/10 bg-mh-surface p-6">
        <h2 className="text-lg font-semibold text-white">Seus dados</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-widest text-mh-muted">Nome</dt>
            <dd className="mt-1 text-sm text-white">
              {profile?.full_name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-mh-muted">E-mail</dt>
            <dd className="mt-1 text-sm text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-mh-muted">WhatsApp</dt>
            <dd className="mt-1 text-sm text-white">{profile?.whatsapp || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/loja">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}
