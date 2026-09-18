"use client";
import { useActionState } from "react";
import { createBanner, type FormState } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function BannerForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createBanner, {});
  return <form action={action} encType="multipart/form-data" className="grid gap-4 rounded-lg bg-mh-surface p-5 md:grid-cols-2">
    <Field id="title" name="title" label="Título" required /><Field id="subtitle" name="subtitle" label="Subtítulo" />
    <label className="space-y-1.5"><span className="text-sm font-medium">Imagem desktop</span><input name="desktop_image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm text-mh-muted" /></label>
    <label className="space-y-1.5"><span className="text-sm font-medium">Imagem mobile</span><input name="mobile_image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm text-mh-muted" /></label>
    <Field id="button_label" name="button_label" label="Texto do botão" /><Field id="link" name="link" label="Link" placeholder="/loja" />
    <Field id="starts_at" name="starts_at" label="Início" type="datetime-local" /><Field id="ends_at" name="ends_at" label="Término" type="datetime-local" />
    <Field id="position" name="position" label="Ordem" type="number" defaultValue={0} /><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="active" className="accent-mh-red" />Banner ativo</label>
    <div className="md:col-span-2 flex items-center justify-end gap-3">{state.error && <span className="text-sm text-red-300">{state.error}</span>}<Button disabled={pending}>{pending ? "Enviando..." : "Criar banner"}</Button></div>
  </form>;
}
