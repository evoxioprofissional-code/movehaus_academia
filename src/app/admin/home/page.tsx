import { Save, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HOME_MEDIA_SLOTS, HOME_TEXT_FIELDS } from "@/content/home";
import { uploadHomeImage, removeHomeImage } from "@/lib/home-media-actions";
import { saveHomeTexts } from "@/lib/home-content-actions";
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

  const { data: textRows } = await supabase.from("home_content").select("key, value");
  const textByKey = new Map((textRows ?? []).map((r) => [r.key, r.value]));
  const textGroups = [...new Set(HOME_TEXT_FIELDS.map((f) => f.group))];
  const inputCls = "mt-1 w-full rounded-md border border-white/10 bg-[#0d0d0f] px-3 py-2 text-sm text-white outline-none focus:border-mh-red";

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

      <form action={saveHomeTexts} className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Textos da página</h2>
            <p className="mt-0.5 text-xs text-mh-muted">Edite os títulos e frases de cada seção. Deixe um campo em branco para voltar ao texto padrão.</p>
          </div>
          <Button type="submit"><Save className="size-4" /> Salvar textos</Button>
        </div>

        <div className="mt-4 space-y-5">
          {textGroups.map((group) => (
            <fieldset key={group} className="rounded-lg border border-white/10 bg-mh-surface p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-mh-red">{group}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {HOME_TEXT_FIELDS.filter((f) => f.group === group).map((field) => {
                  const value = textByKey.get(field.key) ?? field.default;
                  return (
                    <label key={field.key} className={field.multiline ? "sm:col-span-2 block" : "block"}>
                      <span className="text-sm text-white">{field.label}</span>
                      {field.multiline ? (
                        <textarea name={field.key} defaultValue={value} rows={2} className={`${inputCls} resize-y`} />
                      ) : (
                        <input name={field.key} defaultValue={value} className={inputCls} />
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-4 flex justify-end"><Button type="submit"><Save className="size-4" /> Salvar textos</Button></div>
      </form>
    </div>
  );
}
