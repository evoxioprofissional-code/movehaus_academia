"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImagePlus, Monitor, Smartphone } from "lucide-react";
import { createBanner, type FormState } from "@/lib/admin/actions";
import { Alert, FormField, Input, Toggle, btn } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

function ImagePick({ name, label, icon: Icon, ratio }: { name: string; label: string; icon: typeof Monitor; ratio: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    const form = inputRef.current?.form;
    const clear = () => setPreview(null);
    form?.addEventListener("reset", clear);
    return () => form?.removeEventListener("reset", clear);
  }, []);
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-ad-ink-2"><Icon className="size-4 text-ad-muted" />{label}</span>
      <span className={cn("relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d9d7d0] bg-ad-soft/60 text-center transition-colors hover:border-ad-ink/30", ratio)}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 p-3 text-[12.5px] text-ad-muted"><ImagePlus className="size-5" />Escolher imagem</span>
        )}
      </span>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
      />
    </label>
  );
}

export function BannerForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createBanner, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} encType="multipart/form-data" className="grid gap-4">
      <FormField label="Título"><Input name="title" required placeholder="Ex.: Nova coleção de inverno" /></FormField>
      <FormField label="Subtítulo (opcional)"><Input name="subtitle" /></FormField>
      <div className="grid grid-cols-[1.6fr_1fr] gap-3">
        <ImagePick name="desktop_image" label="Computador" icon={Monitor} ratio="aspect-[16/7]" />
        <ImagePick name="mobile_image" label="Celular" icon={Smartphone} ratio="aspect-[4/5] max-h-[140px] sm:max-h-none" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Texto do botão"><Input name="button_label" placeholder="Ver agora" /></FormField>
        <FormField label="Abre a página"><Input name="link" placeholder="/loja" /></FormField>
        <FormField label="Começa em"><Input name="starts_at" type="datetime-local" /></FormField>
        <FormField label="Termina em"><Input name="ends_at" type="datetime-local" /></FormField>
        <FormField label="Ordem"><Input name="position" type="number" defaultValue={0} /></FormField>
      </div>
      <Toggle name="active" label="Publicar agora" description="Desligado, o banner fica salvo sem aparecer." />
      {state.error && <Alert>{state.error}</Alert>}
      {state.message && <Alert tone="green">{state.message}</Alert>}
      <button disabled={pending} className={btn("brand", "lg", "w-full")}>{pending ? "Enviando…" : "Criar banner"}</button>
    </form>
  );
}
