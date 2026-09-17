import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string | null;
  whatsapp: string | null;
  email: string | null;
};

/** Usuário autenticado (valida o JWT no servidor). Cacheado por request. */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Perfil do usuário atual. Retorna null se não houver sessão ou tabela. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, whatsapp, email")
      .eq("id", user.id)
      .maybeSingle();
    return data ?? null;
  } catch {
    // Tabela ainda não aplicada — não quebra a página.
    return null;
  }
});

/** True se o usuário atual é admin. Defensivo se a função/tabela não existir. */
export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getUser();
  if (!user) return false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("is_admin");
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
});

/** Exige sessão; redireciona para /login preservando o destino. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/** Exige papel admin; sem sessão vai para /login, sem permissão vai para a home. */
export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  if (!(await isAdmin())) redirect("/");
  return user;
}
