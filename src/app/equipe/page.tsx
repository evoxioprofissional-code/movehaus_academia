import Link from "next/link";
import { AlertTriangle, Dumbbell, MessageCircle, Users } from "lucide-react";
import { getStaffOverview } from "@/lib/coaching/staff";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Equipe | MoveHaus" };

function waLink(phone: string | null, name: string) {
  const d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  const num = d.length <= 11 ? `55${d}` : d;
  return `https://wa.me/${num}?text=${encodeURIComponent(`Olá, ${name.split(" ")[0]}! Aqui é da MoveHaus. Senti sua falta nos treinos, bora voltar?`)}`;
}

export default async function EquipePage() {
  const o = await getStaffOverview();
  const fmt = (d: string | null) => (d ? new Intl.DateTimeFormat("pt-BR").format(new Date(d)) : "nunca");

  const cards = [
    { label: "Alunos ativos", value: o.total, icon: Users },
    { label: "Engajados (7 dias)", value: o.engaged, icon: Dumbbell },
    { label: "Desengajados", value: o.disengaged, icon: AlertTriangle, warn: o.disengaged > 0 },
    { label: "Treinos na semana", value: o.weekWorkouts, icon: Dumbbell },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Painel da equipe</h1>
      <p className="mt-1 text-mh-muted">Acompanhe seus alunos e quem precisa de atenção.</p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-white/10 bg-mh-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-mh-muted">{c.label}</span>
              <c.icon className={c.warn ? "size-4 text-amber-400" : "size-4 text-mh-muted"} />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{c.value}</p>
          </div>
        ))}
      </section>

      {o.total === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Users} title="Nenhum aluno com acesso" description="Libere o acesso à área de acompanhamento no painel admin." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-mh-surface text-left text-xs uppercase tracking-wide text-mh-muted">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Último treino</th>
                <th className="px-4 py-3">Na semana</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {o.members.map((m) => {
                const wa = waLink(m.whatsapp, m.name);
                return (
                  <tr key={m.id} className="hover:bg-mh-surface/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{m.name}</div>
                      <div className="text-xs text-mh-muted">{m.email}</div>
                    </td>
                    <td className="px-4 py-3 text-mh-muted">{fmt(m.lastSession)}</td>
                    <td className="px-4 py-3 tabular-nums text-white">{m.weekWorkouts}</td>
                    <td className="px-4 py-3">
                      {m.engaged ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">Em dia</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
                          <AlertTriangle className="size-3" /> Sumido
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {wa && !m.engaged && (
                          <a href={wa} target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded text-emerald-400 hover:bg-emerald-500/10" aria-label="Chamar no WhatsApp">
                            <MessageCircle className="size-4" />
                          </a>
                        )}
                        <Link href={`/equipe/aluno/${m.id}`} className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-mh-text hover:bg-white/5 hover:text-white">
                          Ver aluno
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
