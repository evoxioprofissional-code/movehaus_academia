import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMealPlanTree } from "@/lib/coaching/nutrition";
import {
  addMeal, addMealItem, createMealPlan, deleteMeal, deleteMealItem, updateMeal, updateMealItem,
} from "@/lib/coaching/nutrition-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Plano alimentar | MoveHaus Admin" };
const inputCls = "h-9 w-full rounded border border-white/10 bg-[#0d0d0f] px-2 text-sm text-white focus:border-mh-red focus:outline-none";

export default async function AdminNutricaoPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const [{ data: profile }, tree] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", userId).maybeSingle(),
    getMealPlanTree(userId),
  ]);
  const who = profile?.full_name || profile?.email || "Aluno";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </Link>
      <AdminPageHeader title={`Nutrição de ${who}`} description="Monte o plano alimentar: refeições, itens, quantidades e substituições." />

      {!tree.plan ? (
        <form action={createMealPlan} className="mt-5 flex flex-wrap items-end gap-3 rounded-lg bg-mh-surface p-4">
          <input type="hidden" name="user_id" value={userId} />
          <div className="flex-1">
            <label className="mb-1 block text-sm text-mh-muted">Nome do plano</label>
            <input name="name" defaultValue="Plano alimentar" className={inputCls} />
          </div>
          <Button type="submit"><Plus className="size-4" /> Criar plano</Button>
        </form>
      ) : (
        <div className="mt-5 space-y-4">
          {tree.meals.map((meal) => (
            <div key={meal.id} className="rounded-lg bg-mh-surface p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <form action={updateMeal} className="flex flex-1 flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={meal.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <div className="flex-1"><label className="mb-1 block text-xs text-mh-muted">Refeição</label><input name="name" defaultValue={meal.name} className={inputCls} /></div>
                  <div className="w-28"><label className="mb-1 block text-xs text-mh-muted">Horário</label><input name="time_label" defaultValue={meal.time_label} placeholder="08:00" className={inputCls} /></div>
                  <Button type="submit" variant="outline" size="sm">Salvar</Button>
                </form>
                <form action={deleteMeal}>
                  <input type="hidden" name="id" value={meal.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <button type="submit" aria-label="Excluir refeição" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft"><Trash2 className="size-4" /></button>
                </form>
              </div>

              <div className="mt-3 space-y-2">
                {meal.items.map((it) => (
                  <div key={it.id}>
                    <form id={`delitem-${it.id}`} action={deleteMealItem} className="hidden">
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="user_id" value={userId} />
                    </form>
                    <form action={updateMealItem} className="grid gap-2 rounded-md border border-white/8 p-3 sm:grid-cols-[1fr_100px_auto]">
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="user_id" value={userId} />
                      <input name="food" defaultValue={it.food} placeholder="Alimento" className={inputCls} />
                      <input name="quantity" defaultValue={it.quantity} placeholder="Qtd" className={inputCls} />
                      <div className="flex items-center gap-1">
                        <Button type="submit" variant="outline" size="sm">Salvar</Button>
                        <button type="submit" form={`delitem-${it.id}`} aria-label="Excluir item" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft"><Trash2 className="size-4" /></button>
                      </div>
                      <input name="substitutions" defaultValue={it.substitutions} placeholder="Substituições (opcional)" className={`${inputCls} sm:col-span-3`} />
                      <input name="notes" defaultValue={it.notes} placeholder="Observação da nutri (opcional)" className={`${inputCls} sm:col-span-3`} />
                    </form>
                  </div>
                ))}

                <form action={addMealItem} className="grid gap-2 rounded-md border border-dashed border-white/12 p-3 sm:grid-cols-[1fr_100px_auto]">
                  <input type="hidden" name="meal_id" value={meal.id} />
                  <input type="hidden" name="user_id" value={userId} />
                  <input name="food" required placeholder="Novo alimento" className={inputCls} />
                  <input name="quantity" placeholder="Qtd" className={inputCls} />
                  <Button type="submit" size="sm"><Plus className="size-4" /></Button>
                </form>
              </div>
            </div>
          ))}

          <form action={addMeal} className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-white/12 p-4">
            <input type="hidden" name="plan_id" value={tree.plan.id} />
            <input type="hidden" name="user_id" value={userId} />
            <div className="flex-1"><label className="mb-1 block text-sm text-mh-muted">Nova refeição</label><input name="name" placeholder="Ex.: Café da manhã" required className={inputCls} /></div>
            <div className="w-28"><label className="mb-1 block text-xs text-mh-muted">Horário</label><input name="time_label" placeholder="08:00" className={inputCls} /></div>
            <Button type="submit"><Plus className="size-4" /> Adicionar</Button>
          </form>
        </div>
      )}
    </div>
  );
}
