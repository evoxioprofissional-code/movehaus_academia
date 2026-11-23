"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCoupon, type FormState } from "@/lib/admin/actions";
import { Alert, FormField, Input, Toggle, btn } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export function CouponForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCoupon, {});
  const [kind, setKind] = useState<"percentage" | "fixed">("percentage");
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Código do cupom" hint="O cliente digita no carrinho.">
          <Input name="code" placeholder="MOVE10" required autoCapitalize="characters" className="font-mono uppercase tracking-wide" />
        </FormField>
        <FormField label="Descrição (só para você)">
          <Input name="description" placeholder="Ex.: Campanha de verão" />
        </FormField>
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-medium text-ad-ink-2">Tipo de desconto</p>
        <div className="grid grid-cols-2 gap-2">
          {([["percentage", "Porcentagem (%)"], ["fixed", "Valor fixo (R$)"]] as const).map(([value, label]) => (
            <label key={value} className={cn("flex h-12 cursor-pointer items-center justify-center rounded-2xl text-[14px] font-semibold", kind === value ? "bg-ad-ink text-white" : "bg-ad-soft text-ad-ink-2")}>
              <input type="radio" name="discount_type" value={value} checked={kind === value} onChange={() => setKind(value)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Desconto">
          <Input name="discount_value" type="number" step="0.01" inputMode="decimal" required prefix={kind === "fixed" ? "R$" : undefined} suffix={kind === "percentage" ? "%" : undefined} placeholder={kind === "percentage" ? "10" : "20,00"} />
        </FormField>
        <FormField label="Pedido mínimo">
          <Input name="minimum_order" inputMode="decimal" prefix="R$" placeholder="0,00" />
        </FormField>
        <FormField label="Limite de usos" hint="Vazio = sem limite">
          <Input name="usage_limit" type="number" inputMode="numeric" />
        </FormField>
        <FormField label="Por cliente" hint="Vazio = sem limite">
          <Input name="usage_per_customer" type="number" inputMode="numeric" />
        </FormField>
        <FormField label="Vale a partir de">
          <Input name="starts_at" type="datetime-local" />
        </FormField>
        <FormField label="Vale até">
          <Input name="ends_at" type="datetime-local" />
        </FormField>
      </div>

      <Toggle name="active" label="Cupom ativo" description="Desligue para pausar sem excluir." defaultChecked />
      {state.error && <Alert>{state.error}</Alert>}
      {state.message && <Alert tone="green">{state.message}</Alert>}
      <button disabled={pending} className={btn("brand", "lg", "w-full sm:w-auto sm:justify-self-end")}>{pending ? "Salvando…" : "Criar cupom"}</button>
    </form>
  );
}
