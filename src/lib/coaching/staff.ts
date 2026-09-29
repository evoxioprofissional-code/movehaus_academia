import { createClient } from "@/lib/supabase/server";

export type StaffMember = {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  lastSession: string | null;
  weekWorkouts: number;
  engaged: boolean;
};

export type StaffOverview = {
  members: StaffMember[];
  total: number;
  engaged: number;
  disengaged: number;
  weekWorkouts: number;
};

const DAY = 86400000;

export async function getStaffOverview(): Promise<StaffOverview> {
  const supabase = await createClient();
  const { data: access } = await supabase
    .from("coaching_access")
    .select("user_id")
    .eq("active", true);
  const ids = (access ?? []).map((a) => a.user_id);

  if (ids.length === 0) {
    return { members: [], total: 0, engaged: 0, disengaged: 0, weekWorkouts: 0 };
  }

  const [{ data: profiles }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, whatsapp").in("id", ids),
    supabase
      .from("workout_sessions")
      .select("user_id, finished_at")
      .in("user_id", ids)
      .not("finished_at", "is", null),
  ]);

  const now = Date.now();
  const weekStart = (() => {
    const d = new Date();
    const day = (d.getDay() + 6) % 7;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d.getTime();
  })();

  const byUser = new Map<string, { last: number | null; week: number }>();
  for (const s of sessions ?? []) {
    if (!s.finished_at) continue;
    const t = new Date(s.finished_at).getTime();
    const cur = byUser.get(s.user_id) ?? { last: null, week: 0 };
    cur.last = cur.last == null ? t : Math.max(cur.last, t);
    if (t >= weekStart) cur.week += 1;
    byUser.set(s.user_id, cur);
  }

  const members: StaffMember[] = (profiles ?? []).map((p) => {
    const agg = byUser.get(p.id) ?? { last: null, week: 0 };
    const engaged = agg.last != null && now - agg.last <= 7 * DAY;
    return {
      id: p.id,
      name: p.full_name || p.email || "Aluno",
      email: p.email,
      whatsapp: p.whatsapp,
      lastSession: agg.last ? new Date(agg.last).toISOString() : null,
      weekWorkouts: agg.week,
      engaged,
    };
  });

  members.sort((a, b) => Number(a.engaged) - Number(b.engaged)); // desengajados primeiro
  const engaged = members.filter((m) => m.engaged).length;
  const weekWorkouts = members.reduce((n, m) => n + m.weekWorkouts, 0);

  return {
    members,
    total: members.length,
    engaged,
    disengaged: members.length - engaged,
    weekWorkouts,
  };
}
