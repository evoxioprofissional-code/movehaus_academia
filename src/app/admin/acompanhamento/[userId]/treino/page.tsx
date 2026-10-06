import Link from "next/link";
import { Check, Copy, Eye, GripVertical, Link2, Plus, Save, Send, Target, Trash2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPlanTree, WEEKDAYS } from "@/lib/coaching/workouts";
import { addDay, addExercise, createPlan, deleteDay, deleteExercise, duplicateDay, publishPlan, updateDay, updateExercise } from "@/lib/coaching/workout-actions";
import { WorkoutPhonePreview } from "@/components/coaching/workout-phone-preview";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Montar treino | MoveHaus Admin" };

const input = "h-9 min-w-0 w-full rounded-md border border-admin-border bg-[#0b0d10] px-2.5 text-xs text-white outline-none placeholder:text-[#666d7a] focus:border-admin-red focus:ring-1 focus:ring-admin-red/30";

export default async function MontarTreinoPage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ day?: string }> }) {
  const { userId } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const [{ data: profile }, tree] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    getPlanTree(userId),
  ]);
  const who = profile?.full_name || profile?.email || "Aluno";
  const initials = who.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AL";
  const requested = Number(query.day ?? 0);
  const activeIndex = Number.isInteger(requested) && requested >= 0 && requested < tree.days.length ? requested : 0;
  const activeDay = tree.days[activeIndex] ?? null;

  return <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-7">
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><nav className="flex items-center gap-2 text-xs text-admin-muted"><Link href="/admin/acompanhamento" className="hover:text-white">Alunos</Link><span>/</span><span className="text-[#c9cdd5]">{who}</span></nav><h1 className="mt-2 text-[26px] font-bold leading-none tracking-[-0.035em] text-white">Montar treino</h1><p className="mt-1.5 text-xs text-admin-muted">{who}</p></div>
          {tree.plan && <div className="flex gap-2"><Link href={"/equipe/aluno/" + userId} className="inline-flex h-9 items-center gap-2 rounded-md border border-admin-border px-3 text-xs font-semibold text-white transition-colors hover:bg-white/5"><Eye className="size-4" />Prévia do aluno</Link><form action={publishPlan}><input type="hidden" name="plan_id" value={tree.plan.id} /><input type="hidden" name="user_id" value={userId} /><Button type="submit" size="sm"><Send className="size-4" />Publicar treino</Button></form></div>}
        </div>

        {!tree.plan ? <form action={createPlan} className="admin-panel mt-6 flex flex-wrap items-end gap-3 p-5"><input type="hidden" name="user_id" value={userId} /><div className="min-w-[220px] flex-1"><label className="mb-1.5 block text-xs text-admin-muted">Nome do plano</label><input name="name" defaultValue="Plano de treino" className={input} /></div><Button type="submit"><Plus className="size-4" />Criar plano</Button></form> : <>
          <section className="admin-panel mt-5 grid gap-4 p-3 sm:grid-cols-[1.25fr_.75fr_.75fr] sm:items-center">
            <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2a2e36] text-xs font-semibold text-white">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{who}</p><p className="truncate text-[10px] text-admin-muted">{profile?.email || "Aluno MoveHaus"}</p></div></div>
            <div className="flex items-center gap-3 border-admin-border sm:border-l sm:pl-5"><Target className="size-5 text-admin-muted" /><div><p className="text-[9px] text-admin-muted">Objetivo</p><p className="text-xs font-medium text-white">{tree.plan.name}</p></div></div>
            <div className="flex items-center gap-3 border-admin-border sm:border-l sm:pl-5"><TrendingUp className="size-5 text-admin-muted" /><div><p className="text-[9px] text-admin-muted">Nível</p><p className="text-xs font-medium text-white">Acompanhamento</p></div></div>
          </section>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {tree.days.map((day, index) => <Link key={day.id} href={"?day=" + index} className={index === activeIndex ? "flex h-9 min-w-[72px] items-center justify-center rounded-md bg-admin-red px-4 text-xs font-semibold text-white" : "flex h-9 min-w-[72px] items-center justify-center rounded-md border border-admin-border bg-admin-card px-4 text-xs font-medium text-[#b8bdc7] hover:text-white"}>{day.weekday ? WEEKDAYS[day.weekday - 1] : "Dia " + (index + 1)}</Link>)}
            <details className="group relative"><summary className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-md border border-dashed border-admin-border px-3 text-xs text-admin-muted hover:text-white"><Plus className="size-4" />Dia</summary><form action={addDay} className="absolute right-0 top-11 z-20 w-72 space-y-3 rounded-lg border border-admin-border bg-[#111318] p-4 shadow-2xl"><input type="hidden" name="plan_id" value={tree.plan.id} /><input type="hidden" name="user_id" value={userId} /><input name="name" required placeholder="Nome do treino" className={input} /><select name="weekday" className={input}><option value="">Sem dia fixo</option>{WEEKDAYS.map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select><Button type="submit" size="sm" className="w-full">Adicionar dia</Button></form></details>
          </div>

          {activeDay ? <section className="admin-panel mt-2 overflow-hidden p-3">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-admin-border pb-3"><div><h2 className="text-[17px] font-semibold text-white">{activeDay.name}</h2><p className="mt-0.5 text-[10px] text-admin-muted">{activeDay.weekday ? WEEKDAYS[activeDay.weekday - 1] : "Sem dia fixo"} · {activeDay.exercises.length} exercícios</p></div><div className="flex gap-2"><form action={duplicateDay}><input type="hidden" name="day_id" value={activeDay.id} /><input type="hidden" name="user_id" value={userId} /><button className="inline-flex h-8 items-center gap-2 rounded-md border border-admin-border px-3 text-[10px] font-semibold text-white hover:bg-white/5"><Copy className="size-3.5" />Duplicar treino</button></form><form action={deleteDay}><input type="hidden" name="id" value={activeDay.id} /><input type="hidden" name="user_id" value={userId} /><button aria-label="Excluir dia" className="grid size-8 place-items-center rounded-md border border-admin-border text-admin-muted hover:border-admin-red/50 hover:text-admin-red"><Trash2 className="size-3.5" /></button></form></div></div>
            <form action={updateDay} className="mt-3 grid gap-2 sm:grid-cols-[1fr_150px_auto]"><input type="hidden" name="id" value={activeDay.id} /><input type="hidden" name="user_id" value={userId} /><input name="name" defaultValue={activeDay.name} aria-label="Nome do treino" className={input} /><select name="weekday" defaultValue={activeDay.weekday ?? ""} className={input}><option value="">Sem dia fixo</option>{WEEKDAYS.map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select><Button type="submit" variant="outline" size="sm"><Save className="size-3.5" />Salvar</Button></form>

            <div className="mt-3 hidden grid-cols-[22px_minmax(180px,1fr)_58px_72px_86px_76px_64px] gap-2 px-2 text-[9px] text-admin-muted md:grid"><span /><span>Exercício</span><span>Séries</span><span>Reps</span><span>Carga</span><span>Descanso</span><span /></div>
            <div className="mt-1 divide-y divide-admin-border rounded-lg border border-admin-border">
              {activeDay.exercises.map((exercise, index) => <div key={exercise.id} className="relative">
                <form id={"delete-exercise-" + exercise.id} action={deleteExercise} className="hidden"><input type="hidden" name="id" value={exercise.id} /><input type="hidden" name="user_id" value={userId} /></form>
                <form action={updateExercise} className="p-2"><input type="hidden" name="id" value={exercise.id} /><input type="hidden" name="user_id" value={userId} />
                  <div className="grid gap-2 md:grid-cols-[22px_minmax(180px,1fr)_58px_72px_86px_76px_64px] md:items-center"><GripVertical className="hidden size-4 text-[#69707c] md:block" /><input name="name" defaultValue={exercise.name} placeholder="Exercício" className={input} /><input name="sets" type="number" min="1" defaultValue={exercise.sets} aria-label="Séries" className={input} /><input name="reps" defaultValue={exercise.reps} aria-label="Repetições" className={input} /><div className="relative"><input name="target_load" defaultValue={exercise.target_load} aria-label="Carga" className={input + " pr-7"} /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-admin-muted">kg</span></div><div className="relative"><input name="rest_seconds" type="number" min="0" defaultValue={exercise.rest_seconds} aria-label="Descanso" className={input + " pr-5"} /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-admin-muted">s</span></div><div className="flex justify-end gap-1"><button type="submit" aria-label="Salvar exercício" className="grid size-8 place-items-center rounded-md text-admin-muted hover:bg-white/5 hover:text-white"><Save className="size-3.5" /></button><button type="submit" form={"delete-exercise-" + exercise.id} aria-label="Excluir exercício" className="grid size-8 place-items-center rounded-md text-admin-muted hover:bg-white/5 hover:text-admin-red"><Trash2 className="size-3.5" /></button></div></div>
                  <details open={index === 0} className="group mt-2"><summary className="flex cursor-pointer list-none items-center gap-2 text-[9px] font-medium text-admin-muted hover:text-white"><Link2 className="size-3" />Vídeo e orientação<span className="ml-auto group-open:hidden">Mostrar</span><span className="ml-auto hidden group-open:inline">Ocultar</span></summary><div className="mt-2 grid gap-2 md:grid-cols-2"><div><label className="mb-1 block text-[9px] text-admin-muted">Vídeo de execução (opcional)</label><input name="video_url" type="url" defaultValue={exercise.video_url ?? ""} placeholder="https://youtube.com/..." className={input} /></div><div><label className="mb-1 block text-[9px] text-admin-muted">Orientação do professor</label><textarea name="notes" defaultValue={exercise.notes} rows={2} placeholder="Explique execução, ritmo e cuidados." className={input + " h-auto min-h-14 resize-y py-2"} /></div></div></details>
                </form>
              </div>)}
            </div>

            <details className="group mt-2 rounded-lg border border-dashed border-admin-border"><summary className="flex h-11 cursor-pointer list-none items-center gap-2 px-4 text-xs font-semibold text-admin-red"><Plus className="size-4" />Adicionar exercício</summary><form action={addExercise} className="grid gap-2 border-t border-admin-border p-3 sm:grid-cols-2 lg:grid-cols-6"><input type="hidden" name="day_id" value={activeDay.id} /><input type="hidden" name="user_id" value={userId} /><input name="name" required placeholder="Nome do exercício" className={input + " sm:col-span-2"} /><input name="sets" type="number" min="1" defaultValue={3} aria-label="Séries" className={input} /><input name="reps" defaultValue="10-12" aria-label="Repetições" className={input} /><input name="target_load" placeholder="Carga" className={input} /><input name="rest_seconds" type="number" min="0" defaultValue={60} aria-label="Descanso" className={input} /><input name="video_url" type="url" placeholder="Vídeo opcional" className={input + " sm:col-span-3"} /><input name="notes" placeholder="Orientação do professor" className={input + " sm:col-span-3"} /><Button type="submit" size="sm" className="sm:col-span-2 lg:col-span-6"><Plus className="size-4" />Adicionar ao treino</Button></form></details>
          </section> : <div className="admin-panel mt-3 p-8 text-center text-sm text-admin-muted">Adicione um dia para começar a montar o treino.</div>}

          <div className="admin-panel mt-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-black"><Check className="size-5" /></span><div><p className="text-xs font-semibold text-white">Alterações prontas para publicar</p><p className="text-[10px] text-admin-muted">Salve cada linha alterada e publique o plano para o aluno.</p></div><form action={publishPlan} className="sm:ml-auto"><input type="hidden" name="plan_id" value={tree.plan.id} /><input type="hidden" name="user_id" value={userId} /><Button type="submit" size="sm" className="w-full sm:w-auto"><Send className="size-4" />Publicar treino</Button></form></div>
        </>}
      </div>
      <div id="preview"><WorkoutPhonePreview athleteName={who} day={activeDay} /></div>
    </div>
  </div>;
}
