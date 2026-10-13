"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/user";
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
    sets: N(fd.get("sets")) ?? 3,
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
      sets: N(fd.get("sets")) ?? 3,
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
  const user = await requireUser();
  const dayId = S(fd.get("day_id"));
  if (!dayId) return;
  const supabase = await createClient();
  // Confirma que o dia pertence ao aluno (RLS só devolve dias próprios).
  const { data: day } = await supabase
    .from("workout_days")
    .select("id, name")
    .eq("id", dayId)
    .maybeSingle();
  if (!day) redirect("/acompanhamento");

  const { data: openSession } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("day_id", day!.id)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (openSession) redirect(`/acompanhamento/treino/${openSession.id}`);

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: user.id, day_id: day!.id, day_name: day!.name })
    .select("id")
    .single();
  if (error || !session) redirect("/acompanhamento");
  redirect(`/acompanhamento/treino/${session!.id}`);
}

export async function finishSession(fd: FormData): Promise<void> {
  const user = await requireUser();
  const sessionId = S(fd.get("session_id"));
  if (!sessionId) return;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session || session.user_id !== user.id) redirect("/acompanhamento");

  // Logs vêm como JSON do cliente. Calcula o volume load total (Σ reps × carga).
  let totalVolume = 0;
  try {
    const raw = S(fd.get("logs"));
    const logs = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    const rows = logs
      .filter((l) => l && (l.load_used != null || l.reps_done != null))
      .map((l) => {
        const reps = l.reps_done != null ? Number(l.reps_done) : null;
        const load = l.load_used != null ? Number(l.load_used) : null;
        if (reps != null && load != null && Number.isFinite(reps) && Number.isFinite(load)) {
          totalVolume += reps * load;
        }
        return {
          session_id: sessionId,
          exercise_id: (l.exercise_id as string) || null,
          exercise_name: String(l.exercise_name ?? ""),
          set_number: Number(l.set_number ?? 1),
          reps_done: reps,
          load_used: load,
        };
      });
    if (rows.length) await supabase.from("exercise_logs").insert(rows);
  } catch {
    // ignora logs malformados
    totalVolume = 0;
  }

  // PSE (0-10). Deriva o "como foi" (leve/adequado/pesado) a partir da PSE.
  const rpeRaw = N(fd.get("rpe"));
  const rpe = rpeRaw != null && rpeRaw >= 0 && rpeRaw <= 10 ? rpeRaw : null;
  const feelingFromRpe = rpe == null ? null : rpe <= 3 ? "leve" : rpe <= 6 ? "adequado" : "pesado";

  await supabase
    .from("workout_sessions")
    .update({
      finished_at: new Date().toISOString(),
      feeling: feelingFromRpe ?? (S(fd.get("feeling")) || null),
      discomfort: S(fd.get("discomfort")),
      notes: S(fd.get("notes")),
      rpe,
      total_volume_load: Math.round(totalVolume * 100) / 100,
    })
    .eq("id", sessionId);

  // Pontos + conquistas (via service role).
  try {
    await awardWorkoutCompletion(user.id);
  } catch {
    // não bloqueia a finalização do treino
  }

  revalidatePath("/acompanhamento");
  redirect("/acompanhamento?treino=concluido");
}
