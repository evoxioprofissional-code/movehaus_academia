import { createClient, createAdminClient } from "@/lib/supabase/server";

export const POINTS = { workout: 10, goal: 50 };

const MILESTONES: { n: number; title: string }[] = [
  { n: 1, title: "Primeiro treino" },
  { n: 5, title: "5 treinos concluídos" },
  { n: 10, title: "10 treinos concluídos" },
  { n: 25, title: "25 treinos concluídos" },
  { n: 50, title: "50 treinos concluídos" },
];

function startOfISOWeek(): string {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 0 = segunda
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day);
  return monday.toISOString();
}

/**
 * Concede pontos por treino concluído e desbloqueia conquistas por marcos.
 * Escrita via service role (não forjável pelo cliente). Chamado no servidor
 * após finalizar uma sessão legítima.
 */
export async function awardWorkoutCompletion(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("points_ledger").insert({
    user_id: userId,
    points: POINTS.workout,
    reason: "Treino concluído",
  });

  const { count } = await admin
    .from("workout_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("finished_at", "is", null);
  const total = count ?? 0;

  const { data: existing } = await admin
    .from("achievements")
    .select("code")
    .eq("user_id", userId);
  const have = new Set((existing ?? []).map((a) => a.code));

  const toInsert = MILESTONES.filter(
    (m) => total >= m.n && !have.has(`workouts_${m.n}`),
  ).map((m) => ({ user_id: userId, code: `workouts_${m.n}`, title: m.title }));

  if (toInsert.length) await admin.from("achievements").insert(toInsert);
}

export type GoalProgress = {
  id: string;
  title: string;
  type: string;
  target: number;
  status: string;
  current: number;
  pct: number;
};

export type Progress = {
  points: number;
  achievements: { code: string; title: string; achieved_at: string }[];
  goals: GoalProgress[];
};

/** Progresso do aluno: pontos, conquistas e metas com progresso calculado. */
export async function getProgress(userId: string): Promise<Progress> {
  const supabase = await createClient();

  const [{ data: bal }, { data: achievements }, { data: goals }, allCount, weekCount] =
    await Promise.all([
      supabase.rpc("points_balance", { uid: userId }),
      supabase
        .from("achievements")
        .select("code, title, achieved_at")
        .eq("user_id", userId)
        .order("achieved_at", { ascending: false }),
      supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("finished_at", "is", null),
      supabase
        .from("workout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("finished_at", "is", null)
        .gte("finished_at", startOfISOWeek()),
    ]);

  const totalWorkouts = allCount.count ?? 0;
  const weekWorkouts = weekCount.count ?? 0;

  const goalProgress: GoalProgress[] = (goals ?? []).map((g) => {
    let current = 0;
    if (g.type === "frequency_week") current = weekWorkouts;
    else if (g.type === "total_workouts") current = totalWorkouts;
    else current = g.status === "achieved" ? g.target : 0;
    const pct =
      g.status === "achieved"
        ? 100
        : g.target > 0
          ? Math.min(100, Math.round((current / g.target) * 100))
          : 0;
    return {
      id: g.id,
      title: g.title,
      type: g.type,
      target: g.target,
      status: g.status,
      current,
      pct,
    };
  });

  return {
    points: (bal as number) ?? 0,
    achievements: achievements ?? [],
    goals: goalProgress,
  };
}

/** Recompensas ativas (loja de pontos). */
export async function getActiveRewards() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("cost_points", { ascending: true });
  return data ?? [];
}

/** Saldo autoritativo (service role) — usado em resgates. */
export async function getPointsBalance(userId: string): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin.rpc("points_balance", { uid: userId });
  return (data as number) ?? 0;
}
