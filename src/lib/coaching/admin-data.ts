import { createClient } from "@/lib/supabase/server";

export type CoachingMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  role: string;
  hasAccess: boolean;
  source: string | null;
  expires_at: string | null;
};

/** Lista clientes com o status de acesso à área de Acompanhamento. */
export async function listCoachingMembers(): Promise<CoachingMember[]> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: roles }, { data: access }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, whatsapp")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("coaching_access").select("user_id, active, source, expires_at"),
    ]);

  const roleById = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
  const accessById = new Map((access ?? []).map((a) => [a.user_id, a]));

  return (profiles ?? []).map((p) => {
    const a = accessById.get(p.id);
    const valid =
      !!a?.active && (!a.expires_at || new Date(a.expires_at) > new Date());
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      whatsapp: p.whatsapp,
      role: roleById.get(p.id) ?? "customer",
      hasAccess: valid,
      source: a?.source ?? null,
      expires_at: a?.expires_at ?? null,
    };
  });
}
