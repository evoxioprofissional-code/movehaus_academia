"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { updateSettings, type FormState } from "@/lib/admin/actions";
import type { SettingsRow } from "@/lib/admin/data";

function Area(props: { id: string; name: string; label: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={props.id} className="block text-sm font-medium text-white">{props.label}</label>
      <textarea
        id={props.id}
        name={props.name}
        rows={props.rows ?? 3}
        defaultValue={props.defaultValue}
        className="w-full rounded-mh border border-mh-border bg-mh-surface px-3 py-2 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
      />
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SettingsRow | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateSettings,
    {},
  );
  const s = settings;

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[190px_minmax(0,760px)]">
      <nav className="h-fit space-y-1 lg:sticky lg:top-20">{[["academia","Academia"],["contato","Contato e redes"],["loja","Loja e segurança"],["nutricionista","Nutricionista"],["politicas","Políticas"]].map(([href,label]) => <a key={href} href={`#${href}`} className="block rounded-md px-3 py-2 text-sm text-mh-muted hover:bg-white/5 hover:text-white">{label}</a>)}</nav>
      <div className="space-y-5">
      <section id="academia" className="space-y-4 rounded-lg bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-red">Academia</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="academy_name" name="academy_name" label="Nome" defaultValue={s?.academy_name ?? "MoveHaus Training Club"} />
          <Field id="city" name="city" label="Cidade" defaultValue={s?.city ?? ""} />
          <Field id="address" name="address" label="Endereço" defaultValue={s?.address ?? ""} />
          <Field id="email" name="email" label="E-mail" type="email" defaultValue={s?.email ?? ""} />
        </div>
      </section>

      <section id="contato" className="space-y-4 rounded-lg bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-red">Contato e redes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="whatsapp" name="whatsapp" label="WhatsApp (só dígitos, com DDI)" placeholder="5599999999999" defaultValue={s?.whatsapp ?? ""} />
          <Field id="whatsapp_label" name="whatsapp_label" label="WhatsApp (exibição)" placeholder="(00) 00000-0000" defaultValue={s?.whatsapp_label ?? ""} />
          <Field id="instagram" name="instagram" label="Instagram (URL)" defaultValue={s?.instagram ?? ""} />
        </div>
      </section>

      <section id="loja" className="space-y-4 rounded-lg bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-red">Regras</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="device_limit" name="device_limit" label="Limite de dispositivos" type="number" defaultValue={s?.device_limit ?? 3} />
          <Field id="grace_days" name="grace_days" label="Carência padrão (dias)" type="number" defaultValue={s?.grace_days ?? 5} />
        </div>
        <Area id="delivery_rules" name="delivery_rules" label="Regras de entrega" defaultValue={s?.delivery_rules ?? ""} />
      </section>

      <section id="nutricionista" className="space-y-4 rounded-lg bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-red">Nutricionista</h2>
        <Field id="nutritionist_name" name="nutritionist_name" label="Nome" defaultValue={s?.nutritionist_name ?? ""} />
        <Area id="nutritionist_bio" name="nutritionist_bio" label="Apresentação" defaultValue={s?.nutritionist_bio ?? ""} />
      </section>

      <section id="politicas" className="space-y-4 rounded-lg bg-mh-surface p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-mh-red">Políticas</h2>
        <Area id="terms" name="terms" label="Termos de uso" rows={5} defaultValue={s?.terms ?? ""} />
        <Area id="privacy" name="privacy" label="Política de privacidade" rows={5} defaultValue={s?.privacy ?? ""} />
      </section>

      {state.error && <p className="text-sm text-mh-red-soft">{state.error}</p>}
      {state.message && <p className="text-sm text-emerald-400">{state.message}</p>}

      <div className="sticky bottom-3 flex justify-end rounded-lg border border-white/10 bg-[#111113]/95 p-3 backdrop-blur"><Button type="submit" size="lg" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button></div>
      </div>
    </form>
  );
}
