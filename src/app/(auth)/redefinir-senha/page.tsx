"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { updatePassword, type AuthState } from "@/lib/auth/actions";

export default function RedefinirSenhaPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Nova senha
      </h1>
      <p className="mt-1 text-sm text-mh-muted">
        Defina uma nova senha para a sua conta.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field
          id="password"
          name="password"
          type="password"
          label="Nova senha"
          placeholder="Crie uma senha"
          autoComplete="new-password"
          hint="Use pelo menos 8 caracteres."
          required
        />
        <Field
          id="confirm"
          name="confirm"
          type="password"
          label="Confirmar senha"
          placeholder="Repita a senha"
          autoComplete="new-password"
          required
        />

        {state.error && (
          <p className="rounded-mh border border-mh-red/40 bg-mh-red/10 px-4 py-3 text-sm text-mh-red-soft">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </div>
  );
}
