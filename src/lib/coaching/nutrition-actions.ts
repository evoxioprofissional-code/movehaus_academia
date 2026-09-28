"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireUser } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";

const S = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const rev = (userId: string) => {
  if (userId) revalidatePath(`/admin/acompanhamento/${userId}/nutricao`);
};

// ============ ADMIN: plano alimentar ============
export async function createMealPlan(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = S(fd.get("user_id"));
  if (!userId) return;
  const supabase = await createClient();
  await supabase.from("meal_plans").insert({
    user_id: userId,
    name: S(fd.get("name")) || "Plano alimentar",
    created_by: admin.id,
  });
  rev(userId);
}

export async function addMeal(fd: FormData): Promise<void> {
  await requireAdmin();
  const planId = S(fd.get("plan_id"));
  if (!planId) return;
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("meals").select("position").eq("plan_id", planId)
    .order("position", { ascending: false }).limit(1).maybeSingle();
  await supabase.from("meals").insert({
    plan_id: planId,
    name: S(fd.get("name")) || "Refeição",
    time_label: S(fd.get("time_label")),
    position: (last?.position ?? 0) + 1,
  });
  rev(S(fd.get("user_id")));
}

export async function updateMeal(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("meals")
    .update({ name: S(fd.get("name")), time_label: S(fd.get("time_label")) })
    .eq("id", S(fd.get("id")));
  rev(S(fd.get("user_id")));
}

export async function deleteMeal(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("meals").delete().eq("id", S(fd.get("id")));
  rev(S(fd.get("user_id")));
}

export async function addMealItem(fd: FormData): Promise<void> {
  await requireAdmin();
  const mealId = S(fd.get("meal_id"));
  if (!mealId) return;
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("meal_items").select("position").eq("meal_id", mealId)
    .order("position", { ascending: false }).limit(1).maybeSingle();
  await supabase.from("meal_items").insert({
    meal_id: mealId,
    food: S(fd.get("food")) || "Alimento",
    quantity: S(fd.get("quantity")),
    substitutions: S(fd.get("substitutions")),
    notes: S(fd.get("notes")),
    position: (last?.position ?? 0) + 1,
  });
  rev(S(fd.get("user_id")));
}

export async function updateMealItem(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("meal_items")
    .update({
      food: S(fd.get("food")),
      quantity: S(fd.get("quantity")),
      substitutions: S(fd.get("substitutions")),
      notes: S(fd.get("notes")),
    })
    .eq("id", S(fd.get("id")));
  rev(S(fd.get("user_id")));
}

export async function deleteMealItem(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("meal_items").delete().eq("id", S(fd.get("id")));
  rev(S(fd.get("user_id")));
}

// ============ ADMIN: receitas ============
export async function createRecipe(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const title = S(fd.get("title"));
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("recipes").insert({
    title,
    description: S(fd.get("description")),
    ingredients: S(fd.get("ingredients")),
    steps: S(fd.get("steps")),
    created_by: admin.id,
  });
  revalidatePath("/admin/acompanhamento/receitas");
}

export async function toggleRecipe(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("recipes").update({ active: fd.get("active") === "true" }).eq("id", S(fd.get("id")));
  revalidatePath("/admin/acompanhamento/receitas");
}

export async function deleteRecipe(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("recipes").delete().eq("id", S(fd.get("id")));
  revalidatePath("/admin/acompanhamento/receitas");
}

// ============ ALUNO: adesão ============
export async function toggleMealDone(fd: FormData): Promise<void> {
  const user = await requireUser("/acompanhamento/nutricao");
  if (!(await hasCoachingAccess())) return;
  const mealId = S(fd.get("meal_id"));
  const done = S(fd.get("done")) === "true";
  if (!mealId) return;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  if (done) {
    await supabase.from("meal_logs").upsert(
      { user_id: user.id, meal_id: mealId, day: today },
      { onConflict: "user_id,meal_id,day" },
    );
  } else {
    await supabase.from("meal_logs").delete()
      .eq("user_id", user.id).eq("meal_id", mealId).eq("day", today);
  }
  revalidatePath("/acompanhamento/nutricao");
}
