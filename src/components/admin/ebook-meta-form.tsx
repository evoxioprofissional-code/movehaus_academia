"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveEbookMeta, type FormState } from "@/lib/admin/actions";
import type { EbookRow } from "@/lib/admin/data";

export function EbookMetaForm({
  productId,
  ebook,
}: {
  productId: string;
  ebook: EbookRow | null;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveEbookMeta,
    {},
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-4 rounded-lg bg-mh-surface p-5">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="existing_cover_path" value={ebook?.cover_path ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5"><span className="text-sm font-medium text-white">Capa</span><input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm text-mh-muted" /><span className="block text-xs text-mh-muted">Até 8 MB. A capa atual será mantida se nenhum arquivo for escolhido.</span></label>
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-white">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={ebook?.status ?? "draft"}
            className="h-11 w-full rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-white focus:border-mh-red focus:outline-none"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="intro" className="block text-sm font-medium text-white">Introdução</label>
        <textarea
          id="intro"
          name="intro"
          rows={3}
          defaultValue={ebook?.intro ?? ""}
          className="w-full rounded-mh border border-mh-border bg-mh-black px-3 py-2 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-mh-red-soft">{state.error}</p>
      )}
      {state.message && (
        <p className="text-sm text-emerald-400">{state.message}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar conteúdo"}
      </Button>
    </form>
  );
}
