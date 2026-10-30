"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/user";
import { eventId } from "@/lib/coaching/event-id";
import { POINTS } from "@/lib/coaching/gamification";

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
  const supabase = await createClient();
  const { data: goal, error } = await supabase.from("goals").update({ status: "achieved", achieved_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).neq("status", "achieved").select("title").maybeSingle();
  if (error) throw new Error("Não foi possível confirmar a meta.");
  if (!goal) return;
  const { error: pointsError } = await createAdminClient().from("points_ledger").upsert({ id: eventId(`goal:${id}`), user_id: userId, points: POINTS.goal, reason: `Meta atingida: ${goal.title}` }, { onConflict: "id", ignoreDuplicates: true });
  if (pointsError) throw new Error("Não foi possível registrar os pontos da meta.");
  revalidatePath(`/admin/acompanhamento/${userId}/metas`);
  revalidatePath("/acompanhamento");
  revalidatePath("/minha-area");
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
  if (!["approve", "reject"].includes(decision)) return;
  const supabase = await createClient();
  const { data: redemption, error } = await supabase.from("reward_redemptions").update({ status: decision === "approve" ? "approved" : "rejected", decided_at: new Date().toISOString() }).eq("id", id).eq("status", "pending").select("user_id,points_spent").maybeSingle();
  if (error) throw new Error("Não foi possível atualizar o resgate.");
  if (decision === "reject" && redemption) {
    const { error: refundError } = await createAdminClient().from("points_ledger").upsert({ id: eventId(`reward-refund:${id}`), user_id: redemption.user_id, points: redemption.points_spent, reason: "Estorno de resgate" }, { onConflict: "id", ignoreDuplicates: true });
    if (refundError) throw new Error("Não foi possível estornar os pontos.");
  }
  revalidatePath("/admin/acompanhamento/recompensas");
  revalidatePath("/acompanhamento");
  revalidatePath("/minha-area");
}

// ============ ALUNO: resgatar recompensa ============
export async function redeemReward(fd: FormData): Promise<void> {
  await requireUser("/acompanhamento");
  const rewardId = S(fd.get("reward_id"));
  if (!rewardId) return;

  // Resgate atômico no banco (confere saldo/acesso/recompensa e debita os pontos
  // numa transação com lock por usuário — sem risco de gasto-duplo).
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId });

  revalidatePath("/acompanhamento");
  if (error || data === "invalid") redirect("/acompanhamento");
  if (data === "saldo") redirect("/acompanhamento?resgate=saldo");
  redirect("/acompanhamento?resgate=ok");
}
