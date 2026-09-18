"use client";
import { useActionState } from "react";
import { createCoupon, type FormState } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function CouponForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCoupon, {});
  return <form action={action} className="grid gap-4 rounded-lg bg-mh-surface p-5 md:grid-cols-2">
    <Field id="code" name="code" label="Código" placeholder="MOVE10" required /><Field id="description" name="description" label="Descrição" />
    <label className="space-y-1.5"><span className="text-sm font-medium">Tipo</span><select name="discount_type" className="h-11 w-full rounded-md border border-white/10 bg-[#0d0d0f] px-3 text-sm"><option value="percentage">Percentual</option><option value="fixed">Valor fixo</option></select></label>
    <Field id="discount_value" name="discount_value" label="Desconto" type="number" step="0.01" required />
    <Field id="minimum_order" name="minimum_order" label="Pedido mínimo (R$)" /><Field id="usage_limit" name="usage_limit" label="Limite total" type="number" />
    <Field id="usage_per_customer" name="usage_per_customer" label="Limite por cliente" type="number" /><div />
    <Field id="starts_at" name="starts_at" label="Início" type="datetime-local" /><Field id="ends_at" name="ends_at" label="Término" type="datetime-local" />
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked className="accent-mh-red" />Cupom ativo</label>
    <div className="flex items-center justify-end gap-3">{state.error && <span className="text-sm text-red-300">{state.error}</span>}<Button disabled={pending}>{pending ? "Salvando..." : "Criar cupom"}</Button></div>
  </form>;
}
