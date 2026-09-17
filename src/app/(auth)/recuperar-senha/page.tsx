"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, type AuthState } from "@/lib/auth/actions";

export default function RecuperarSenhaPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Recuperar senha
      </h1>
      <p className="mt-1 text-sm text-mh-muted">
        Enviaremos um link de redefinição para o seu e-mail.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field
          id="email"
          name="email"
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />

        {state.error && (
          <p className="rounded-mh border border-mh-red/40 bg-mh-red/10 px-4 py-3 text-sm text-mh-red-soft">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-mh border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mh-muted">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-medium text-white hover:text-mh-red-soft">
          Entrar
        </Link>
      </p>
    </div>
  );
}
