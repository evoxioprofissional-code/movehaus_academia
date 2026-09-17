/**
 * Acesso centralizado e validado às variáveis de ambiente.
 *
 * - Chaves públicas (NEXT_PUBLIC_*) podem ir para o navegador.
 * - Chaves de servidor (service role, tokens de pagamento) NUNCA são
 *   importadas por componentes de cliente. Este módulo separa as duas.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    // Em build/dev avisamos, mas não derrubamos o processo, para permitir
    // o desenvolvimento da UI antes de todas as credenciais estarem prontas.
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Variável de ambiente ausente: ${name}`);
    }
    console.warn(`[env] Variável de ambiente ausente: ${name}`);
    return "";
  }
  return value;
}

/** Variáveis seguras para o cliente. */
export const publicEnv = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/**
 * Variáveis exclusivas de servidor. Importe apenas em Route Handlers,
 * Server Actions ou módulos executados no servidor.
 */
export const serverEnv = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
  mercadoPagoWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "",
};
