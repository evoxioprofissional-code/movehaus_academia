import { Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HOME_MEDIA_SLOTS } from "@/content/home";
import { uploadHomeImage, removeHomeImage } from "@/lib/home-media-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Página inicial | MoveHaus Admin" };

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("home_media").select("key, storage_path");
  const urlByKey = new Map<string, string>();
  for (const r of rows ?? []) {
    const { data } = supabase.storage.from("catalog").getPublicUrl(r.storage_path);
    urlByKey.set(r.key, data.publicUrl);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <AdminPageHeader
        title="Página inicial"
        description="Envie as imagens que aparecem na home. Enquanto não houver imagem, mostramos um espaço da marca. Trocar é só enviar outra."
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {HOME_MEDIA_SLOTS.map((slot) => {
          const url = urlByKey.get(slot.key);
          return (
            <div key={slot.key} className="rounded-lg border border-white/10 bg-mh-surface p-4">
              <p className="text-sm font-medium text-white">{slot.label}</p>
              <p className="mt-0.5 text-xs text-mh-muted">{slot.hint}</p>

              <div className="mt-3 aspect-video overflow-hidden rounded-md border border-white/10 bg-[radial-gradient(120%_120%_at_50%_0%,#1c1c1f,#0a0a0b)]">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={slot.label} className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-xs uppercase tracking-widest text-white/25">
                    sem imagem
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <form action={uploadHomeImage} encType="multipart/form-data" className="flex items-center gap-2">
                  <input type="hidden" name="key" value={slot.key} />
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    required
                    className="block max-w-[190px] text-xs text-mh-muted file:mr-2 file:rounded file:border-0 file:bg-mh-surface-2 file:px-2 file:py-1.5 file:text-xs file:text-white"
                  />
                  <Button type="submit" size="sm">
                    <Upload className="size-4" /> {url ? "Trocar" : "Enviar"}
                  </Button>
                </form>
                {url && (
                  <form action={removeHomeImage}>
                    <input type="hidden" name="key" value={slot.key} />
                    <button type="submit" aria-label="Remover" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft">
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-mh-muted">Formatos: JPG, PNG, WEBP ou AVIF, até 8 MB. As mudanças aparecem na home em instantes.</p>
    </div>
  );
}
