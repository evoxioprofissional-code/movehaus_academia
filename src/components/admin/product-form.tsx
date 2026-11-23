"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, FileText, ImagePlus, Package, Star, Trash2 } from "lucide-react";
import { createProduct, updateProduct, type FormState } from "@/lib/admin/actions";
import type { ProductRow, CategoryRow, ProductImageRow } from "@/lib/admin/data";
import { publicEnv } from "@/lib/env";
import { Alert, Card, FormField, Input, Select, Textarea, Toggle, btn } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

const centsToInput = (value: number | null | undefined) => (value == null ? "" : (value / 100).toFixed(2).replace(".", ","));
const variantsToText = (value: { label: string; options: string[] }[] | null) => (value ?? []).map((group) => `${group.label}: ${group.options.join(", ")}`).join("\n");

function imageUrl(image: ProductImageRow) {
  if (image.legacy_url) return image.legacy_url;
  return image.storage_path ? `${publicEnv.supabaseUrl}/storage/v1/object/public/catalog/${image.storage_path}` : "";
}

const TYPES: { value: ProductRow["type"]; label: string; hint: string; icon: typeof Package }[] = [
  { value: "physical", label: "Produto físico", hint: "Roupa, acessório, suplemento", icon: Package },
  { value: "digital", label: "PDF / material", hint: "Arquivo para ler no app", icon: FileText },
  { value: "ebook", label: "E-book / receitas", hint: "Capítulos e receitas", icon: BookOpen },
];

export function ProductForm({ product, categories, images = [], initialType = "physical" }: { product?: ProductRow; categories: CategoryRow[]; images?: ProductImageRow[]; initialType?: ProductRow["type"] }) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [type, setType] = useState(product?.type ?? initialType);
  const [billing, setBilling] = useState(product?.billing_model ?? "one_time");
  const [gallery, setGallery] = useState(images);
  const [primaryId, setPrimaryId] = useState(images.find((image) => image.is_primary)?.id ?? images[0]?.id ?? "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dirty, setDirty] = useState(false);
  const isPhysical = type === "physical";
  const isSubscription = !isPhysical && billing === "subscription";
  const previewPrice = useMemo(() => centsToInput(product?.price), [product?.price]);
  const previews = useMemo(() => selectedFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [selectedFiles]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty && !pending) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, pending]);

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...gallery];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setGallery(next);
    setDirty(true);
  }

  return (
    <form action={formAction} encType="multipart/form-data" onChange={() => setDirty(true)} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="min-w-0 space-y-4">
        {/* Tipo */}
        <Card title="Que tipo de item é?">
          <div className="grid gap-2 sm:grid-cols-3">
            {TYPES.map((option) => {
              const on = type === option.value;
              return (
                <label key={option.value} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl p-3.5 transition-[background,box-shadow] sm:flex-col sm:items-start", on ? "bg-ad-ink text-white" : "bg-ad-soft text-ad-ink hover:bg-[#ebeae4]")}>
                  <input type="radio" name="type" value={option.value} checked={on} onChange={() => setType(option.value)} className="sr-only" />
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", on ? "bg-white/15" : "bg-white")}>
                    <option.icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold">{option.label}</span>
                    <span className={cn("block text-[12.5px]", on ? "text-white/65" : "text-ad-muted")}>{option.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </Card>

        {/* Básico */}
        <Card title="Informações principais" subtitle="Como o item aparece na loja.">
          <div className="grid gap-4">
            <FormField label="Nome" htmlFor="name">
              <Input id="name" name="name" defaultValue={product?.name} required placeholder={isPhysical ? "Ex.: Camiseta Dry MoveHaus" : "Ex.: Guia de receitas fit"} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Categoria" htmlFor="category_id">
                <Select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""}>
                  <option value="">Sem categoria</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Endereço na loja" htmlFor="slug" hint="Deixe vazio para gerar pelo nome.">
                <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="camiseta-dry" />
              </FormField>
            </div>
            <FormField label="Resumo" htmlFor="short_description" hint="Uma frase que aparece no card do produto.">
              <Input id="short_description" name="short_description" defaultValue={product?.short_description} />
            </FormField>
            <FormField label="Descrição completa" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={product?.description} rows={5} />
            </FormField>
          </div>
        </Card>

        {/* Fotos */}
        <Card title="Fotos" subtitle="JPEG, PNG, WebP ou AVIF até 8 MB. A estrela marca a foto principal.">
          {gallery.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((image, index) => (
                <div key={image.id} className="overflow-hidden rounded-2xl bg-ad-soft">
                  <div className="relative aspect-square">
                    <Image src={imageUrl(image)} alt={image.alt_text || product?.name || "Produto"} fill sizes="220px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryId(image.id);
                        setDirty(true);
                      }}
                      className={cn("absolute left-2 top-2 grid size-9 place-items-center rounded-full shadow-sm", primaryId === image.id ? "bg-ad-red text-white" : "bg-white/90 text-ad-ink-2")}
                      aria-label="Definir como principal"
                    >
                      <Star className="size-4" fill={primaryId === image.id ? "currentColor" : "none"} />
                    </button>
                    {primaryId === image.id && <span className="absolute bottom-2 left-2 rounded-full bg-ad-ink/80 px-2 py-0.5 text-[11px] font-semibold text-white">Principal</span>}
                  </div>
                  <input type="hidden" name="existing_image_id" value={image.id} />
                  <div className="flex items-center gap-1 p-1.5">
                    <button type="button" onClick={() => moveImage(index, -1)} className="grid size-9 place-items-center rounded-full text-ad-muted hover:bg-white" aria-label="Mover para a esquerda"><ArrowLeft className="size-4" /></button>
                    <button type="button" onClick={() => moveImage(index, 1)} className="grid size-9 place-items-center rounded-full text-ad-muted hover:bg-white" aria-label="Mover para a direita"><ArrowRight className="size-4" /></button>
                    <button
                      type="button"
                      onClick={() => {
                        setGallery((items) => items.filter((item) => item.id !== image.id));
                        setDirty(true);
                      }}
                      className="ml-auto grid size-9 place-items-center rounded-full text-ad-muted hover:bg-ad-red-soft hover:text-ad-red"
                      aria-label="Remover foto"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <input name={`alt_${image.id}`} defaultValue={image.alt_text} placeholder="Descrição da foto" className="mx-1.5 mb-1.5 h-9 w-[calc(100%-12px)] rounded-lg bg-white px-2.5 text-[12.5px] text-ad-ink outline-none placeholder:text-ad-faint focus:ring-2 focus:ring-ad-ink/20" />
                </div>
              ))}
            </div>
          )}
          <input type="hidden" name="primary_image_id" value={primaryId} />
          <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d9d7d0] bg-ad-soft/60 px-4 py-5 text-center transition-colors hover:border-ad-ink/30 hover:bg-ad-soft">
            <span className="grid size-11 place-items-center rounded-full bg-white text-ad-ink-2 shadow-sm"><ImagePlus className="size-5" /></span>
            <span className="mt-2 text-[14px] font-semibold text-ad-ink">{gallery.length ? "Adicionar mais fotos" : "Escolher fotos"}</span>
            <span className="mt-0.5 text-[12.5px] text-ad-muted">Da galeria do celular ou do computador</span>
            <input className="sr-only" type="file" name="images" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))} />
          </label>
          {previews.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-[13px] font-medium text-[#1f7a3d]">{previews.length} foto(s) nova(s) — serão enviadas ao salvar</p>
              <div className="admin-noscroll flex gap-2 overflow-x-auto">
                {previews.map((preview) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={preview.url} src={preview.url} alt={preview.name} className="size-20 shrink-0 rounded-xl object-cover" />
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Preço */}
        <Card title="Preço" subtitle="Use vírgula para os centavos. Ex.: 89,90">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={isSubscription ? "Preço avulso (opcional)" : "Preço de venda"} htmlFor="price">
              <Input id="price" name="price" inputMode="decimal" prefix="R$" defaultValue={previewPrice} placeholder="0,00" />
            </FormField>
            <FormField label="Preço antigo (riscado)" htmlFor="compare_at_price" hint="Preencha para mostrar como promoção.">
              <Input id="compare_at_price" name="compare_at_price" inputMode="decimal" prefix="R$" defaultValue={centsToInput(product?.compare_at_price)} placeholder="0,00" />
            </FormField>
            <FormField label="Promoção começa em" htmlFor="promotion_starts_at">
              <Input id="promotion_starts_at" name="promotion_starts_at" type="datetime-local" defaultValue={product?.promotion_starts_at?.slice(0, 16) ?? ""} />
            </FormField>
            <FormField label="Promoção termina em" htmlFor="promotion_ends_at">
              <Input id="promotion_ends_at" name="promotion_ends_at" type="datetime-local" defaultValue={product?.promotion_ends_at?.slice(0, 16) ?? ""} />
            </FormField>
          </div>
        </Card>

        {!isPhysical && (
          <Card title="Cobrança e acesso" subtitle="Como o cliente paga e por quanto tempo pode ler.">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                {([["one_time", "Pagamento único"], ["subscription", "Assinatura mensal"]] as const).map(([value, label]) => (
                  <label key={value} className={cn("flex h-12 cursor-pointer items-center justify-center rounded-2xl text-[14px] font-semibold", billing === value ? "bg-ad-ink text-white" : "bg-ad-soft text-ad-ink-2")}>
                    <input type="radio" name="billing_model" value={value} checked={billing === value} onChange={() => setBilling(value)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
              {isSubscription ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Valor mensal" htmlFor="monthly_price">
                    <Input id="monthly_price" name="monthly_price" inputMode="decimal" prefix="R$" defaultValue={centsToInput(product?.monthly_price)} />
                  </FormField>
                  <FormField label="Carência" htmlFor="grace_days" hint="Dias de acesso após vencer a mensalidade.">
                    <Input id="grace_days" name="grace_days" type="number" suffix="dias" defaultValue={product?.grace_days ?? 5} />
                  </FormField>
                </div>
              ) : (
                <FormField label="Duração do acesso" htmlFor="access_duration_days" hint="Deixe vazio para acesso para sempre.">
                  <Input id="access_duration_days" name="access_duration_days" type="number" suffix="dias" defaultValue={product?.access_duration_days ?? ""} />
                </FormField>
              )}
              {type === "ebook" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Autoria" htmlFor="author"><Input id="author" name="author" defaultValue={product?.author ?? ""} /></FormField>
                  <FormField label="Capítulos" htmlFor="chapters_count"><Input id="chapters_count" name="chapters_count" type="number" defaultValue={product?.chapters_count ?? ""} /></FormField>
                </div>
              )}
            </div>
          </Card>
        )}

        {isPhysical && (
          <>
            <Card title="Estoque">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Quantidade" htmlFor="stock"><Input id="stock" name="stock" type="number" inputMode="numeric" suffix="un." defaultValue={product?.stock ?? 0} /></FormField>
                <FormField label="Avisar quando chegar a" htmlFor="minimum_stock"><Input id="minimum_stock" name="minimum_stock" type="number" inputMode="numeric" suffix="un." defaultValue={product?.minimum_stock ?? 5} /></FormField>
              </div>
              <div className="mt-4 divide-y divide-ad-line rounded-2xl bg-ad-soft/60 px-4">
                <Toggle name="track_inventory" label="Controlar estoque" description="Baixa automática a cada venda." defaultChecked={product?.track_inventory ?? true} className="py-3" />
                <Toggle name="allow_backorder" label="Vender mesmo sem estoque" description="Aceita pedido e você repõe depois." defaultChecked={product?.allow_backorder ?? false} className="py-3" />
              </div>
            </Card>

            <Card title="Tamanhos, cores e variações" subtitle="Uma linha por grupo, opções separadas por vírgula.">
              <Textarea id="variants" name="variants" placeholder={"Tamanho: P, M, G\nCor: Preto, Vermelho"} defaultValue={variantsToText(product?.variants ?? [])} className="font-mono text-[14px]" />
            </Card>

            <details className="admin-card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-[15.5px] font-semibold text-ad-ink">Entrega e dimensões</span>
                  <span className="block text-[13px] text-ad-muted">Peso, medidas e prazo extra (opcional)</span>
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-ad-soft text-ad-muted transition-transform group-open:rotate-90"><ArrowRight className="size-4" /></span>
              </summary>
              <div className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
                <Toggle name="requires_shipping" label="Precisa de entrega" description="Desligue para itens retirados na academia." defaultChecked={product?.requires_shipping ?? true} />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <FormField label="Peso" htmlFor="weight_grams"><Input id="weight_grams" name="weight_grams" type="number" suffix="g" defaultValue={product?.weight_grams ?? ""} /></FormField>
                  <FormField label="Largura" htmlFor="width_cm"><Input id="width_cm" name="width_cm" type="number" step="0.01" suffix="cm" defaultValue={product?.width_cm ?? ""} /></FormField>
                  <FormField label="Altura" htmlFor="height_cm"><Input id="height_cm" name="height_cm" type="number" step="0.01" suffix="cm" defaultValue={product?.height_cm ?? ""} /></FormField>
                  <FormField label="Comprimento" htmlFor="length_cm"><Input id="length_cm" name="length_cm" type="number" step="0.01" suffix="cm" defaultValue={product?.length_cm ?? ""} /></FormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Prazo adicional" htmlFor="extra_lead_days"><Input id="extra_lead_days" name="extra_lead_days" type="number" suffix="dias" defaultValue={product?.extra_lead_days ?? 0} /></FormField>
                  <FormField label="Observações da entrega" htmlFor="shipping_notes"><Input id="shipping_notes" name="shipping_notes" defaultValue={product?.shipping_notes ?? ""} /></FormField>
                </div>
              </div>
            </details>
          </>
        )}

        <details className="admin-card group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:px-6 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block text-[15.5px] font-semibold text-ad-ink">Código e etiquetas</span>
              <span className="block text-[13px] text-ad-muted">SKU e palavras para a busca (opcional)</span>
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-ad-soft text-ad-muted transition-transform group-open:rotate-90"><ArrowRight className="size-4" /></span>
          </summary>
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
            <FormField label="SKU" htmlFor="sku"><Input id="sku" name="sku" defaultValue={product?.sku ?? ""} /></FormField>
            <FormField label="Etiquetas" htmlFor="tags" hint="Separe por vírgulas."><Input id="tags" name="tags" defaultValue={product?.tags?.join(", ") ?? ""} /></FormField>
          </div>
        </details>
      </div>

      {/* Publicação */}
      <aside className="h-fit space-y-4 xl:sticky xl:top-[92px]">
        <Card title="Publicação">
          <FormField label="Situação" htmlFor="status">
            <Select id="status" name="status" defaultValue={product?.status ?? "active"}>
              <option value="active">Ativo — à venda</option>
              <option value="draft">Rascunho</option>
              <option value="inactive">Inativo</option>
              <option value="archived">Arquivado</option>
            </Select>
          </FormField>
          <div className="mt-3 divide-y divide-ad-line">
            <Toggle name="active" label="Visível na loja" defaultChecked={product?.active ?? true} className="py-3" />
            <Toggle name="featured" label="Em destaque" defaultChecked={product?.featured ?? false} className="py-3" />
            <Toggle name="show_on_home" label="Mostrar na vitrine" defaultChecked={product?.show_on_home ?? false} className="py-3" />
            <Toggle name="is_new" label="Selo de lançamento" defaultChecked={product?.is_new ?? false} className="py-3" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <FormField label="Ordem" htmlFor="featured_order"><Input id="featured_order" name="featured_order" type="number" defaultValue={product?.featured_order ?? ""} placeholder="1" /></FormField>
            <FormField label="Selo" htmlFor="custom_badge"><Input id="custom_badge" name="custom_badge" defaultValue={product?.custom_badge ?? ""} placeholder="Ex.: -20%" /></FormField>
          </div>
        </Card>

        {state.error && <Alert>{state.error}</Alert>}

        <div className="hidden space-y-2 xl:block">
          <button type="submit" disabled={pending} className={btn("brand", "lg", "w-full")}>
            {pending ? "Salvando…" : product ? "Salvar alterações" : "Criar produto"}
          </button>
          <Link href="/admin/produtos" className={btn("secondary", "lg", "w-full")}>Cancelar</Link>
          {dirty && !pending && <p className="text-center text-[12px] font-medium text-[#a05a06]">Alterações ainda não salvas</p>}
        </div>
      </aside>

      {/* Barra de salvar fixa no celular */}
      <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 -mx-1 rounded-[22px] bg-ad-bg/85 p-1 backdrop-blur-md xl:hidden">
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className={btn("brand", "lg", "flex-1 shadow-[0_8px_20px_-8px_rgb(210_31_53/0.6)]")}>
            {pending ? "Salvando…" : product ? "Salvar alterações" : "Criar produto"}
          </button>
          <Link href="/admin/produtos" className={btn("secondary", "lg")}>Cancelar</Link>
        </div>
        {dirty && !pending && <p className="mt-1 text-center text-[12px] font-medium text-[#a05a06]">Alterações ainda não salvas</p>}
      </div>
    </form>
  );
}
