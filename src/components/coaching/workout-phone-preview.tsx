import { Check, ChevronDown, Dumbbell, Play, Timer, TrendingUp, UserRound } from "lucide-react";
import type { DayWithExercises } from "@/lib/coaching/workouts";

export function WorkoutPhonePreview({ athleteName, day }: { athleteName: string; day: DayWithExercises | null }) {
  const initials = athleteName.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AL";
  const exercises = day?.exercises ?? [];
  return (
    <aside className="sticky top-4 hidden xl:block" aria-label="Prévia do aluno">
      <div className="mx-auto flex h-[690px] w-[300px] flex-col overflow-hidden rounded-[30px] border border-[#363a43] bg-[#08090b] p-2 shadow-2xl">
        <div className="flex items-center justify-between px-3 pb-2 pt-1 text-[9px] font-semibold text-white"><span>9:41</span><span className="tracking-[0.18em]">●●●</span></div>
        <div className="flex items-center justify-between px-2"><p className="text-lg font-bold tracking-[-0.05em] text-white">Move<span className="text-admin-red">Haus</span></p><span className="grid size-8 place-items-center rounded-full bg-[#2a2e36] text-[10px] font-semibold text-white">{initials}</span></div>
        <div className="px-2 pt-2"><h2 className="text-[18px] font-bold leading-tight text-white">Seu treino de hoje</h2><p className="mt-0.5 text-[10px] text-[#9298a5]">Plano personalizado</p><div className="mt-3 flex items-end justify-between"><div><p className="text-[13px] font-semibold text-white">{day?.name || "Treino"}</p><p className="text-[9px] text-[#8d94a1]">{exercises.length} exercícios</p></div><p className="text-[9px] text-[#8d94a1]">0 de {exercises.length}</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[18%] rounded-full bg-admin-red" /></div></div>
        <div className="admin-scrollbar mt-2 flex-1 space-y-1.5 overflow-y-auto px-1.5 pb-2">
          {exercises.length === 0 ? <div className="rounded-lg border border-admin-border bg-admin-card p-4 text-center text-[11px] text-admin-muted">Adicione exercícios para visualizar o treino.</div> : exercises.slice(0, 4).map((exercise, index) => {
            const expanded = index === Math.min(1, exercises.length - 1);
            return <div key={exercise.id} className={expanded ? "overflow-hidden rounded-lg border border-admin-red/55 bg-admin-card" : "rounded-lg border border-admin-border bg-admin-card"}>
              <div className="flex items-center gap-2 p-2"><span className={expanded ? "grid size-7 place-items-center rounded-full bg-admin-red text-[11px] font-bold text-white" : "grid size-7 place-items-center rounded-full bg-[#252931] text-[11px] font-semibold text-white"}>{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-white">{exercise.name}</p><p className="truncate text-[8px] text-admin-muted">{exercise.sets} séries · {exercise.reps}{exercise.target_load ? " · " + exercise.target_load + " kg" : ""}</p></div>{index === 0 ? <Check className="size-4 text-emerald-400" /> : <ChevronDown className="size-3 text-admin-muted" />}</div>
              {expanded && <div className="border-t border-admin-border px-2 pb-2">
                {exercise.video_url && <div className="relative my-2 grid aspect-video place-items-center overflow-hidden rounded-md bg-[#171a20]"><span className="grid size-10 place-items-center rounded-full border border-white/30 bg-black/60"><Play className="ml-0.5 size-4 fill-white text-white" /></span><span className="absolute bottom-2 text-[8px] font-semibold text-white">Ver execução</span></div>}
                <div className="grid grid-cols-[30px_1fr_1fr_34px] py-1 text-center text-[7px] text-admin-muted"><span>Série</span><span>Reps</span><span>Carga</span><span>Feito</span></div>
                {Array.from({ length: Math.min(exercise.sets, 4) }).map((_, setIndex) => <div key={setIndex} className={setIndex === 1 ? "grid grid-cols-[30px_1fr_1fr_34px] items-center rounded border border-admin-red px-1 py-1 text-center text-[9px] text-white" : "grid grid-cols-[30px_1fr_1fr_34px] items-center px-1 py-1 text-center text-[9px] text-white"}><span>{setIndex + 1}</span><span>{exercise.reps.split("-")[0]}</span><span>{exercise.target_load || "—"}</span><span className="mx-auto size-3 rounded-full border border-[#727987]" /></div>)}
                <div className="mt-2 flex items-center gap-2 rounded-md bg-[#1a1d23] px-2 py-2"><Timer className="size-4 text-white" /><div><p className="text-[7px] text-admin-muted">Descanso</p><p className="text-[13px] font-bold tabular-nums text-white">01:12</p></div><span className="ml-auto rounded border border-admin-red px-2 py-1 text-[8px] font-semibold text-admin-red">Pular</span></div>
                {exercise.notes && <div className="mt-2 rounded-md bg-[#15181d] p-2"><p className="text-[7px] text-admin-muted">Orientação do professor</p><p className="mt-0.5 line-clamp-3 text-[8px] leading-relaxed text-white/80">{exercise.notes}</p></div>}
              </div>}
            </div>;
          })}
        </div>
        <button type="button" className="mx-1.5 flex h-10 items-center justify-center gap-2 rounded-md bg-admin-red text-[11px] font-semibold text-white"><Check className="size-4" />Finalizar treino</button>
        <div className="grid grid-cols-3 px-2 py-2 text-[7px]"><span className="flex flex-col items-center gap-1 text-admin-red"><Dumbbell className="size-4" />Treino</span><span className="flex flex-col items-center gap-1 text-admin-muted"><TrendingUp className="size-4" />Evolução</span><span className="flex flex-col items-center gap-1 text-admin-muted"><UserRound className="size-4" />Professor</span></div>
      </div>
    </aside>
  );
}
