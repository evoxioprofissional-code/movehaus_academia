import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createReward, decideRedemption, deleteReward, toggleReward } from "@/lib/coaching/gamification-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Recompensas | MoveHaus Admin" };
const inputCls = "h-10 w-full rounded border border-white/10 bg-[#0d0d0f] px-3 text-sm text-white focus:border-mh-red focus:outline-none";

export default async function AdminRecompensasPage() {
  const supabase = await createClient();
  const [{ data: rewards }, { data: pending }] = await Promise.all([
    supabase.from("rewards").select("*").order("created_at", { ascending: false }),
    supabase
      .from("reward_redemptions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  const ids = [...new Set((pending ?? []).map((r) => r.user_id))];
  const { data: profs } = ids.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
  const nameById = new Map((profs ?? []).map((p) => [p.id, p.full_name || p.email || "Aluno"]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </Link>
      <AdminPageHeader title="Recompensas" description="Configure a loja de pontos e aprove os resgates dos alunos." />

      {/* Resgates pendentes */}
      <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-widest text-mh-muted">
        Resgates pendentes ({pending?.length ?? 0})
      </h2>
      {(pending ?? []).length === 0 ? (
        <p className="text-sm text-mh-muted">Nenhum resgate aguardando aprovação.</p>
      ) : (
        <div className="space-y-2">
          {(pending ?? []).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mh-surface p-4">
              <div>
                <p className="font-medium text-white">{r.reward_title}</p>
                <p className="text-xs text-mh-muted">{nameById.get(r.user_id)} · {r.points_spent} pts</p>
              </div>
              <div className="flex items-center gap-2">
                {(["approve", "reject"] as const).map((decision) => (
                  <form key={decision} action={decideRedemption}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decision" value={decision} />
                    <input type="hidden" name="user_id" value={r.user_id} />
                    <input type="hidden" name="points" value={r.points_spent} />
                    <Button type="submit" size="sm" variant={decision === "approve" ? "primary" : "outline"}>
                      {decision === "approve" ? "Aprovar" : "Recusar"}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catálogo */}
      <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-widest text-mh-muted">
        Catálogo de recompensas
      </h2>
      <form action={createReward} className="grid gap-3 rounded-lg bg-mh-surface p-4 sm:grid-cols-[1fr_130px_140px_auto]">
        <div>
          <label className="mb-1 block text-xs text-mh-muted">Nome</label>
          <input name="title" required placeholder="Ex.: 10% na loja" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-mh-muted">Custo (pts)</label>
          <input name="cost_points" type="number" min="0" defaultValue={100} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-mh-muted">Tipo</label>
          <select name="type" className={inputCls} defaultValue="discount">
            <option value="discount">Desconto</option>
            <option value="product">Produto/brinde</option>
            <option value="content">Conteúdo</option>
            <option value="other">Outro</option>
          </select>
        </div>
        <div className="flex items-end"><Button type="submit">Adicionar</Button></div>
        <input name="description" placeholder="Descrição (opcional)" className={`${inputCls} sm:col-span-4`} />
      </form>

      <div className="mt-4 space-y-2">
        {(rewards ?? []).map((rw) => (
          <div key={rw.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mh-surface p-4">
            <div>
              <p className="font-medium text-white">{rw.title} <span className="text-mh-muted">· {rw.cost_points} pts</span></p>
              {rw.description && <p className="text-xs text-mh-muted">{rw.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={rw.active ? "success" : "muted"}>{rw.active ? "Ativa" : "Inativa"}</Badge>
              <form action={toggleReward}>
                <input type="hidden" name="id" value={rw.id} />
                <input type="hidden" name="active" value={String(!rw.active)} />
                <Button type="submit" variant="outline" size="sm">{rw.active ? "Desativar" : "Ativar"}</Button>
              </form>
              <form action={deleteReward}>
                <input type="hidden" name="id" value={rw.id} />
                <button type="submit" aria-label="Excluir" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
        {(rewards ?? []).length === 0 && <p className="text-sm text-mh-muted">Nenhuma recompensa cadastrada.</p>}
      </div>
    </div>
  );
}
