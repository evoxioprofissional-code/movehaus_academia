"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { removeHomeImage, uploadHomeImage } from "@/lib/home-media-actions";

function UploadBody({ url, label }: { url?: string; label: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <span className="relative block aspect-video overflow-hidden rounded-2xl bg-ad-soft">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-[13px] text-ad-muted">
            <ImagePlus className="size-6" /> Sem imagem
          </span>
        )}
        {pending && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-ad-ink" />
          </span>
        )}
      </span>
      <span className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-ad-ink px-4 text-[13.5px] font-semibold text-white">
        <ImagePlus className="size-4" /> {pending ? "Enviando…" : url ? "Trocar imagem" : "Enviar imagem"}
      </span>
    </>
  );
}

/** Slot de imagem da vitrine: escolher o arquivo já envia. */
export function HomeImageSlot({ slotKey, label, hint, url }: { slotKey: string; label: string; hint: string; url?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <div className="admin-card p-4 sm:p-5">
      <p className="text-[15px] font-semibold text-ad-ink">{label}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-ad-muted">{hint}</p>
      <form ref={formRef} action={uploadHomeImage} encType="multipart/form-data" className="mt-3">
        <input type="hidden" name="key" value={slotKey} />
        <label className="block cursor-pointer">
          <UploadBody url={url} label={label} />
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) formRef.current?.requestSubmit();
            }}
          />
        </label>
      </form>
      {url && (
        <form
          action={removeHomeImage}
          className="mt-2"
          onSubmit={(event) => {
            if (!confirm("Remover esta imagem da vitrine?")) event.preventDefault();
          }}
        >
          <input type="hidden" name="key" value={slotKey} />
          <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-ad-muted hover:bg-ad-red-soft hover:text-ad-red">
            <Trash2 className="size-4" /> Remover
          </button>
        </form>
      )}
    </div>
  );
}
