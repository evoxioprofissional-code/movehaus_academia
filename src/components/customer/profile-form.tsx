"use client";

import { useActionState } from "react";
import { updateCustomerProfile, type CustomerActionState } from "@/lib/customer/actions";
import { Button } from "@/components/ui/button";

export function ProfileForm({ name, whatsapp, email }: { name: string; whatsapp: string; email: string }) {
  const [state, action, pending] = useActionState<CustomerActionState, FormData>(updateCustomerProfile, {});
  return <form action={action} className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-mh-muted">Nome completo<input name="full_name" required defaultValue={name} className="mt-1.5 w-full rounded-lg border border-mh-border bg-mh-black px-3 py-2.5 text-white outline-none focus:border-mh-red" /></label><label className="text-sm text-mh-muted">WhatsApp<input name="whatsapp" inputMode="tel" defaultValue={whatsapp} className="mt-1.5 w-full rounded-lg border border-mh-border bg-mh-black px-3 py-2.5 text-white outline-none focus:border-mh-red" /></label><label className="text-sm text-mh-muted sm:col-span-2">E-mail<input value={email} disabled className="mt-1.5 w-full rounded-lg border border-mh-border bg-white/5 px-3 py-2.5 text-mh-muted" /></label><div className="flex items-center gap-3 sm:col-span-2"><Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar dados"}</Button>{state.error && <p role="alert" className="text-sm text-mh-red-soft">{state.error}</p>}{state.message && <p className="text-sm text-emerald-400">{state.message}</p>}</div></form>;
}
