"use client";

import { useActionState } from "react";
import { updateSettings, type FormState } from "@/lib/admin/actions";
import type { SettingsRow } from "@/lib/admin/data";
import { Alert, Card, FormField, Input, Textarea, btn } from "@/components/admin/kit";

const SECTIONS = [
  ["identificacao", "Loja"],
  ["contato", "Contato"],
  ["entrega", "Retirada"],
  ["politicas", "Políticas"],
] as const;

export function SettingsForm({ settings }: { settings: SettingsRow | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateSettings, {});
  const s = settings;

  return (
    <form action={formAction} className="space-y-4">
      <nav className="admin-noscroll -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {SECTIONS.map(([href, label]) => (
          <a key={href} href={`#${href}`} className="inline-flex h-10 shrink-0 items-center rounded-full bg-white px-4 text-[13.5px] font-semibold text-ad-ink-2 shadow-[0_0_0_1px_rgb(32_37_34/0.08)] hover:bg-ad-soft">
            {label}
          </a>
        ))}
      </nav>

      <Card id="identificacao" title="Identificação da loja">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="academy_name"><Input id="academy_name" name="academy_name" defaultValue={s?.academy_name ?? "MoveHaus Training Club"} /></FormField>
          <FormField label="Cidade" htmlFor="city"><Input id="city" name="city" defaultValue={s?.city ?? ""} /></FormField>
          <FormField label="Endereço" htmlFor="address" className="sm:col-span-2"><Input id="address" name="address" defaultValue={s?.address ?? ""} /></FormField>
          <FormField label="E-mail" htmlFor="email" className="sm:col-span-2"><Input id="email" name="email" type="email" inputMode="email" defaultValue={s?.email ?? ""} /></FormField>
        </div>
      </Card>

      <Card id="contato" title="Contato e redes">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="WhatsApp" htmlFor="whatsapp" hint="Só números, com 55 e DDD. Ex.: 5511987654321">
            <Input id="whatsapp" name="whatsapp" inputMode="tel" placeholder="5511987654321" defaultValue={s?.whatsapp ?? ""} />
          </FormField>
          <FormField label="WhatsApp como aparece no site" htmlFor="whatsapp_label">
            <Input id="whatsapp_label" name="whatsapp_label" placeholder="(11) 98765-4321" defaultValue={s?.whatsapp_label ?? ""} />
          </FormField>
          <FormField label="Instagram (link)" htmlFor="instagram" className="sm:col-span-2">
            <Input id="instagram" name="instagram" inputMode="url" placeholder="https://instagram.com/…" defaultValue={s?.instagram ?? ""} />
          </FormField>
        </div>
      </Card>

      <Card id="entrega" title="Entrega e retirada">
        <FormField label="Orientações para o cliente" htmlFor="delivery_rules" hint="Ex.: horário de retirada na recepção da academia.">
          <Textarea id="delivery_rules" name="delivery_rules" rows={4} defaultValue={s?.delivery_rules ?? ""} />
        </FormField>
      </Card>

      <Card id="politicas" title="Políticas">
        <div className="grid gap-4">
          <FormField label="Termos de uso" htmlFor="terms"><Textarea id="terms" name="terms" rows={6} defaultValue={s?.terms ?? ""} /></FormField>
          <FormField label="Política de privacidade" htmlFor="privacy"><Textarea id="privacy" name="privacy" rows={6} defaultValue={s?.privacy ?? ""} /></FormField>
        </div>
      </Card>

      {state.error && <Alert>{state.error}</Alert>}
      {state.message && <Alert tone="green">{state.message}</Alert>}

      <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 flex justify-end lg:bottom-6">
        <button type="submit" disabled={pending} className={btn("brand", "lg", "w-full shadow-[0_8px_20px_-8px_rgb(210_31_53/0.6)] sm:w-auto")}>
          {pending ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
