import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, Droplet, Ruler, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { getBodyData } from "@/lib/coaching/body";
import {
  addMetrics,
  addWater,
  deleteProgressPhoto,
  setWaterGoal,
  submitCheckin,
  uploadProgressPhoto,
} from "@/lib/coaching/body-actions";
import { ProgressCompare } from "@/components/coaching/progress-compare";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Corpo e evolução" };

const inputCls = "h-10 w-full rounded-md border border-white/10 bg-[#0d0d0f] px-3 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none";
const fmtDate = (d: string) => new Intl.DateTimeFormat("pt-BR").format(new Date(d));

function Scale({ name, label }: { name: string; label: string }) {
  return (
    <label className="space-y-1">
      <span className="block text-xs text-mh-muted">{label}</span>
      <select name={name} defaultValue="" className={inputCls}>
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
  );
}

export default async function CorpoPage() {
  const user = await requireUser("/acompanhamento/corpo");
  if (!(await hasCoachingAccess())) redirect("/acompanhamento");
  const { metrics, latest, hydration, checkins, photos } = await getBodyData(user.id);
  const hydPct = Math.min(100, Math.round((hydration.total_ml / Math.max(1, hydration.goal_ml)) * 100));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <a href="/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </a>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Corpo e evolução</h1>
      <p className="mt-1 text-sm text-mh-muted">Seus dados são privados — só você (e a equipe autorizada) vê.</p>

      {/* Hidratação */}
      <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
          <Droplet className="size-4 text-mh-red" /> Hidratação de hoje
        </h2>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums text-white">{(hydration.total_ml / 1000).toFixed(2)}L</span>
          <span className="text-sm text-mh-muted">de {(hydration.goal_ml / 1000).toFixed(1)}L</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-mh-red" style={{ width: `${hydPct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[250, 500, 750].map((ml) => (
            <form key={ml} action={addWater}>
              <input type="hidden" name="amount" value={ml} />
              <Button type="submit" variant="outline" size="sm">+{ml}ml</Button>
            </form>
          ))}
          <form action={addWater}>
            <input type="hidden" name="amount" value={-250} />
            <Button type="submit" variant="ghost" size="sm">−250ml</Button>
          </form>
          <form action={setWaterGoal} className="ml-auto flex items-center gap-2">
            <input name="goal_ml" type="number" min="250" step="250" defaultValue={hydration.goal_ml} className="h-9 w-24 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm text-white" />
            <Button type="submit" variant="ghost" size="sm">Meta</Button>
          </form>
        </div>
      </section>

      {/* Peso e medidas */}
      <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mh-muted">
          <Ruler className="size-4 text-mh-red" /> Peso e medidas
        </h2>
        {latest && (
          <p className="mt-2 text-sm text-mh-muted">
            Último registro ({fmtDate(latest.measured_on)}):{" "}
            {latest.weight != null && <span className="text-white">{latest.weight}kg </span>}
            {latest.waist != null && <span className="text-white">cintura {latest.waist}cm </span>}
            {latest.body_fat != null && <span className="text-white">%G {latest.body_fat} </span>}
          </p>
        )}
        <form action={addMetrics} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Data</span><input name="measured_on" type="date" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Peso (kg)</span><input name="weight" inputMode="decimal" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">% Gordura</span><input name="body_fat" inputMode="decimal" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Cintura (cm)</span><input name="waist" inputMode="decimal" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Quadril (cm)</span><input name="hip" inputMode="decimal" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Braço (cm)</span><input name="arm" inputMode="decimal" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Peito (cm)</span><input name="chest" inputMode="decimal" className={inputCls} /></label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Coxa (cm)</span><input name="thigh" inputMode="decimal" className={inputCls} /></label>
          <div className="col-span-2 flex items-end sm:col-span-4">
            <Button type="submit">Registrar medição</Button>
          </div>
        </form>

        {metrics.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="text-left text-xs text-mh-muted">
                <tr><th className="py-1">Data</th><th>Peso</th><th>Cintura</th><th>%G</th></tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {metrics.slice(0, 10).map((m) => (
                  <tr key={m.id}>
                    <td className="py-1.5 text-mh-muted">{fmtDate(m.measured_on)}</td>
                    <td className="text-white">{m.weight ?? "—"}</td>
                    <td className="text-white">{m.waist ?? "—"}</td>
                    <td className="text-white">{m.body_fat ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Check-in semanal */}
      <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Check-in semanal</h2>
        <form action={submitCheckin} className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Scale name="energy" label="Energia (1-5)" />
            <Scale name="sleep" label="Sono (1-5)" />
            <Scale name="nutrition" label="Alimentação (1-5)" />
            <Scale name="disposition" label="Disposição (1-5)" />
          </div>
          <input name="pain" placeholder="Sentiu dor? Onde? (opcional)" className={inputCls} />
          <input name="difficulty" placeholder="Dificuldade para seguir o plano? (opcional)" className={inputCls} />
          <input name="notes" placeholder="Observações (opcional)" className={inputCls} />
          <Button type="submit">Enviar check-in</Button>
        </form>
        {checkins.length > 0 && (
          <ul className="mt-4 divide-y divide-white/6 text-sm">
            {checkins.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-mh-muted">{fmtDate(c.created_at)}</span>
                <span className="text-white">
                  ⚡{c.energy ?? "—"} · 😴{c.sleep ?? "—"} · 🍎{c.nutrition ?? "—"} · 💪{c.disposition ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Antes e depois */}
      <section className="mt-6 rounded-lg border border-white/10 bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-muted">Fotos de evolução (privadas)</h2>
        <form action={uploadProgressPhoto} encType="multipart/form-data" className="mt-3 flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="block text-xs text-mh-muted">Foto</span>
            <input type="file" name="photo" accept="image/*" required className="block text-sm text-mh-muted file:mr-3 file:rounded-md file:border-0 file:bg-mh-surface-2 file:px-3 file:py-2 file:text-sm file:text-white" />
          </label>
          <label className="space-y-1"><span className="block text-xs text-mh-muted">Data</span><input name="taken_on" type="date" className={inputCls} /></label>
          <Button type="submit">Enviar</Button>
        </form>

        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id} className="group relative aspect-[3/4] overflow-hidden rounded-md border border-white/10 bg-black">
                {p.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={`Foto de ${fmtDate(p.taken_on)}`} className="size-full object-cover" />
                )}
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">{fmtDate(p.taken_on)}</span>
                <form action={deleteProgressPhoto} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" aria-label="Excluir foto" className="grid size-7 place-items-center rounded bg-black/60 text-white/80 hover:text-mh-red-soft">
                    <Trash2 className="size-3.5" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {photos.length >= 2 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-mh-muted">Comparar antes e depois</p>
            <ProgressCompare photos={photos.map((p) => ({ id: p.id, url: p.url, taken_on: p.taken_on }))} />
          </div>
        )}
      </section>
    </div>
  );
}
