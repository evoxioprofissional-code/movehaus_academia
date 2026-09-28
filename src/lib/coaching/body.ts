import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Metric = Database["public"]["Tables"]["body_metrics"]["Row"];
export type Checkin = Database["public"]["Tables"]["checkins"]["Row"];
export type Hydration = Database["public"]["Tables"]["hydration_logs"]["Row"];
export type Photo = Database["public"]["Tables"]["progress_photos"]["Row"] & {
  url: string | null;
};

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getBodyData(userId: string) {
  const supabase = await createClient();
  const [{ data: metrics }, { data: hyd }, { data: checkins }, { data: photoRows }] =
    await Promise.all([
      supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("measured_on", { ascending: false })
        .limit(30),
      supabase
        .from("hydration_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("day", todayISO())
        .maybeSingle(),
      supabase
        .from("checkins")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", userId)
        .order("taken_on", { ascending: false })
        .limit(30),
    ]);

  // URLs assinadas para as fotos privadas (geradas no servidor).
  let photos: Photo[] = [];
  const rows = photoRows ?? [];
  if (rows.length) {
    const admin = createAdminClient();
    const { data: signed } = await admin.storage
      .from("progress")
      .createSignedUrls(rows.map((r) => r.storage_path), 3600);
    const urlByPath = new Map(
      (signed ?? []).map((s) => [s.path ?? "", s.signedUrl]),
    );
    photos = rows.map((r) => ({ ...r, url: urlByPath.get(r.storage_path) ?? null }));
  }

  const hydration: Hydration =
    hyd ?? { user_id: userId, day: todayISO(), total_ml: 0, goal_ml: 2000, updated_at: "" };

  return {
    metrics: (metrics ?? []) as Metric[],
    latest: (metrics ?? [])[0] ?? null,
    hydration,
    checkins: (checkins ?? []) as Checkin[],
    photos,
  };
}
