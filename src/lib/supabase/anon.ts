import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase anônimo (sem cookies/sessão). Lê apenas dados públicos
 * (RLS de leitura pública). Por não depender de cookies, as leituras podem
 * ser cacheadas entre requisições com unstable_cache — deixando as páginas
 * públicas rápidas e resilientes à lentidão do backend.
 */
export const supabaseAnon = createClient<Database>(
  publicEnv.supabaseUrl || "https://placeholder.supabase.co",
  publicEnv.supabaseAnonKey || "placeholder-anon-key",
  { auth: { persistSession: false, autoRefreshToken: false } },
);
