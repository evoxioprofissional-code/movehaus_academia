import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const PUBLIC_REQUEST_TIMEOUT_MS = 5_000;

/**
 * Evita que uma instabilidade de rede segure a renderização pública por
 * dezenas de segundos. Os leitores públicos já possuem conteúdo de fallback;
 * portanto, depois do limite, eles retornam o fallback e a página continua.
 */
async function publicFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUBLIC_REQUEST_TIMEOUT_MS);

  const abortFromCaller = () => controller.abort();
  if (init?.signal?.aborted) controller.abort();
  else init?.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    init?.signal?.removeEventListener("abort", abortFromCaller);
  }
}

/**
 * Cliente Supabase anônimo (sem cookies/sessão). Lê apenas dados públicos
 * (RLS de leitura pública). Por não depender de cookies, as leituras podem
 * ser cacheadas entre requisições com unstable_cache — deixando as páginas
 * públicas rápidas e resilientes à lentidão do backend.
 */
export const supabaseAnon = createClient<Database>(
  publicEnv.supabaseUrl || "https://placeholder.supabase.co",
  publicEnv.supabaseAnonKey || "placeholder-anon-key",
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: publicFetch },
  },
);
