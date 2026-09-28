"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/user";
import { hasCoachingAccess } from "@/lib/coaching/access";
import { todayISO } from "@/lib/coaching/body";

const S = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const num = (v: FormDataEntryValue | null): number | null => {
  const s = S(v).replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const int = (v: FormDataEntryValue | null): number | null => {
  const n = num(v);
  return n == null ? null : Math.round(n);
};

async function guard() {
  const user = await requireUser("/acompanhamento");
  if (!(await hasCoachingAccess())) return null;
  return user;
}

export async function addMetrics(fd: FormData): Promise<void> {
  const user = await guard();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("body_metrics").insert({
    user_id: user.id,
    measured_on: S(fd.get("measured_on")) || todayISO(),
    weight: num(fd.get("weight")),
    waist: num(fd.get("waist")),
    hip: num(fd.get("hip")),
    arm: num(fd.get("arm")),
    chest: num(fd.get("chest")),
    thigh: num(fd.get("thigh")),
    body_fat: num(fd.get("body_fat")),
    notes: S(fd.get("notes")),
  });
  revalidatePath("/acompanhamento/corpo");
}

export async function addWater(fd: FormData): Promise<void> {
  const user = await guard();
  if (!user) return;
  const amount = int(fd.get("amount")) ?? 0;
  const supabase = await createClient();
  const { data: cur } = await supabase
    .from("hydration_logs")
    .select("total_ml, goal_ml")
    .eq("user_id", user.id)
    .eq("day", todayISO())
    .maybeSingle();
  const total = Math.max(0, (cur?.total_ml ?? 0) + amount);
  await supabase.from("hydration_logs").upsert(
    { user_id: user.id, day: todayISO(), total_ml: total, goal_ml: cur?.goal_ml ?? 2000 },
    { onConflict: "user_id,day" },
  );
  revalidatePath("/acompanhamento/corpo");
}

export async function setWaterGoal(fd: FormData): Promise<void> {
  const user = await guard();
  if (!user) return;
  const goal = int(fd.get("goal_ml")) ?? 2000;
  const supabase = await createClient();
  const { data: cur } = await supabase
    .from("hydration_logs")
    .select("total_ml")
    .eq("user_id", user.id)
    .eq("day", todayISO())
    .maybeSingle();
  await supabase.from("hydration_logs").upsert(
    { user_id: user.id, day: todayISO(), total_ml: cur?.total_ml ?? 0, goal_ml: Math.max(250, goal) },
    { onConflict: "user_id,day" },
  );
  revalidatePath("/acompanhamento/corpo");
}

export async function submitCheckin(fd: FormData): Promise<void> {
  const user = await guard();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("checkins").insert({
    user_id: user.id,
    week_start: todayISO(),
    energy: int(fd.get("energy")),
    sleep: int(fd.get("sleep")),
    nutrition: int(fd.get("nutrition")),
    disposition: int(fd.get("disposition")),
    pain: S(fd.get("pain")),
    difficulty: S(fd.get("difficulty")),
    notes: S(fd.get("notes")),
  });
  revalidatePath("/acompanhamento/corpo");
}

export async function uploadProgressPhoto(fd: FormData): Promise<void> {
  const user = await guard();
  if (!user) return;
  const file = fd.get("photo") as File | null;
  if (!file || file.size === 0) return;
  if (file.size > 8 * 1024 * 1024) return; // 8MB
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("progress")
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) return;
  const supabase = await createClient();
  await supabase.from("progress_photos").insert({
    user_id: user.id,
    storage_path: path,
    taken_on: S(fd.get("taken_on")) || todayISO(),
    note: S(fd.get("note")),
  });
  revalidatePath("/acompanhamento/corpo");
}

export async function deleteProgressPhoto(fd: FormData): Promise<void> {
  const user = await guard();
  if (!user) return;
  const id = S(fd.get("id"));
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("progress_photos")
    .select("id, storage_path, user_id")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.user_id !== user.id) return;
  await createAdminClient().storage.from("progress").remove([row.storage_path]);
  await supabase.from("progress_photos").delete().eq("id", id);
  revalidatePath("/acompanhamento/corpo");
}
