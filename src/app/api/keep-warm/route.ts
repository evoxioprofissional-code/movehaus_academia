import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase/anon";

// Mantém o projeto Supabase ativo (o plano grátis "hiberna" após dias ociosos,
// e a primeira requisição depois disso demora ~1-2 min). Um cron chama esta
// rota periodicamente só para registrar atividade no banco.
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await supabaseAnon.from("site_settings").select("id").limit(1);
    return NextResponse.json({ ok: true, ms: Date.now() - startedAt });
  } catch {
    return NextResponse.json({ ok: false, ms: Date.now() - startedAt }, { status: 200 });
  }
}
