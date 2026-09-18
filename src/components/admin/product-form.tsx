"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { createProduct, updateProduct, type FormState } from "@/lib/admin/actions";
import type { ProductRow, CategoryRow, ProductImageRow } from "@/lib/admin/data";
import { publicEnv } from "@/lib/env";

const centsToInput = (value: number | null | undefined) => value == null ? "" : (value / 100).toFixed(2).replace(".", ",");
const variantsToText = (value: { label: string; options: string[] }[] | null) => (value ?? []).map((group) => `${group.label}: ${group.options.join(", ")}`).join("\n");
const inputClass = "h-11 w-full rounded-md border border-white/10 bg-[#0d0d0f] px-3 text-sm text-white outline-none transition-colors focus:border-mh-red";

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium text-white">{label}</span><textarea {...props} className="min-h-28 w-full rounded-md border border-white/10 bg-[#0d0d0f] px-3 py-2 text-sm text-white outline-none focus:border-mh-red" /></label>;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="rounded-lg bg-mh-surface p-5 sm:p-6"><div className="mb-5"><h2 className="font-semibold text-white">{title}</h2>{description && <p className="mt-1 text-sm text-mh-muted">{description}</p>}</div>{children}</section>;
}

function imageUrl(image: ProductImageRow) {
  if (image.legacy_url) return image.legacy_url;
  return image.storage_path ? `${publicEnv.supabaseUrl}/storage/v1/object/public/catalog/${image.storage_path}` : "";
}

export function ProductForm({ product, categories, images = [] }: { product?: ProductRow; categories: CategoryRow[]; images?: ProductImageRow[] }) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [type, setType] = useState(product?.type ?? "physical");
  const [billing, setBilling] = useState(product?.billing_model ?? "one_time");
  const [gallery, setGallery] = useState(images);
  const [primaryId, setPrimaryId] = useState(images.find((image) => image.is_primary)?.id ?? images[0]?.id ?? "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dirty, setDirty] = useState(false);
  const isPhysical = type === "physical";
  const isSubscription = !isPhysical && billing === "subscription";
  const previewPrice = useMemo(() => centsToInput(product?.price), [product?.price]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => { if (dirty && !pending) event.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, pending]);

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setGallery(next); setDirty(true);
  }

  return (
    <form action={formAction} encType="multipart/form-data" onChange={() => setDirty(true)} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-5">
        <Section title="Informações principais" description="Dados que identificam o item na loja e no painel.">
          <div className="grid gap-4 sm:grid-cols-2"><Field id="name" name="name" label="Nome" defaultValue={product?.name} required /><Field id="slug" name="slug" label="Slug" hint="Gerado pelo nome se ficar vazio." defaultValue={product?.slug} /></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5"><span className="text-sm font-medium">Tipo</span><select name="type" value={type} onChange={(event) => setType(event.target.value as typeof type)} className={inputClass}><option value="physical">Produto físico</option><option value="digital">Programa de treino</option><option value="ebook">E-book</option></select></label>
            <label className="space-y-1.5"><span className="text-sm font-medium">Categoria</span><select name="category_id" defaultValue={product?.category_id ?? ""} className={inputClass}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          </div>
          <div className="mt-4"><Field id="short_description" name="short_description" label="Descrição curta" defaultValue={product?.short_description} /></div>
          <div className="mt-4"><Textarea id="description" name="description" label="Descrição completa" defaultValue={product?.description} /></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field id="sku" name="sku" label="SKU" defaultValue={product?.sku ?? ""} /><Field id="tags" name="tags" label="Tags" hint="Separe por vírgulas." defaultValue={product?.tags?.join(", ") ?? ""} /></div>
        </Section>

        <Section title="Imagens" description="JPEG, PNG, WebP ou AVIF, até 8 MB por arquivo. A imagem principal aparece na loja.">
          {gallery.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((image, index) => <div key={image.id} className="rounded-md bg-[#0d0d0f] p-2"><div className="relative aspect-square overflow-hidden rounded"><Image src={imageUrl(image)} alt={image.alt_text || product?.name || "Produto"} fill sizes="220px" className="object-cover" /></div><input type="hidden" name="existing_image_id" value={image.id} /><div className="mt-2 flex items-center gap-1"><button type="button" onClick={() => setPrimaryId(image.id)} className={`grid size-8 place-items-center rounded ${primaryId === image.id ? "bg-amber-400/15 text-amber-300" : "text-mh-muted hover:bg-white/5"}`} aria-label="Definir como principal"><Star className="size-4" fill={primaryId === image.id ? "currentColor" : "none"} /></button><button type="button" onClick={() => moveImage(index, -1)} className="grid size-8 place-items-center rounded text-mh-muted hover:bg-white/5" aria-label="Mover para cima"><ArrowUp className="size-4" /></button><button type="button" onClick={() => moveImage(index, 1)} className="grid size-8 place-items-center rounded text-mh-muted hover:bg-white/5" aria-label="Mover para baixo"><ArrowDown className="size-4" /></button><button type="button" onClick={() => { setGallery((items) => items.filter((item) => item.id !== image.id)); setDirty(true); }} className="ml-auto grid size-8 place-items-center rounded text-mh-muted hover:bg-red-500/10 hover:text-red-300" aria-label="Excluir imagem"><Trash2 className="size-4" /></button></div><input name={`alt_${image.id}`} defaultValue={image.alt_text} placeholder="Texto alternativo" className="mt-2 h-9 w-full rounded border border-white/10 bg-mh-surface px-2 text-xs text-white outline-none focus:border-mh-red" /></div>)}</div>}
          <input type="hidden" name="primary_image_id" value={primaryId} />
          <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-white/20 bg-[#0d0d0f] px-4 text-center hover:border-mh-red/70"><ImagePlus className="size-6 text-mh-muted" /><span className="mt-2 text-sm font-medium text-white">Arraste ou selecione imagens</span><span className="mt-1 text-xs text-mh-muted">A primeira imagem nova será a principal quando não houver outra.</span><input className="sr-only" type="file" name="images" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))} /></label>
          {selectedFiles.length > 0 && <p className="mt-3 text-sm text-emerald-300"><Check className="mr-1 inline size-4" />{selectedFiles.length} arquivo(s) pronto(s) para envio.</p>}
        </Section>

        <Section title="Preço e promoção" description="Valores são validados novamente no servidor.">
          <div className="grid gap-4 sm:grid-cols-2"><Field id="price" name="price" label={isSubscription ? "Preço avulso (opcional)" : "Preço normal (R$)"} defaultValue={previewPrice} /><Field id="compare_at_price" name="compare_at_price" label="Preço anterior (R$)" defaultValue={centsToInput(product?.compare_at_price)} /></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field id="promotion_starts_at" name="promotion_starts_at" type="datetime-local" label="Início da promoção" defaultValue={product?.promotion_starts_at?.slice(0, 16) ?? ""} /><Field id="promotion_ends_at" name="promotion_ends_at" type="datetime-local" label="Fim da promoção" defaultValue={product?.promotion_ends_at?.slice(0, 16) ?? ""} /></div>
        </Section>

        {!isPhysical && <Section title="Cobrança e acesso digital"><label className="block space-y-1.5"><span className="text-sm font-medium">Modelo de cobrança</span><select name="billing_model" value={billing} onChange={(event) => setBilling(event.target.value as typeof billing)} className={inputClass}><option value="one_time">Pagamento único</option><option value="subscription">Assinatura mensal</option></select></label>{isSubscription ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field id="monthly_price" name="monthly_price" label="Valor mensal (R$)" defaultValue={centsToInput(product?.monthly_price)} /><Field id="grace_days" name="grace_days" label="Carência (dias)" type="number" defaultValue={product?.grace_days ?? 5} /></div> : <div className="mt-4"><Field id="access_duration_days" name="access_duration_days" label="Duração do acesso (dias)" hint="Vazio significa acesso permanente." type="number" defaultValue={product?.access_duration_days ?? ""} /></div>}{type === "ebook" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field id="author" name="author" label="Autoria" defaultValue={product?.author ?? ""} /><Field id="chapters_count" name="chapters_count" label="Capítulos" type="number" defaultValue={product?.chapters_count ?? ""} /></div>}</Section>}

        {isPhysical && <><Section title="Estoque"><div className="grid gap-4 sm:grid-cols-3"><Field id="stock" name="stock" label="Quantidade" type="number" defaultValue={product?.stock ?? 0} /><Field id="minimum_stock" name="minimum_stock" label="Estoque mínimo" type="number" defaultValue={product?.minimum_stock ?? 5} /><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="track_inventory" defaultChecked={product?.track_inventory ?? true} className="accent-mh-red" />Controlar estoque</label></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" name="allow_backorder" defaultChecked={product?.allow_backorder ?? false} className="accent-mh-red" />Permitir venda sem estoque</label></Section><Section title="Variações"><Textarea id="variants" name="variants" label="Grupos e opções" placeholder="Tamanho: P, M, G\nCor: Preto, Vermelho" defaultValue={variantsToText(product?.variants ?? [])} /></Section><Section title="Entrega"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="requires_shipping" defaultChecked={product?.requires_shipping ?? true} className="accent-mh-red" />Exige entrega</label><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field id="weight_grams" name="weight_grams" label="Peso (g)" type="number" defaultValue={product?.weight_grams ?? ""} /><Field id="width_cm" name="width_cm" label="Largura (cm)" type="number" step="0.01" defaultValue={product?.width_cm ?? ""} /><Field id="height_cm" name="height_cm" label="Altura (cm)" type="number" step="0.01" defaultValue={product?.height_cm ?? ""} /><Field id="length_cm" name="length_cm" label="Comprimento (cm)" type="number" step="0.01" defaultValue={product?.length_cm ?? ""} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field id="extra_lead_days" name="extra_lead_days" label="Prazo adicional (dias)" type="number" defaultValue={product?.extra_lead_days ?? 0} /><Field id="shipping_notes" name="shipping_notes" label="Observações" defaultValue={product?.shipping_notes ?? ""} /></div></Section></>}
      </div>

      <aside className="h-fit space-y-4 xl:sticky xl:top-20">
        <div className="rounded-lg bg-mh-surface p-5"><h2 className="font-semibold">Publicação</h2><label className="mt-4 block space-y-1.5"><span className="text-sm text-mh-muted">Status</span><select name="status" defaultValue={product?.status ?? "active"} className={inputClass}><option value="active">Ativo</option><option value="draft">Rascunho</option><option value="inactive">Inativo</option><option value="archived">Arquivado</option></select></label><div className="mt-4 space-y-3 text-sm">{[["active","Produto ativo",product?.active ?? true],["featured","Em destaque",product?.featured ?? false],["show_on_home","Visível na home",product?.show_on_home ?? false],["is_new","Lançamento",product?.is_new ?? false]].map(([name,label,checked]) => <label key={String(name)} className="flex items-center gap-2"><input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} className="accent-mh-red" />{String(label)}</label>)}</div><div className="mt-4 grid gap-3"><Field id="featured_order" name="featured_order" label="Ordem do destaque" type="number" defaultValue={product?.featured_order ?? ""} /><Field id="custom_badge" name="custom_badge" label="Selo personalizado" defaultValue={product?.custom_badge ?? ""} /></div></div>
        {state.error && <p role="alert" className="rounded-md bg-red-500/10 p-3 text-sm text-red-300">{state.error}</p>}
        {dirty && <p className="text-xs text-amber-300">Há alterações ainda não salvas.</p>}
        <Button type="submit" size="lg" disabled={pending} className="w-full">{pending ? "Salvando e enviando..." : product ? "Salvar alterações" : "Criar produto"}</Button>
        <Button asChild variant="outline" className="w-full"><Link href="/admin/produtos">Cancelar</Link></Button>
      </aside>
    </form>
  );
}
