export function trainingDate(value: string | Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function trainingDayStart(value: string | Date = new Date()) {
  return `${trainingDate(value)}T00:00:00-03:00`;
}

export function validateWorkoutLogs(raw: string, exercises: { id: string; name: string; sets: number }[]) {
  if (!exercises.length || raw.length > 100000) throw new Error("Este treino ainda não está pronto.");
  const logs = JSON.parse(raw);
  if (!Array.isArray(logs)) throw new Error("Não foi possível ler as séries.");
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const seen = new Set<string>();
  const rows = logs.map((log) => {
    const exercise = byId.get(log?.exercise_id);
    const set = Number(log?.set_number);
    const reps = Number(log?.reps_done);
    const load = log?.load_used == null ? null : Number(log.load_used);
    const key = `${exercise?.id}:${set}`;
    if (!exercise || !Number.isInteger(set) || set < 1 || set > exercise.sets || seen.has(key) || !Number.isInteger(reps) || reps < 1 || reps > 1000 || (load != null && (!Number.isFinite(load) || load < 0 || load > 2000))) throw new Error("Confira as repetições e cargas das séries marcadas.");
    seen.add(key);
    return { exercise_id: exercise.id, exercise_name: exercise.name, set_number: set, reps_done: reps, load_used: load };
  });
  if (rows.length !== exercises.reduce((total, exercise) => total + exercise.sets, 0)) throw new Error("Conclua todas as séries antes de finalizar o treino.");
  return rows;
}
