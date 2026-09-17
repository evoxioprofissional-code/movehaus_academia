"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { signIn, type AuthState } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signIn,
    {},
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">Entrar</h1>
      <p className="mt-1 text-sm text-mh-muted">Acesse sua conta MoveHaus.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <Field
          id="email"
          name="email"
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="flex justify-end">
          <Link
            href="/recuperar-senha"
            className="text-sm text-mh-muted hover:text-white"
          >
            Esqueci minha senha
          </Link>
        </div>

        {state.error && (
          <p className="rounded-mh border border-mh-red/40 bg-mh-red/10 px-4 py-3 text-sm text-mh-red-soft">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mh-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-white hover:text-mh-red-soft">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
