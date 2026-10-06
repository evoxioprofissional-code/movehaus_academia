"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Dumbbell, Pause, Play, Timer, TrendingUp, UserRound } from "lucide-react";
import { finishSession } from "@/lib/coaching/workout-actions";
import { cn } from "@/lib/utils";

type Exercise = { id: string; name: string; sets: number; reps: string; target_load: string; rest_seconds: number; video_url: string | null; notes: string };
type Entry = { reps: string; load: string; done: boolean };

function suggestedReps(value: string) {
  const match = value.match(/\d+/);
  return match?.[0] ?? "";
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
  if (!playing) return <button type="button" onClick={() => setPlaying(true)} className="relative my-3 grid aspect-video w-full place-items-center overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_35%,#2c3038,#111318_62%)]"><span className="grid size-14 place-items-center rounded-full border border-white/30 bg-black/55 text-white"><Play className="ml-1 size-6 fill-white" /></span><span className="absolute bottom-4 text-xs font-semibold text-white">Ver execução</span></button>;
  if (embed) return <div className="my-3 aspect-video overflow-hidden rounded-lg border border-white/10"><iframe src={embed + "?autoplay=1"} title="Execução do exercício" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" /></div>;
  return <video src={url} controls autoPlay playsInline className="my-3 aspect-video w-full rounded-lg border border-white/10 bg-black object-contain" />;
}

export function WorkoutRunner({ sessionId, dayName, exercises, athleteName, dateLabel }: { sessionId: string; dayName: string; exercises: Exercise[]; athleteName: string; dateLabel: string }) {
  const [entries, setEntries] = useState<Record<string, Entry>>(() => {
    const initial: Record<string, Entry> = {};
    for (const exercise of exercises) for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) initial[exercise.id + ":" + setNumber] = { reps: suggestedReps(exercise.reps), load: exercise.target_load, done: false };
    return initial;
  });
  const [openId, setOpenId] = useState(exercises[0]?.id ?? "");
  const [rest, setRest] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initials = athleteName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AL";

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

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

  const logs = useMemo(() => {
    const result: Record<string, unknown>[] = [];
    for (const exercise of exercises) for (let setNumber = 1; setNumber <= exercise.sets; setNumber++) {
      const entry = entries[exercise.id + ":" + setNumber];
      if (entry?.done) result.push({ exercise_id: exercise.id, exercise_name: exercise.name, set_number: setNumber, reps_done: entry.reps ? Number(entry.reps) : null, load_used: entry.load ? Number(entry.load.replace(",", ".")) : null });
    }
    return result;
  }, [entries, exercises]);

  return <div className="fixed inset-0 z-[100] overflow-hidden bg-[#050608] sm:p-3">
    <div className="mx-auto flex h-full max-w-[430px] flex-col overflow-hidden bg-[#08090b] sm:rounded-[28px] sm:border sm:border-[#363a43] sm:shadow-2xl">
      <header className="shrink-0 px-4 pb-3 pt-2">
        <div className="flex items-center justify-between text-[10px] font-semibold text-white"><span>9:41</span><span className="tracking-[0.16em]">●●●</span></div>
        <div className="mt-2 flex items-center justify-between"><Link href="/acompanhamento" className="text-[21px] font-bold tracking-[-0.05em] text-white">Move<span className="text-mh-red">Haus</span></Link><span className="grid size-9 place-items-center rounded-full bg-[#292d35] text-[11px] font-semibold text-white">{initials}</span></div>
        <h1 className="mt-2 text-[22px] font-bold leading-tight tracking-[-0.03em] text-white">Seu treino de hoje</h1><p className="mt-0.5 text-xs text-[#959ba7]">{dateLabel}</p>
        <div className="mt-3 flex items-end justify-between"><div><h2 className="text-[15px] font-semibold text-white">{dayName}</h2><p className="text-[10px] text-[#8f95a1]">{exercises.length} exercícios</p></div><p className="text-[10px] text-[#a0a6b1]">{completedExercises} de {exercises.length} concluídos</p></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mh-red transition-[width] duration-300" style={{ width: progress + "%" }} /></div>
      </header>

      <main className="admin-scrollbar flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {exercises.length === 0 && <div className="rounded-xl border border-white/10 bg-[#111318] p-6 text-center text-sm text-[#969ca8]">Seu professor ainda não adicionou exercícios a este treino.</div>}
        {exercises.map((exercise, exerciseIndex) => {
          const expanded = openId === exercise.id;
          const complete = exerciseDone(exercise);
          return <section key={exercise.id} className={cn("overflow-hidden rounded-xl border bg-[#111318]", expanded ? "border-mh-red/60" : "border-white/10")}>
            <button type="button" onClick={() => setOpenId(expanded ? "" : exercise.id)} className="flex w-full items-center gap-3 p-3 text-left"><span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold", expanded ? "bg-mh-red text-white" : "bg-[#252932] text-white")}>{exerciseIndex + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold text-white">{exercise.name}</span><span className="block truncate text-[10px] text-[#9298a4]">{exercise.sets} séries · {exercise.reps}{exercise.target_load ? " · " + exercise.target_load + " kg" : ""}</span></span>{complete ? <Check className="size-5 rounded-full bg-emerald-400 p-1 text-black" /> : <ChevronDown className={cn("size-4 text-[#9298a4] transition-transform", expanded && "rotate-180")} />}</button>
            {expanded && <div className="border-t border-white/10 px-3 pb-3">
              {exercise.video_url && <ExerciseVideo url={exercise.video_url} />}
              <div className="mt-2 grid grid-cols-[36px_1fr_1fr_44px] px-1 pb-1 text-center text-[9px] text-[#9298a4]"><span>Série</span><span>Reps</span><span>Carga (kg)</span><span>Concluir</span></div>
              <div className="space-y-1">{Array.from({ length: exercise.sets }).map((_, setIndex) => {
                const setNumber = setIndex + 1;
                const key = exercise.id + ":" + setNumber;
                const entry = entries[key];
                const firstPending = !entry.done && Array.from({ length: setIndex }, (_, previous) => entries[exercise.id + ":" + (previous + 1)]?.done).every(Boolean);
                return <div key={key} className={cn("grid grid-cols-[36px_1fr_1fr_44px] items-center rounded-lg border px-1 py-1.5", firstPending ? "border-mh-red bg-mh-red/[0.04]" : "border-transparent")}><span className="text-center text-xs text-white">{setNumber}</span><input inputMode="numeric" aria-label={"Repetições da série " + setNumber} value={entry.reps} onChange={(event) => patch(key, { reps: event.target.value })} className="h-8 min-w-0 bg-transparent text-center text-xs text-white outline-none" /><input inputMode="decimal" aria-label={"Carga da série " + setNumber} value={entry.load} onChange={(event) => patch(key, { load: event.target.value })} className="h-8 min-w-0 border-l border-white/10 bg-transparent text-center text-xs text-white outline-none" /><button type="button" onClick={() => { const next = !entry.done; patch(key, { done: next }); if (next) startRest(exercise.rest_seconds || 60); }} aria-label={entry.done ? "Desmarcar série" : "Concluir série"} className={cn("mx-auto grid size-6 place-items-center rounded-full border", entry.done ? "border-emerald-400 bg-emerald-400 text-black" : "border-[#68707e] text-transparent")}><Check className="size-3.5" /></button></div>;
              })}</div>
              {rest !== null && <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#1a1d23] p-3"><span className="grid size-10 place-items-center rounded-full bg-[#2b3039]"><Timer className="size-5 text-white" /></span><div><p className="text-[9px] text-[#9298a4]">Descanso</p><p className="text-xl font-bold tabular-nums text-white">{String(Math.floor(rest / 60)).padStart(2, "0")}:{String(rest % 60).padStart(2, "0")}</p></div>{rest === 0 ? <button type="button" onClick={() => startRest(exercise.rest_seconds || 60)} className="ml-auto grid size-9 place-items-center rounded-md border border-mh-red text-mh-red"><Play className="size-4" /></button> : <button type="button" onClick={stopRest} className="ml-auto flex h-9 items-center gap-1.5 rounded-md border border-mh-red px-3 text-[10px] font-semibold text-mh-red"><Pause className="size-3.5" />Pular</button>}</div>}
              {exercise.notes && <div className="mt-3 rounded-lg bg-[#171a1f] p-3"><p className="text-[9px] text-[#9298a4]">Orientação do professor</p><p className="mt-1 text-[11px] leading-relaxed text-white/80">{exercise.notes}</p></div>}
            </div>}
          </section>;
        })}
        <details className="rounded-xl border border-white/10 bg-[#111318] p-3"><summary className="cursor-pointer list-none text-xs font-medium text-[#a3a9b4]">Como foi o treino? <span className="text-white">Adicionar observação</span></summary><div className="mt-3 space-y-3"><div className="grid grid-cols-3 gap-2">{["leve", "adequado", "pesado"].map((feeling, index) => <label key={feeling}><input form="finish-workout" type="radio" name="feeling" value={feeling} defaultChecked={index === 1} className="peer sr-only" /><span className="flex h-9 cursor-pointer items-center justify-center rounded-md border border-white/10 text-[10px] capitalize text-[#999faa] peer-checked:border-mh-red peer-checked:text-white">{feeling}</span></label>)}</div><textarea form="finish-workout" name="discomfort" rows={2} placeholder="Dor ou desconforto? (opcional)" className="w-full resize-none rounded-lg border border-white/10 bg-[#0b0d10] p-3 text-xs text-white outline-none placeholder:text-[#6f7682] focus:border-mh-red" /></div></details>
      </main>

      <footer className="shrink-0 border-t border-white/10 bg-[#090a0c] px-3 pt-2">
        <form id="finish-workout" action={finishSession}><input type="hidden" name="session_id" value={sessionId} /><input type="hidden" name="logs" value={JSON.stringify(logs)} /><button type="submit" disabled={exercises.length === 0} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-mh-red text-sm font-semibold text-white disabled:opacity-40"><Check className="size-5" />Finalizar treino</button></form>
        <nav className="grid grid-cols-3 py-2 text-[9px]"><Link href="/acompanhamento" className="flex flex-col items-center gap-1 text-mh-red"><Dumbbell className="size-5" />Treino</Link><Link href="/acompanhamento/corpo" className="flex flex-col items-center gap-1 text-[#9298a4]"><TrendingUp className="size-5" />Evolução</Link><Link href="/acompanhamento" className="flex flex-col items-center gap-1 text-[#9298a4]"><UserRound className="size-5" />Professor</Link></nav>
      </footer>
    </div>
  </div>;
}
