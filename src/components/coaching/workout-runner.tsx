"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, ChevronDown, Loader2, Pause, Play, Timer } from "lucide-react";
import { abandonSession, finishSession, type WorkoutState } from "@/lib/coaching/workout-actions";
import { methodInfo } from "@/lib/coaching/training-methods";
import { fmtKg, loadInput, loadLabel, loadNum } from "@/lib/coaching/format";
import { cn } from "@/lib/utils";

type Exercise = { id: string; name: string; sets: number; reps: string; target_load: string; rest_seconds: number; video_url: string | null; notes: string; method: string; group_label: string };
type Entry = { reps: string; load: string; done: boolean };

function FinishButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-mh-red px-5 text-sm font-semibold text-white transition-colors hover:bg-mh-red-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50">
      {pending ? <><Loader2 className="size-5 animate-spin" />Finalizando…</> : "Finalizar treino"}
    </button>
  );
}

function suggestedReps(value: string) {
  return value.match(/\d+/)?.[0] ?? "";
}

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return "https://www.youtube-nocookie.com/embed/" + parsed.pathname.slice(1);
    const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
    if (parsed.hostname.includes("youtube.com") && id) return "https://www.youtube-nocookie.com/embed/" + id;
  } catch {}
  return null;
}

function ExerciseVideo({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = youtubeEmbed(url);
  if (!playing) return <button type="button" onClick={() => setPlaying(true)} className="my-4 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#191b20] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"><span className="grid size-14 place-items-center rounded-full border border-white/40 bg-black/40"><Play className="ml-1 size-6 fill-white" /></span><span className="text-sm font-medium">Ver execução</span></button>;
  if (embed) return <div className="my-4 aspect-video overflow-hidden rounded-xl"><iframe src={embed + "?autoplay=1"} title="Execução do exercício" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" /></div>;
  return <video src={url} controls autoPlay playsInline className="my-4 aspect-video w-full rounded-xl bg-black object-contain" />;
}

function WorkoutRunnerContent({ sessionId, dayName, exercises, dateLabel, initialDraft }: { sessionId: string; dayName: string; exercises: Exercise[]; athleteName: string; dateLabel: string; initialDraft?: Draft }) {
  const [entries, setEntries] = useState<Record<string, Entry>>(() => {
    const initial: Record<string, Entry> = {};
    for (const exercise of exercises) for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) initial[exercise.id + ":" + setNumber] = { reps: suggestedReps(exercise.reps), load: loadInput(exercise.target_load), done: false };
    for (const key of Object.keys(initial)) { const saved = initialDraft?.entries?.[key]; if (saved && typeof saved.reps === "string" && typeof saved.load === "string" && typeof saved.done === "boolean") initial[key] = saved; }
    return initial;
  });
  const [openId, setOpenId] = useState(exercises[0]?.id ?? "");
  const [rest, setRest] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number | null>(initialDraft?.rpe ?? null);
  const [notes, setNotes] = useState(initialDraft?.notes ?? "");
  const [state, finishAction] = useActionState<WorkoutState, FormData>(finishSession, {});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => {
    try { localStorage.setItem(`movehaus:workout:${sessionId}`, JSON.stringify({ entries, rpe, notes })); } catch { /* treino continua sem armazenamento local */ }
  }, [entries, rpe, notes, sessionId]);

  function startRest(seconds: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setRest(seconds);
    timerRef.current = setInterval(() => setRest((current) => {
      if (current === null) return null;
      if (current <= 1) { if (timerRef.current) clearInterval(timerRef.current); try { navigator.vibrate?.(200); } catch {} return 0; }
      return current - 1;
    }), 1000);
  }

  function stopRest() { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setRest(null); }
  function patch(key: string, value: Partial<Entry>) { setEntries((current) => ({ ...current, [key]: { ...current[key], ...value } })); }
  function exerciseDone(exercise: Exercise) { return Array.from({ length: exercise.sets }, (_, index) => entries[exercise.id + ":" + (index + 1)]?.done).every(Boolean); }
  const completedExercises = exercises.filter(exerciseDone).length;
  const progress = exercises.length ? Math.round((completedExercises / exercises.length) * 100) : 0;

  function exerciseVolume(exercise: Exercise) {
    let total = 0;
    for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) {
      const entry = entries[exercise.id + ":" + setNumber];
      if (entry?.done) {
        const reps = Number(entry.reps);
        const load = loadNum(entry.load);
        if (Number.isFinite(reps) && Number.isFinite(load)) total += reps * load;
      }
    }
    return total;
  }
  const totalVolume = useMemo(
    () => exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, exercises],
  );

  const logs = useMemo(() => {
    const result: Record<string, unknown>[] = [];
    for (const exercise of exercises) for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) {
      const entry = entries[exercise.id + ":" + setNumber];
      if (entry?.done) result.push({ exercise_id: exercise.id, exercise_name: exercise.name, set_number: setNumber, reps_done: entry.reps ? Number(entry.reps) : null, load_used: Number.isFinite(loadNum(entry.load)) ? loadNum(entry.load) : null });
    }
    return result;
  }, [entries, exercises]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
      <a href="/acompanhamento" className="mb-4 inline-flex min-h-10 items-center text-sm text-white/60 hover:text-white">← Voltar ao meu plano</a>
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-mh-red">Treino em andamento</p>
      <h1 className="mt-2 text-[clamp(2rem,8vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.045em] text-white">{dayName}</h1>
      <p className="mt-1 text-sm text-white/55">{dateLabel}</p>
      <p className="mt-3 text-sm text-white/65">{completedExercises} de {exercises.length} {exercises.length === 1 ? "exercício concluído" : "exercícios concluídos"}</p>
      <div className="mt-2 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-mh-red transition-[width] duration-300" style={{ width: `${progress}%` }} /></div><span className="text-xs tabular-nums text-white/55">{progress}%</span></div>
      {totalVolume > 0 && <p className="mt-2 text-xs text-white/50">Volume concluído: {fmtKg(totalVolume)} kg</p>}

      <div className="mt-6 space-y-3">
        {exercises.length === 0 && <p className="rounded-2xl bg-[#111216] p-5 text-sm text-white/60">Seu professor ainda não adicionou exercícios a este treino.</p>}
        {exercises.map((exercise, exerciseIndex) => {
          const expanded = openId === exercise.id;
          const complete = exerciseDone(exercise);
          const method = methodInfo(exercise.method);
          return (
            <section key={exercise.id} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111216]">
              <button type="button" onClick={() => setOpenId(expanded ? "" : exercise.id)} aria-expanded={expanded} className="flex w-full items-center gap-3 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red">
                <span className="min-w-0 flex-1"><strong className="block truncate text-lg font-semibold leading-tight text-white">{exercise.name}</strong><span className="mt-1 block text-sm text-white/60">{exercise.sets} séries · {exercise.reps} repetições{exercise.target_load ? ` · ${loadLabel(exercise.target_load)}` : ""}</span></span>
                {complete ? <Check className="size-5 text-emerald-400" /> : <ChevronDown className={cn("size-5 shrink-0 text-white/60 transition-transform", expanded && "rotate-180")} />}
              </button>
              {expanded && <div className="border-t border-white/[0.08]">
                {method.value !== "normal" && <div className="mx-4 mt-4 rounded-xl bg-mh-red/[0.07] p-3"><p className="text-xs font-semibold text-mh-red">{method.label}{exercise.group_label ? ` · Grupo ${exercise.group_label}` : ""}</p><p className="mt-1 text-xs leading-relaxed text-white/70">{method.desc}</p></div>}
                {exercise.video_url && <div className="px-4"><ExerciseVideo url={exercise.video_url} /></div>}
                <div className="divide-y divide-white/[0.07]">
                  {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                    const setNumber = setIndex + 1;
                    const key = exercise.id + ":" + setNumber;
                    const entry = entries[key];
                    return <div key={key} className={cn("grid min-h-18 grid-cols-[minmax(0,1fr)_minmax(0,.8fr)_minmax(0,.75fr)_44px] items-center gap-1 px-3 py-2 sm:px-4", entry.done && "bg-emerald-500/[0.04]")}>
                      <span className="text-xs font-semibold text-white sm:text-sm">{setNumber}ª série</span>
                      <label className="min-w-0 border-l border-white/[0.08] pl-2 text-center"><input inputMode="numeric" type="number" min="0" aria-label={`Repetições da série ${setNumber}`} value={entry.reps} onChange={(event) => patch(key, { reps: event.target.value })} className="w-full bg-transparent text-center text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-mh-red" /><span className="block text-[10px] text-white/50">reps</span></label>
                      <label className="min-w-0 border-l border-white/[0.08] pl-2 text-center"><input inputMode="decimal" aria-label={`Carga da série ${setNumber} em kg`} value={entry.load} onChange={(event) => patch(key, { load: event.target.value })} className="w-full bg-transparent text-center text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-mh-red" /><span className="block text-[10px] text-white/50">kg</span></label>
                      <button type="button" onClick={() => { const next = !entry.done; patch(key, { done: next }); if (next) { startRest(exercise.rest_seconds || 60); const completesExercise = Array.from({ length: exercise.sets }, (_, index) => index + 1 === setNumber || entries[exercise.id + ":" + (index + 1)]?.done).every(Boolean); if (completesExercise) setOpenId(exercises[exerciseIndex + 1]?.id ?? exercise.id); } }} aria-label={entry.done ? `Desmarcar série ${setNumber}` : `Concluir série ${setNumber}`} aria-pressed={entry.done} className={cn("grid size-9 place-items-center rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red", entry.done ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/50 text-transparent")}><Check className="size-4" /></button>
                    </div>;
                  })}
                </div>
                {rest !== null && <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-[#1c1e24] p-3"><Timer className="size-5 text-mh-red" /><div><p className="text-[11px] text-white/55">Descanso</p><p className="text-lg font-bold tabular-nums">{String(Math.floor(rest / 60)).padStart(2, "0")}:{String(rest % 60).padStart(2, "0")}</p></div>{rest === 0 ? <button type="button" onClick={() => startRest(exercise.rest_seconds || 60)} aria-label="Reiniciar descanso" className="ml-auto grid size-10 place-items-center rounded-lg border border-mh-red text-mh-red"><Play className="size-4" /></button> : <button type="button" onClick={stopRest} className="ml-auto flex min-h-10 items-center gap-1 rounded-lg border border-mh-red px-3 text-xs font-semibold text-mh-red"><Pause className="size-3.5" />Pular</button>}</div>}
                {exercise.notes && <div className="mx-4 mb-4 rounded-xl bg-[#1c1e24] p-3"><p className="text-xs text-white/50">Orientação do professor</p><p className="mt-1 text-sm leading-relaxed text-white/80">{exercise.notes}</p></div>}
              </div>}
            </section>
          );
        })}
      </div>

      {state.error && <p role="alert" className="mt-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{state.error}</p>}
      <p className="mt-4 text-xs text-white/55">Marque cada série realizada. O treino só é concluído após todas as séries. Seu progresso é salvo neste aparelho.</p>
      <form action={abandonSession} onSubmit={() => { try { localStorage.removeItem(`movehaus:workout:${sessionId}`); } catch { /* sem rascunho */ } }} className="mt-4"><input type="hidden" name="session_id" value={sessionId} /><button type="submit" className="min-h-10 text-sm text-white/55 underline">Encerrar esta sessão sem concluir (sem pontos)</button></form>
      <section className="mt-6">
        <h2 className="text-base font-semibold text-white">Como foi o esforço?</h2>
        <div className="mt-3 grid grid-cols-11 gap-1" role="group" aria-label="Percepção de esforço de zero a dez">{Array.from({ length: 11 }).map((_, value) => <button type="button" key={value} onClick={() => setRpe(value)} aria-label={`Esforço ${value} de 10`} aria-pressed={rpe === value} className={cn("aspect-square min-w-0 rounded-full border text-[11px] font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red sm:text-xs", rpe === value ? "border-mh-red bg-mh-red text-white" : "border-white/30 text-white/70 hover:border-white/70 hover:text-white")}>{value}</button>)}</div>
        <div className="mt-1 flex justify-between text-[11px] text-white/45"><span>Muito leve</span><span>Máximo</span></div>
      </section>
      <label htmlFor="workout-notes" className="mt-6 block text-sm font-semibold text-white">Observações <span className="font-normal text-white/55">(opcional)</span></label>
      <textarea id="workout-notes" value={notes} onChange={(event) => setNotes(event.target.value)} form="finish-workout" name="discomfort" rows={3} placeholder="Como você se sentiu durante o treino?" className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-[#111216] p-4 text-sm text-white outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-mh-red" />

      <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-3xl bg-[#08090b]/95 px-4 py-3 backdrop-blur-xl sm:px-6"><div className="mx-auto max-w-lg"><form id="finish-workout" action={finishAction}><input type="hidden" name="session_id" value={sessionId} /><input type="hidden" name="logs" value={JSON.stringify(logs)} /><input type="hidden" name="rpe" value={rpe ?? ""} /><FinishButton disabled={exercises.length === 0 || completedExercises !== exercises.length} /></form></div></div>
    </div>
  );
}

type Draft = { entries?: Record<string, Entry>; rpe?: number | null; notes?: string };
export function WorkoutRunner(props: { sessionId: string; dayName: string; exercises: Exercise[]; athleteName: string; dateLabel: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      let saved: Draft = {};
      try { const value = JSON.parse(localStorage.getItem(`movehaus:workout:${props.sessionId}`) ?? "{}"); if (value && typeof value === "object") saved = { entries: value.entries, rpe: Number.isInteger(value.rpe) && value.rpe >= 0 && value.rpe <= 10 ? value.rpe : null, notes: typeof value.notes === "string" ? value.notes : "" }; } catch { /* começa sem rascunho */ }
      if (active) setDraft(saved);
    });
    return () => { active = false; };
  }, [props.sessionId]);
  return draft ? <WorkoutRunnerContent {...props} initialDraft={draft} /> : <p className="p-8 text-sm text-white/60">Recuperando suas séries…</p>;
}
