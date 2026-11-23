import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HOME_MEDIA_SLOTS, HOME_TEXT_FIELDS } from "@/content/home";
import { saveHomeTexts } from "@/lib/home-content-actions";
import { HomeImageSlot } from "@/components/admin/home-image-slot";
import { Card, FormField, Input, Page, PageHeader, Textarea, btn } from "@/components/admin/kit";

export const metadata = { title: "Vitrine | MoveHaus Admin" };

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [{ data: rows }, { data: textRows }] = await Promise.all([
    supabase.from("home_media").select("key, storage_path"),
    supabase.from("home_content").select("key, value"),
  ]);
  const urlByKey = new Map<string, string>();
  for (const r of rows ?? []) {
    const { data } = supabase.storage.from("catalog").getPublicUrl(r.storage_path);
    urlByKey.set(r.key, data.publicUrl);
  }
  const textByKey = new Map((textRows ?? []).map((r) => [r.key, r.value]));
  const textGroups = [...new Set(HOME_TEXT_FIELDS.map((f) => f.group))];

  return (
    <Page narrow>
      <PageHeader
        title="Vitrine"
        subtitle="Textos e imagens da página inicial da loja. No celular, os destaques usam as fotos dos próprios produtos."
        actions={
          <Link href="/" target="_blank" className={btn("secondary", "md")}>
            <ExternalLink className="size-4" /> Ver página
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {HOME_MEDIA_SLOTS.map((slot) => (
          <HomeImageSlot key={slot.key} slotKey={slot.key} label={slot.label} hint={slot.hint} url={urlByKey.get(slot.key)} />
        ))}
      </div>
      <p className="mt-3 px-1 text-[12.5px] text-ad-muted">JPG, PNG, WEBP ou AVIF até 8 MB. Escolher o arquivo já envia; a loja atualiza em instantes.</p>

      <form action={saveHomeTexts} className="mt-6 space-y-4">
        {textGroups.map((group) => (
          <Card key={group} title={group}>
            <div className="grid gap-4 sm:grid-cols-2">
              {HOME_TEXT_FIELDS.filter((f) => f.group === group).map((field) => {
                const value = textByKey.get(field.key) ?? field.default;
                return (
                  <FormField key={field.key} label={field.label} className={field.multiline ? "sm:col-span-2" : undefined}>
                    {field.multiline ? <Textarea name={field.key} defaultValue={value} rows={2} className="min-h-[76px]" /> : <Input name={field.key} defaultValue={value} />}
                  </FormField>
                );
              })}
            </div>
          </Card>
        ))}
        <p className="px-1 text-[12.5px] text-ad-muted">Apague o texto de um campo para voltar ao padrão.</p>
        <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 flex justify-end lg:bottom-6">
          <button type="submit" className={btn("brand", "lg", "w-full shadow-[0_8px_20px_-8px_rgb(210_31_53/0.6)] sm:w-auto")}>
            <Save className="size-4" /> Salvar textos
          </button>
        </div>
      </form>
    </Page>
  );
}
