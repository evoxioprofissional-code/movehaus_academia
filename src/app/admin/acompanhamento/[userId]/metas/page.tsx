import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProgress } from "@/lib/coaching/gamification";
import { createGoal, deleteGoal, markGoalAchieved } from "@/lib/coaching/gamification-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Metas | MoveHaus Admin" };

const inputCls = "h-10 w-full rounded border border-white/10 bg-[#0d0d0f] px-3 text-sm text-white focus:border-mh-red focus:outline-none";
const TYPE_LABEL: Record<string, string> = {
  frequency_week: "Treinos por semana",
  total_workouts: "Total de treinos",
  custom: "Personalizada",
};

export default async function AdminMetasPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const [{ data: profile }, progress] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    getProgress(userId),
  ]);
  const who = profile?.full_name || profile?.email || "Aluno";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </Link>
      <AdminPageHeader title={`Metas de ${who}`} description={`${progress.points} pontos acumulados. Metas por semana e por total são calculadas pelos treinos.`} />

      <form action={createGoal} className="mt-5 grid gap-3 rounded-lg bg-mh-surface p-4 sm:grid-cols-[1fr_180px_100px_auto]">
        <input type="hidden" name="user_id" value={userId} />
        <div>
          <label className="mb-1 block text-xs text-mh-muted">Meta</label>
          <input name="title" required placeholder="Ex.: Treinar 4x na semana" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-mh-muted">Tipo</label>
          <select name="type" className={inputCls} defaultValue="frequency_week">
            <option value="frequency_week">Treinos por semana</option>
            <option value="total_workouts">Total de treinos</option>
            <option value="custom">Personalizada</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-mh-muted">Alvo</label>
          <input name="target" type="number" min="1" defaultValue={4} className={inputCls} />
        </div>
        <div className="flex items-end"><Button type="submit">Adicionar</Button></div>
      </form>

      <div className="mt-5 space-y-2">
        {progress.goals.length === 0 && <p className="text-sm text-mh-muted">Nenhuma meta ainda.</p>}
        {progress.goals.map((g) => (
          <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-mh-surface p-4">
            <div>
              <p className="font-medium text-white">{g.title}</p>
              <p className="text-xs text-mh-muted">
                {TYPE_LABEL[g.type] ?? g.type} · alvo {g.target} · atual {g.current} ({g.pct}%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              {g.status === "achieved" ? (
                <Badge tone="success">Atingida</Badge>
              ) : (
                <form action={markGoalAchieved}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <input type="hidden" name="title" value={g.title} />
                  <Button type="submit" variant="outline" size="sm">Marcar atingida (+50 pts)</Button>
                </form>
              )}
              <form action={deleteGoal}>
                <input type="hidden" name="id" value={g.id} />
                <input type="hidden" name="user_id" value={userId} />
                <button type="submit" aria-label="Excluir" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
