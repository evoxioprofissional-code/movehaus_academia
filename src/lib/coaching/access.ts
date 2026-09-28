import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/user";

/**
 * True se o usuário atual tem acesso válido à área de Acompanhamento.
 * Fonte da verdade: função has_coaching_access() no banco (SECURITY DEFINER).
 * Defensivo: em erro/sem sessão, retorna false (falha fechado).
 */
export const hasCoachingAccess = cache(async (): Promise<boolean> => {
  const user = await getUser();
  if (!user) return false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("has_coaching_access");
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
});
