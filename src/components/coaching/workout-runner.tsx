"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finishSession } from "@/lib/coaching/workout-actions";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  target_load: string;
  rest_seconds: number;
  video_url: string | null;
  notes: string;
};

type Entry = { reps?: string; load?: string; done?: boolean };

export function WorkoutRunner({
  sessionId,
  dayName,
  exercises,
}: {
  sessionId: string;
  dayName: string;
  exercises: Exercise[];
}) {
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [rest, setRest] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startRest(seconds: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setRest(seconds);
    timerRef.current = setInterval(() => {
      setRest((r) => {
        if (r === null) return null;
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          try { navigator.vibrate?.(200); } catch {}
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  const set = (key: string, patch: Entry) =>
    setEntries((e) => ({ ...e, [key]: { ...e[key], ...patch } }));

  const logs = useMemo(() => {
    const out: Record<string, unknown>[] = [];
    for (const ex of exercises) {
      for (let i = 1; i <= ex.sets; i++) {
        const e = entries[`${ex.id}:${i}`];
        if (e && (e.reps || e.load)) {
          out.push({
            exercise_id: ex.id,
            exercise_name: ex.name,
            set_number: i,
            reps_done: e.reps ? Number(e.reps) : null,
            load_used: e.load ? Number(String(e.load).replace(",", ".")) : null,
          });
        }
      }
    }
    return out;
  }, [entries, exercises]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">Modo treino</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{dayName}</h1>

      <div className="mt-5 space-y-4 pb-28">
        {exercises.map((ex) => (
          <div key={ex.id} className="rounded-lg border border-white/10 bg-mh-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-white">{ex.name}</h2>
                <p className="text-sm text-mh-muted">
                  {ex.sets} × {ex.reps}
                  {ex.target_load ? ` · alvo ${ex.target_load}` : ""}
                </p>
                {ex.notes && <p className="mt-1 text-xs text-mh-muted">{ex.notes}</p>}
                {ex.video_url && (
                  <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-mh-red-soft hover:underline">
                    Ver vídeo
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => startRest(ex.rest_seconds || 60)}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-mh-muted hover:text-white"
              >
                <Timer className="size-4" /> Descanso {ex.rest_seconds || 60}s
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {Array.from({ length: ex.sets }).map((_, idx) => {
                const i = idx + 1;
                const key = `${ex.id}:${i}`;
                const e = entries[key] ?? {};
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-8 text-xs text-mh-muted">{i}ª</span>
                    <input
                      inputMode="numeric"
                      placeholder="reps"
                      value={e.reps ?? ""}
                      onChange={(ev) => set(key, { reps: ev.target.value })}
                      className="h-10 w-20 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-center text-sm text-white focus:border-mh-red focus:outline-none"
                    />
                    <input
                      inputMode="decimal"
                      placeholder="carga"
                      value={e.load ?? ""}
                      onChange={(ev) => set(key, { load: ev.target.value })}
                      className="h-10 w-24 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-center text-sm text-white focus:border-mh-red focus:outline-none"
                    />
                    <span className="text-xs text-mh-muted">kg</span>
                    <button
                      type="button"
                      onClick={() => { set(key, { done: !e.done }); startRest(ex.rest_seconds || 60); }}
                      aria-label="Concluir série"
                      className={cn(
                        "ml-auto grid size-10 place-items-center rounded-md border transition-colors",
                        e.done ? "border-emerald-500 bg-emerald-500/15 text-emerald-400" : "border-white/10 text-mh-muted hover:text-white",
                      )}
                    >
                      <Check className="size-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cronômetro de descanso flutuante */}
      {rest !== null && (
        <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-mh-black px-5 py-3 shadow-mh ring-1 ring-white/10">
          <Timer className="size-5 text-mh-red" />
          <span className="tabular-nums text-lg font-semibold text-white">
            {String(Math.floor(rest / 60)).padStart(2, "0")}:{String(rest % 60).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => setRest(null)} aria-label="Fechar" className="text-mh-muted hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Finalizar */}
      <form action={finishSession} className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-mh-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <input type="hidden" name="session_id" value={sessionId} />
          <input type="hidden" name="logs" value={JSON.stringify(logs)} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-mh-muted">Como foi?</span>
            {["leve", "adequado", "pesado"].map((f, i) => (
              <label key={f} className="cursor-pointer">
                <input type="radio" name="feeling" value={f} defaultChecked={i === 1} className="peer sr-only" />
                <span className="rounded-md border border-white/10 px-3 py-1.5 text-sm capitalize text-mh-muted peer-checked:border-mh-red peer-checked:bg-mh-red/10 peer-checked:text-white">
                  {f}
                </span>
              </label>
            ))}
          </div>
          <input
            name="discomfort"
            placeholder="Sentiu dor/desconforto? (opcional)"
            className="h-10 flex-1 rounded-md border border-white/10 bg-[#0d0d0f] px-3 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
          />
          <Button type="submit" size="lg">Finalizar treino</Button>
        </div>
      </form>
    </div>
  );
}
