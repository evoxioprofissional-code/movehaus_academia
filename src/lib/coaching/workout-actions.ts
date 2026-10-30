"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { eventId } from "@/lib/coaching/event-id";
import { trainingDate, validateWorkoutLogs } from "@/lib/coaching/workout-rules";
import { getPlanTree, getOpenSession } from "@/lib/coaching/workouts";
import { awardWorkoutCompletion } from "@/lib/coaching/gamification";

const S = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const N = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};
const VALID_METHODS = ["normal", "biset", "triset", "superset", "dropset", "rest_pause", "piramide"];
const METHOD = (v: FormDataEntryValue | null) => {
  const m = S(v);
  return VALID_METHODS.includes(m) ? m : "normal";
};

function adminRevalidate(userId: string) {
  if (userId) revalidatePath(`/admin/acompanhamento/${userId}/treino`);
}

// ============ ADMIN: montar o treino ============
export async function createPlan(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = S(fd.get("user_id"));
  if (!userId) return;
  const supabase = await createClient();
  await supabase.from("workout_plans").insert({
    user_id: userId,
    name: S(fd.get("name")) || "Plano de treino",
    created_by: admin.id,
    active: true,
  });
  adminRevalidate(userId);
}

export async function addDay(fd: FormData): Promise<void> {
  await requireAdmin();
  const planId = S(fd.get("plan_id"));
  const userId = S(fd.get("user_id"));
  if (!planId) return;
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("workout_days")
    .select("position")
    .eq("plan_id", planId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  await supabase.from("workout_days").insert({
    plan_id: planId,
    name: S(fd.get("name")) || "Novo treino",
    weekday: N(fd.get("weekday")),
    position: (last?.position ?? 0) + 1,
  });
  adminRevalidate(userId);
}

export async function updateDay(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = S(fd.get("id"));
  const supabase = await createClient();
  await supabase
    .from("workout_days")
    .update({ name: S(fd.get("name")), weekday: N(fd.get("weekday")) })
    .eq("id", id);
  adminRevalidate(S(fd.get("user_id")));
}

export async function deleteDay(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("workout_days").delete().eq("id", S(fd.get("id")));
  adminRevalidate(S(fd.get("user_id")));
}

export async function addExercise(fd: FormData): Promise<void> {
  await requireAdmin();
  const dayId = S(fd.get("day_id"));
  if (!dayId) return;
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("workout_exercises")
    .select("position")
    .eq("day_id", dayId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  await supabase.from("workout_exercises").insert({
    day_id: dayId,
    name: S(fd.get("name")) || "Exercício",
    sets: Math.max(1, Math.min(50, N(fd.get("sets")) ?? 3)),
    reps: S(fd.get("reps")) || "10-12",
    target_load: S(fd.get("target_load")),
    rest_seconds: N(fd.get("rest_seconds")) ?? 60,
    video_url: S(fd.get("video_url")) || null,
    notes: S(fd.get("notes")),
    method: METHOD(fd.get("method")),
    group_label: S(fd.get("group_label")),
    position: (last?.position ?? 0) + 1,
  });
  adminRevalidate(S(fd.get("user_id")));
}

export async function updateExercise(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("workout_exercises")
    .update({
      name: S(fd.get("name")),
      sets: Math.max(1, Math.min(50, N(fd.get("sets")) ?? 3)),
      reps: S(fd.get("reps")) || "10-12",
      target_load: S(fd.get("target_load")),
      rest_seconds: N(fd.get("rest_seconds")) ?? 60,
      video_url: S(fd.get("video_url")) || null,
      notes: S(fd.get("notes")),
      method: METHOD(fd.get("method")),
      group_label: S(fd.get("group_label")),
    })
    .eq("id", S(fd.get("id")));
  adminRevalidate(S(fd.get("user_id")));
}

export async function deleteExercise(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("workout_exercises").delete().eq("id", S(fd.get("id")));
  adminRevalidate(S(fd.get("user_id")));
}

export async function publishPlan(fd: FormData): Promise<void> {
  await requireAdmin();
  const planId = S(fd.get("plan_id"));
  const userId = S(fd.get("user_id"));
  if (!planId) return;
  const supabase = await createClient();
  await supabase.from("workout_plans").update({ active: true }).eq("id", planId);
  adminRevalidate(userId);
  revalidatePath("/acompanhamento");
}

export async function duplicateDay(fd: FormData): Promise<void> {
  await requireAdmin();
  const dayId = S(fd.get("day_id"));
  const userId = S(fd.get("user_id"));
  if (!dayId) return;
  const supabase = await createClient();
  const { data: source } = await supabase.from("workout_days").select("*").eq("id", dayId).maybeSingle();
  if (!source) return;
  const [{ data: exercises }, { data: last }] = await Promise.all([
    supabase.from("workout_exercises").select("*").eq("day_id", dayId).order("position"),
    supabase.from("workout_days").select("position").eq("plan_id", source.plan_id).order("position", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const { data: copy } = await supabase.from("workout_days").insert({
    plan_id: source.plan_id,
    name: source.name + " — cópia",
    weekday: null,
    position: (last?.position ?? source.position) + 1,
  }).select("id").single();
  if (copy && exercises?.length) {
    await supabase.from("workout_exercises").insert(exercises.map((exercise) => ({
      day_id: copy.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      target_load: exercise.target_load,
      rest_seconds: exercise.rest_seconds,
      video_url: exercise.video_url,
      notes: exercise.notes,
      method: exercise.method,
      group_label: exercise.group_label,
      position: exercise.position,
    })));
  }
  adminRevalidate(userId);
}
// ============ ALUNO: modo treino ============

export async function startSession(fd: FormData): Promise<void> {
  const user = await requireUser("/acompanhamento");
  if (!(await hasCoachingAccess())) redirect("/acompanhamento");
  const dayId = S(fd.get("day_id"));
  const tree = await getPlanTree(user.id);
  const day = tree.days.find((item) => item.id === dayId && item.exercises.length > 0);
  if (!day) redirect("/acompanhamento?treino=indisponivel");
  const open = await getOpenSession(user.id);
  if (open) redirect(`/acompanhamento/treino/${open.id}`);
  const supabase = await createClient();
  const id = eventId(`session:${user.id}:${trainingDate()}:${dayId}`);
  const { data: existing } = await supabase.from("workout_sessions").select("id,finished_at,notes").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (existing?.finished_at) redirect("/acompanhamento?treino=ja_concluido");
  if (existing?.notes === "__abandoned__") {
    await supabase.from("workout_sessions").update({ notes: "" }).eq("id", id).eq("user_id", user.id).is("finished_at", null);
  }
  if (!existing) {
    const { error } = await supabase.from("workout_sessions").insert({ id, user_id: user.id, day_id: day.id, day_name: day.name });
    if (error && error.code !== "23505") redirect("/acompanhamento?treino=erro");
  }
  revalidatePath("/minha-area");
  redirect(`/acompanhamento/treino/${id}`);
}

export type WorkoutState = { error?: string };
export async function finishSession(_state: WorkoutState, fd: FormData): Promise<WorkoutState> {
  const user = await requireUser("/acompanhamento");
  if (!(await hasCoachingAccess())) return { error: "Seu acesso ao acompanhamento não está ativo." };
  const sessionId = S(fd.get("session_id"));
  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase.from("workout_sessions").select("*").eq("id", sessionId).eq("user_id", user.id).maybeSingle();
  if (sessionError || !session) return { error: "Treino não encontrado." };
  if (session.notes === "__abandoned__") return { error: "Esta sessão foi encerrada sem concluir. Inicie novamente pelo plano." };
  if (session.finished_at) redirect("/acompanhamento?treino=ja_concluido");
  if (trainingDate(session.started_at) !== trainingDate()) return { error: "Esta sessão é de outro dia. Volte ao plano e inicie o treino de hoje." };
  const tree = await getPlanTree(user.id);
  const day = tree.days.find((item) => item.id === session.day_id);
  if (!day?.exercises.length) return { error: "O professor alterou o plano. Volte ao seu treino para atualizar." };
  let logs;
  try { logs = validateWorkoutLogs(S(fd.get("logs")), day.exercises); }
  catch (error) { return { error: error instanceof Error ? error.message : "Confira suas séries." }; }
  const { error: logError } = await supabase.from("exercise_logs").upsert(logs.map((log) => ({ ...log, session_id: session.id, id: eventId(`log:${session.id}:${log.exercise_id}:${log.set_number}`) })), { onConflict: "id" });
  if (logError) return { error: "Não foi possível salvar as séries. Tente novamente." };
  const rpeRaw = N(fd.get("rpe"));
  const rpe = rpeRaw != null && rpeRaw >= 0 && rpeRaw <= 10 ? rpeRaw : null;
  const finishedAt = new Date().toISOString();
  const { data: completed, error } = await supabase.from("workout_sessions").update({
    finished_at: finishedAt, feeling: rpe == null ? null : rpe <= 3 ? "leve" : rpe <= 6 ? "adequado" : "pesado",
    discomfort: S(fd.get("discomfort")).slice(0, 2000), notes: S(fd.get("notes")).slice(0, 2000), rpe,
    total_volume_load: Math.round(logs.reduce((sum, log) => sum + log.reps_done * (log.load_used ?? 0), 0) * 100) / 100,
  }).eq("id", session.id).eq("user_id", user.id).is("finished_at", null).select("id").maybeSingle();
  if (error) return { error: "Não foi possível finalizar. Suas séries foram preservadas." };
  if (!completed) redirect("/acompanhamento?treino=ja_concluido");
  try { await awardWorkoutCompletion(user.id, session.id); }
  catch { revalidatePath("/minha-area"); revalidatePath("/acompanhamento"); redirect("/acompanhamento?treino=pontos_pendentes"); }
  revalidatePath("/acompanhamento");
  revalidatePath("/minha-area");
  redirect("/acompanhamento?treino=concluido");
}

export async function abandonSession(fd: FormData): Promise<void> {
  const user = await requireUser("/acompanhamento");
  const { error } = await (await createClient()).from("workout_sessions").update({ notes: "__abandoned__" }).eq("id", S(fd.get("session_id"))).eq("user_id", user.id).is("finished_at", null);
  if (error) throw new Error("Não foi possível encerrar a sessão.");
  revalidatePath("/acompanhamento");
  revalidatePath("/minha-area");
  redirect("/acompanhamento?treino=encerrado");
}
