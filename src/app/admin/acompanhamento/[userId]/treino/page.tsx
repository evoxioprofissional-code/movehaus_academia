import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPlanTree, WEEKDAYS } from "@/lib/coaching/workouts";
import {
  addDay,
  addExercise,
  createPlan,
  deleteDay,
  deleteExercise,
  updateDay,
  updateExercise,
} from "@/lib/coaching/workout-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Montar treino | MoveHaus Admin" };

const inputCls =
  "h-9 w-full rounded border border-white/10 bg-[#0d0d0f] px-2 text-sm text-white focus:border-mh-red focus:outline-none";

function WeekdaySelect({ name, value }: { name: string; value: number | null }) {
  return (
    <select name={name} defaultValue={value ?? ""} className={inputCls}>
      <option value="">Sem dia fixo</option>
      {WEEKDAYS.map((d, i) => (
        <option key={i} value={i + 1}>{d}</option>
      ))}
    </select>
  );
}

export default async function MontarTreinoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const [{ data: profile }, tree] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    getPlanTree(userId),
  ]);
  const who = profile?.full_name || profile?.email || "Aluno";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </Link>
      <AdminPageHeader title={`Treino de ${who}`} description="Monte o plano semanal: dias e exercícios." />

      {!tree.plan ? (
        <form action={createPlan} className="mt-5 flex flex-wrap items-end gap-3 rounded-lg bg-mh-surface p-4">
          <input type="hidden" name="user_id" value={userId} />
          <div className="flex-1">
            <label className="mb-1 block text-sm text-mh-muted">Nome do plano</label>
            <input name="name" defaultValue="Plano de treino" className={inputCls} />
          </div>
          <Button type="submit"><Plus className="size-4" /> Criar plano</Button>
        </form>
      ) : (
        <div className="mt-5 space-y-4">
          {tree.days.map((day) => (
            <div key={day.id} className="rounded-lg bg-mh-surface p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <form action={updateDay} className="flex flex-1 flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={day.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-mh-muted">Treino</label>
                    <input name="name" defaultValue={day.name} className={inputCls} />
                  </div>
                  <div className="w-32">
                    <label className="mb-1 block text-xs text-mh-muted">Dia</label>
                    <WeekdaySelect name="weekday" value={day.weekday} />
                  </div>
                  <Button type="submit" variant="outline" size="sm">Salvar</Button>
                </form>
                <form action={deleteDay}>
                  <input type="hidden" name="id" value={day.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <button type="submit" aria-label="Excluir dia" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft">
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>

              {/* Exercícios do dia */}
              <div className="mt-3 space-y-2">
                {day.exercises.map((ex) => (
                  <div key={ex.id}>
                    <form id={`delex-${ex.id}`} action={deleteExercise} className="hidden">
                      <input type="hidden" name="id" value={ex.id} />
                      <input type="hidden" name="user_id" value={userId} />
                    </form>
                    <form action={updateExercise} className="grid gap-2 rounded-md border border-white/8 p-3 sm:grid-cols-[1fr_60px_80px_90px_70px_auto]">
                      <input type="hidden" name="id" value={ex.id} />
                      <input type="hidden" name="user_id" value={userId} />
                      <input name="name" defaultValue={ex.name} placeholder="Exercício" className={inputCls} />
                      <input name="sets" type="number" defaultValue={ex.sets} title="Séries" className={inputCls} />
                      <input name="reps" defaultValue={ex.reps} title="Reps" className={inputCls} />
                      <input name="target_load" defaultValue={ex.target_load} placeholder="Carga" className={inputCls} />
                      <input name="rest_seconds" type="number" defaultValue={ex.rest_seconds} title="Descanso (s)" className={inputCls} />
                      <div className="flex items-center gap-1">
                        <Button type="submit" variant="outline" size="sm">Salvar</Button>
                        <button type="submit" form={`delex-${ex.id}`} aria-label="Excluir exercício" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <input name="video_url" defaultValue={ex.video_url ?? ""} placeholder="Link do vídeo (opcional)" className={`${inputCls} sm:col-span-3`} />
                      <input name="notes" defaultValue={ex.notes} placeholder="Observação do professor" className={`${inputCls} sm:col-span-3`} />
                    </form>
                  </div>
                ))}

                {/* Adicionar exercício */}
                <form action={addExercise} className="grid gap-2 rounded-md border border-dashed border-white/12 p-3 sm:grid-cols-[1fr_60px_80px_90px_70px_auto]">
                  <input type="hidden" name="day_id" value={day.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <input name="name" required placeholder="Novo exercício" className={inputCls} />
                  <input name="sets" type="number" defaultValue={3} title="Séries" className={inputCls} />
                  <input name="reps" defaultValue="10-12" title="Reps" className={inputCls} />
                  <input name="target_load" placeholder="Carga" className={inputCls} />
                  <input name="rest_seconds" type="number" defaultValue={60} title="Descanso (s)" className={inputCls} />
                  <Button type="submit" size="sm"><Plus className="size-4" /></Button>
                </form>
              </div>
            </div>
          ))}

          {/* Adicionar dia */}
          <form action={addDay} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-white/12 p-4">
            <input type="hidden" name="plan_id" value={tree.plan.id} />
            <input type="hidden" name="user_id" value={userId} />
            <div className="flex-1">
              <label className="mb-1 block text-sm text-mh-muted">Novo dia de treino</label>
              <input name="name" placeholder="Ex.: Treino A — Peito e tríceps" required className={inputCls} />
            </div>
            <div className="w-32">
              <label className="mb-1 block text-xs text-mh-muted">Dia</label>
              <WeekdaySelect name="weekday" value={null} />
            </div>
            <Button type="submit"><Plus className="size-4" /> Adicionar dia</Button>
          </form>
        </div>
      )}
    </div>
  );
}
