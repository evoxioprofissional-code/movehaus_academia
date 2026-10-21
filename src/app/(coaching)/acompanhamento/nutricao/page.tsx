import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { getMealPlanTree, getTodayMealLogs, getRecipes } from "@/lib/coaching/nutrition";
import { toggleMealDone } from "@/lib/coaching/nutrition-actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Nutrição" };

export default async function NutricaoPage() {
  const user = await requireUser("/acompanhamento/nutricao");
  if (!(await hasCoachingAccess())) redirect("/acompanhamento");
  const [tree, doneToday, recipes] = await Promise.all([
    getMealPlanTree(user.id),
    getTodayMealLogs(user.id),
    getRecipes(),
  ]);

  const total = tree.meals.length;
  const done = tree.meals.filter((m) => doneToday.has(m.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const shopping = tree.meals.flatMap((m) => m.items.map((it) => ({ food: it.food, quantity: it.quantity })));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <a href="/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </a>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Nutrição</h1>

      {!tree.plan ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5 text-sm text-mh-muted">
          Seu plano alimentar está sendo montado pela nutricionista. Em breve aparece aqui.
        </div>
      ) : (
        <>
          {/* Adesão de hoje */}
          <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Refeições de hoje</h2>
              <span className="text-sm text-white">{done}/{total} ({pct}%)</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-mh-red" style={{ width: `${pct}%` }} />
            </div>

            <div className="mt-4 space-y-3">
              {tree.meals.map((meal) => {
                const isDone = doneToday.has(meal.id);
                return (
                  <div key={meal.id} className="rounded-lg border border-white/8 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {meal.time_label && <span className="text-mh-muted">{meal.time_label} · </span>}
                          {meal.name}
                        </p>
                      </div>
                      <form action={toggleMealDone}>
                        <input type="hidden" name="meal_id" value={meal.id} />
                        <input type="hidden" name="done" value={String(!isDone)} />
                        <button
                          type="submit"
                          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs ${isDone ? "border-emerald-500 bg-emerald-500/15 text-emerald-400" : "border-white/10 text-mh-muted hover:text-white"}`}
                        >
                          <Check className="size-4" /> {isDone ? "Feita" : "Marcar"}
                        </button>
                      </form>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {meal.items.map((it) => (
                        <li key={it.id} className="text-mh-muted">
                          <span className="text-white">{it.food}</span>
                          {it.quantity && ` — ${it.quantity}`}
                          {it.substitutions && <span className="block text-xs">↳ ou: {it.substitutions}</span>}
                          {it.notes && <span className="block text-xs italic">{it.notes}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Lista de compras */}
          {shopping.length > 0 && (
            <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
                <ShoppingCart className="size-4 text-mh-red" /> Lista de compras
              </h2>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {shopping.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white">
                    <span className="size-1.5 rounded-full bg-mh-red" />
                    {s.food}{s.quantity && <span className="text-mh-muted"> — {s.quantity}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Receitas */}
      {recipes.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
            <UtensilsCrossed className="size-4 text-mh-red" /> Receitas
          </h2>
          <div className="space-y-2">
            {recipes.map((r) => (
              <details key={r.id} className="rounded-lg border border-white/10 bg-mh-surface p-4">
                <summary className="cursor-pointer list-none font-medium text-white">{r.title}</summary>
                {r.description && <p className="mt-1 text-sm text-mh-muted">{r.description}</p>}
                {r.ingredients && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-mh-muted">Ingredientes</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-mh-text">{r.ingredients}</p>
                  </div>
                )}
                {r.steps && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-mh-muted">Preparo</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-mh-text">{r.steps}</p>
                  </div>
                )}
              </details>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Button asChild variant="ghost" size="sm"><a href="/acompanhamento">Voltar</a></Button>
      </div>
    </div>
  );
}
