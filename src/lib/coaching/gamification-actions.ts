"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { getPointsBalance, POINTS } from "@/lib/coaching/gamification";

const S = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const NUM = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

// ============ ADMIN: metas ============
export async function createGoal(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = S(fd.get("user_id"));
  const title = S(fd.get("title"));
  if (!userId || !title) return;
  const type = S(fd.get("type")) || "custom";
  const supabase = await createClient();
  await supabase.from("goals").insert({
    user_id: userId,
    title,
    type,
    target: NUM(fd.get("target")) || 1,
    period: type === "frequency_week" ? "week" : type === "total_workouts" ? "all" : null,
    created_by: admin.id,
  });
  revalidatePath(`/admin/acompanhamento/${userId}/metas`);
}

export async function deleteGoal(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", S(fd.get("id")));
  revalidatePath(`/admin/acompanhamento/${S(fd.get("user_id"))}/metas`);
}

export async function markGoalAchieved(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = S(fd.get("id"));
  const userId = S(fd.get("user_id"));
  const title = S(fd.get("title"));
  const supabase = await createClient();
  await supabase
    .from("goals")
    .update({ status: "achieved", achieved_at: new Date().toISOString() })
    .eq("id", id);
  // Bônus de pontos pela meta (via service role).
  const adminDb = createAdminClient();
  await adminDb.from("points_ledger").insert({
    user_id: userId,
    points: POINTS.goal,
    reason: `Meta atingida: ${title}`,
  });
  revalidatePath(`/admin/acompanhamento/${userId}/metas`);
}

// ============ ADMIN: recompensas ============
export async function createReward(fd: FormData): Promise<void> {
  await requireAdmin();
  const title = S(fd.get("title"));
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("rewards").insert({
    title,
    description: S(fd.get("description")),
    cost_points: Math.round(NUM(fd.get("cost_points"))),
    type: S(fd.get("type")) || "other",
    active: fd.get("active") !== "off",
  });
  revalidatePath("/admin/acompanhamento/recompensas");
}

export async function toggleReward(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("rewards")
    .update({ active: fd.get("active") === "true" })
    .eq("id", S(fd.get("id")));
  revalidatePath("/admin/acompanhamento/recompensas");
}

export async function deleteReward(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("rewards").delete().eq("id", S(fd.get("id")));
  revalidatePath("/admin/acompanhamento/recompensas");
}

export async function decideRedemption(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = S(fd.get("id"));
  const decision = S(fd.get("decision")); // approve | reject
  const userId = S(fd.get("user_id"));
  const points = Math.round(NUM(fd.get("points")));
  const supabase = await createClient();
  await supabase
    .from("reward_redemptions")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  // Reembolsa pontos se rejeitado.
  if (decision === "reject" && points > 0) {
    const adminDb = createAdminClient();
    await adminDb.from("points_ledger").insert({
      user_id: userId,
      points,
      reason: "Estorno de resgate",
    });
  }
  revalidatePath("/admin/acompanhamento/recompensas");
}

// ============ ALUNO: resgatar recompensa ============
export async function redeemReward(fd: FormData): Promise<void> {
  const user = await requireUser("/acompanhamento");
  if (!(await hasCoachingAccess())) redirect("/acompanhamento");
  const rewardId = S(fd.get("reward_id"));
  if (!rewardId) return;

  const adminDb = createAdminClient();
  const { data: reward } = await adminDb
    .from("rewards")
    .select("id, title, cost_points, active")
    .eq("id", rewardId)
    .maybeSingle();
  if (!reward || !reward.active) redirect("/acompanhamento");

  const balance = await getPointsBalance(user.id);
  if (balance < reward!.cost_points) {
    redirect("/acompanhamento?resgate=saldo");
  }

  await adminDb.from("reward_redemptions").insert({
    user_id: user.id,
    reward_id: reward!.id,
    reward_title: reward!.title,
    points_spent: reward!.cost_points,
    status: "pending",
  });
  await adminDb.from("points_ledger").insert({
    user_id: user.id,
    points: -reward!.cost_points,
    reason: `Resgate: ${reward!.title}`,
  });

  revalidatePath("/acompanhamento");
  redirect("/acompanhamento?resgate=ok");
}
