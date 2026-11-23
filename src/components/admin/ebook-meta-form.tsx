"use client";

import { useActionState, useEffect, useState } from "react";
import { BookOpenText, Eye, EyeOff, ImagePlus } from "lucide-react";
import { saveEbookMeta, type FormState } from "@/lib/admin/actions";
import type { EbookRow } from "@/lib/admin/data";
import { Alert, FormField, Textarea, btn } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export function EbookMetaForm({ productId, ebook }: { productId: string; ebook: EbookRow | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveEbookMeta, {});
  const [status, setStatus] = useState(ebook?.status ?? "draft");
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const cover = preview ?? ebook?.cover_url ?? null;

  return (
    <form action={formAction} encType="multipart/form-data" className="grid gap-5 sm:grid-cols-[150px_1fr]">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="existing_cover_path" value={ebook?.cover_path ?? ""} />

      <label className="block cursor-pointer">
        <span className="relative mx-auto block aspect-[3/4] w-[130px] overflow-hidden rounded-2xl bg-ad-soft shadow-[0_10px_24px_-12px_rgb(0_0_0/0.4)] sm:w-full">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="Capa" className="absolute inset-0 size-full object-cover" />
          ) : (
            <BookOpenText className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-ad-faint" />
          )}
          <span className="absolute inset-x-2 bottom-2 flex h-8 items-center justify-center gap-1.5 rounded-full bg-white/90 text-[12px] font-semibold text-ad-ink backdrop-blur">
            <ImagePlus className="size-3.5" /> {cover ? "Trocar capa" : "Enviar capa"}
          </span>
        </span>
        <input
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </label>

      <div className="grid content-start gap-4">
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ad-ink-2">Quem pode ler</p>
          <div className="grid grid-cols-2 gap-2">
            {([["draft", "Rascunho", "Só você vê", EyeOff], ["published", "Publicado", "Liberado a quem comprou", Eye]] as const).map(([value, label, hint, Icon]) => (
              <label key={value} className={cn("flex cursor-pointer items-center gap-2.5 rounded-2xl p-3", status === value ? (value === "published" ? "bg-[#1f7a3d] text-white" : "bg-ad-ink text-white") : "bg-ad-soft text-ad-ink")}>
                <input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} className="sr-only" />
                <Icon className="size-[18px] shrink-0" />
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">{label}</span>
                  <span className={cn("block truncate text-[12px]", status === value ? "text-white/70" : "text-ad-muted")}>{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <FormField label="Apresentação" hint="Aparece antes do sumário, na biblioteca do cliente.">
          <Textarea name="intro" rows={3} defaultValue={ebook?.intro ?? ""} placeholder="Ex.: Receitas rápidas para o dia a dia de treino." />
        </FormField>
        {state.error && <Alert>{state.error}</Alert>}
        {state.message && <Alert tone="green">{state.message}</Alert>}
        <button type="submit" disabled={pending} className={btn("primary", "md", "sm:justify-self-start")}>
          {pending ? "Salvando…" : "Salvar apresentação"}
        </button>
      </div>
    </form>
  );
}
