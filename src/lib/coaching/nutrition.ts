import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type MealPlan = Database["public"]["Tables"]["meal_plans"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type MealItem = Database["public"]["Tables"]["meal_items"]["Row"];
export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

export type MealWithItems = Meal & { items: MealItem[] };
export type MealPlanTree = { plan: MealPlan | null; meals: MealWithItems[] };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function getMealPlanTree(userId: string): Promise<MealPlanTree> {
  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!plan) return { plan: null, meals: [] };

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("plan_id", plan.id)
    .order("position", { ascending: true });

  const ids = (meals ?? []).map((m) => m.id);
  const { data: items } = ids.length
    ? await supabase.from("meal_items").select("*").in("meal_id", ids).order("position", { ascending: true })
    : { data: [] as MealItem[] };

  const byMeal = new Map<string, MealItem[]>();
  for (const it of items ?? []) {
    const arr = byMeal.get(it.meal_id) ?? [];
    arr.push(it);
    byMeal.set(it.meal_id, arr);
  }
  return {
    plan,
    meals: (meals ?? []).map((m) => ({ ...m, items: byMeal.get(m.id) ?? [] })),
  };
}

/** IDs das refeições marcadas como feitas hoje. */
export async function getTodayMealLogs(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("meal_logs")
    .select("meal_id")
    .eq("user_id", userId)
    .eq("day", todayISO());
  return new Set((data ?? []).map((r) => r.meal_id));
}

export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}
