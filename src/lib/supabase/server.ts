import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para o servidor (Server Components, Route Handlers,
 * Server Actions). Usa a sessão do usuário via cookies e respeita RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado a partir de um Server Component sem resposta mutável.
            // O middleware é responsável por renovar a sessão nesses casos.
          }
        },
      },
    },
  );
}

/**
 * Cliente administrativo com a chave service_role. Ignora RLS.
 * USE SOMENTE no servidor, em operações confiáveis (webhooks, jobs,
 * ações administrativas já autorizadas). Nunca exponha ao cliente.
 */
export function createAdminClient() {
  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ausente: cliente administrativo indisponível.",
    );
  }
  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
