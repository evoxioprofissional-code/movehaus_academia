"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { signUp, type AuthState } from "@/lib/auth/actions";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signUp,
    {},
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Criar conta
      </h1>
      <p className="mt-1 text-sm text-mh-muted">Leva menos de um minuto.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field
          id="name"
          name="name"
          label="Nome completo"
          placeholder="Seu nome"
          autoComplete="name"
          required
        />
        <Field
          id="whatsapp"
          name="whatsapp"
          type="tel"
          label="WhatsApp"
          placeholder="(00) 00000-0000"
          autoComplete="tel"
        />
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
          placeholder="Crie uma senha"
          autoComplete="new-password"
          hint="Use pelo menos 8 caracteres."
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
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>

        <p className="text-xs text-mh-muted">
          Ao criar a conta você concorda com os{" "}
          <Link href="/termos" className="underline hover:text-white">
            Termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline hover:text-white">
            Política de privacidade
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-mh-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-white hover:text-mh-red-soft">
          Entrar
        </Link>
      </p>
    </div>
  );
}
