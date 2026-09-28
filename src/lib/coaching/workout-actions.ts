"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/user";

const S = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const N = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
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

  // Logs vêm como JSON do cliente.
  try {
    const raw = S(fd.get("logs"));
    const logs = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    const rows = logs
      .filter((l) => l && (l.load_used != null || l.reps_done != null))
      .map((l) => ({
        session_id: sessionId,
        exercise_id: (l.exercise_id as string) || null,
        exercise_name: String(l.exercise_name ?? ""),
        set_number: Number(l.set_number ?? 1),
        reps_done: l.reps_done != null ? Number(l.reps_done) : null,
        load_used: l.load_used != null ? Number(l.load_used) : null,
      }));
    if (rows.length) await supabase.from("exercise_logs").insert(rows);
  } catch {
    // ignora logs malformados
  }

  await supabase
    .from("workout_sessions")
    .update({
      finished_at: new Date().toISOString(),
      feeling: S(fd.get("feeling")) || null,
      discomfort: S(fd.get("discomfort")),
      notes: S(fd.get("notes")),
    })
    .eq("id", sessionId);

  revalidatePath("/acompanhamento");
  redirect("/acompanhamento?treino=concluido");
}
