import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { publicEnv } from "@/lib/env";

/**
 * Resolve o destino sem consultar a rede. A presença do cookie serve apenas
 * para escolher a próxima tela; /minha-area continua validando a sessão no
 * servidor antes de liberar qualquer dado.
 */
export default async function AccountGatewayPage() {
  const cookieStore = await cookies();
  let hasSessionCookie = false;

  if (publicEnv.supabaseUrl) {
    const projectRef = new URL(publicEnv.supabaseUrl).hostname.split(".")[0];
    const authCookie = `sb-${projectRef}-auth-token`;
    hasSessionCookie = cookieStore
      .getAll()
      .some(
        ({ name }) => name === authCookie || name.startsWith(`${authCookie}.`),
      );
  }

  redirect(
    hasSessionCookie
      ? "/minha-area"
      : "/login?next=%2Fminha-area",
  );
}
