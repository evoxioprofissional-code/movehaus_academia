"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Passagem pública e instantânea para a conta. A decisão local evita mandar
 * visitantes sem sessão para uma rota protegida só para depois redirecioná-los.
 * A autorização real continua sendo validada no servidor em /minha-area.
 */
export default function AccountGatewayPage() {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    let active = true;
    const delayedTimer = window.setTimeout(() => {
      if (active) setDelayed(true);
    }, 4_000);

    async function continueToAccount() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;
        const destination = session
          ? "/minha-area"
          : "/login?next=%2Fminha-area";
        window.location.replace(destination);
      } catch {
        if (active) window.location.replace("/login?next=%2Fminha-area");
      }
    }

    void continueToAccount();
    return () => {
      active = false;
      window.clearTimeout(delayedTimer);
    };
  }, []);

  return (
    <section className="grid min-h-[55svh] place-items-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/[0.06] text-white">
          <UserRound className="size-6" aria-hidden="true" />
        </span>
        <LoaderCircle
          className="mx-auto mt-6 size-6 animate-spin text-mh-red"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-semibold text-white">
          Abrindo sua conta
        </h1>
        <p className="mt-2 text-sm text-mh-muted">
          Estamos verificando sua sessão com segurança.
        </p>
        {delayed && (
          <p className="mt-6 text-sm text-mh-muted">
            Está demorando mais que o normal.{" "}
            <Link
              href="/login?next=%2Fminha-area"
              className="font-semibold text-white underline decoration-mh-red underline-offset-4"
            >
              Ir para o acesso
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
