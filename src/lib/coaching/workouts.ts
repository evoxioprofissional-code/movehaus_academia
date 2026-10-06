import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Plan = Database["public"]["Tables"]["workout_plans"]["Row"];
export type Day = Database["public"]["Tables"]["workout_days"]["Row"];
export type Exercise = Database["public"]["Tables"]["workout_exercises"]["Row"];
export type Session = Database["public"]["Tables"]["workout_sessions"]["Row"];
export type ExerciseLog = Database["public"]["Tables"]["exercise_logs"]["Row"];

export type DayWithExercises = Day & { exercises: Exercise[] };
export type PlanTree = { plan: Plan | null; days: DayWithExercises[] };

export const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** 1=seg .. 7=dom para a data atual. */
export function todayWeekday(): number {
  return ((new Date().getDay() + 6) % 7) + 1;
}

/** Plano ativo de um usuário + dias e exercícios ordenados. */
export async function getPlanTree(userId: string): Promise<PlanTree> {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!plan) return { plan: null, days: [] };

  const { data: days } = await supabase
    .from("workout_days")
    .select("*")
    .eq("plan_id", plan.id)
    .order("position", { ascending: true });

  const dayIds = (days ?? []).map((d) => d.id);
  const { data: exercises } = dayIds.length
    ? await supabase
        .from("workout_exercises")
        .select("*")
        .in("day_id", dayIds)
        .order("position", { ascending: true })
    : { data: [] as Exercise[] };

  const byDay = new Map<string, Exercise[]>();
  for (const ex of exercises ?? []) {
    const arr = byDay.get(ex.day_id) ?? [];
    arr.push(ex);
    byDay.set(ex.day_id, arr);
  }

  return {
    plan,
    days: (days ?? []).map((d) => ({ ...d, exercises: byDay.get(d.id) ?? [] })),
  };
}

/** Dia de uma sessão (para o modo treino) com seus exercícios. */
export async function getSessionWithExercises(sessionId: string) {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return { session: null, exercises: [] as Exercise[] };

  let exercises: Exercise[] = [];
  if (session.day_id) {
    const { data } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("day_id", session.day_id)
      .order("position", { ascending: true });
    exercises = data ?? [];
  }
  return { session, exercises };
}

/** Últimas sessões concluídas do usuário. */
export async function getRecentSessions(userId: string, limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .not("finished_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/** Sessão ainda não finalizada do aluno, usada para retomar sem duplicar treino. */
export async function getOpenSession(userId: string, dayId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1);

  if (dayId) query = query.eq("day_id", dayId);
  const { data } = await query.maybeSingle();
  return data ?? null;
}

/** Cargas registradas por exercício (evolução) — últimos registros. */
export async function getLoadHistory(userId: string, limit = 30) {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId);
  const ids = (sessions ?? []).map((s) => s.id);
  if (ids.length === 0) return [] as ExerciseLog[];
  const { data } = await supabase
    .from("exercise_logs")
    .select("*")
    .in("session_id", ids)
    .not("load_used", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
