"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  createProduct,
  updateProduct,
  type FormState,
} from "@/lib/admin/actions";
import type { ProductRow, CategoryRow } from "@/lib/admin/data";

const centsToInput = (c: number | null | undefined) =>
  c == null ? "" : (c / 100).toFixed(2).replace(".", ",");

const variantsToText = (v: { label: string; options: string[] }[] | null) =>
  (v ?? []).map((g) => `${g.label}: ${g.options.join(", ")}`).join("\n");

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  const { label, id, className, ...rest } = props;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      <textarea
        id={id}
        className={`w-full rounded-mh border border-mh-border bg-mh-surface px-3 py-2 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none ${className ?? ""}`}
        {...rest}
      />
    </div>
  );
}

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductRow;
  categories: CategoryRow[];
}) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  const [type, setType] = useState<string>(product?.type ?? "physical");
  const [billing, setBilling] = useState<string>(
    product?.billing_model ?? "one_time",
  );
  const [kept, setKept] = useState<string[]>(product?.images ?? []);

  const isPhysical = type === "physical";
  const isSub = !isPhysical && billing === "subscription";

  return (
    <form action={formAction} className="max-w-3xl space-y-6" encType="multipart/form-data">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" name="name" label="Nome" defaultValue={product?.name} required />
        <Field
          id="slug"
          name="slug"
          label="Slug (URL)"
          hint="Deixe em branco para gerar do nome."
          defaultValue={product?.slug}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="type" className="block text-sm font-medium text-white">Tipo</label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 w-full rounded-mh border border-mh-border bg-mh-surface px-3 text-sm text-white focus:border-mh-red focus:outline-none"
          >
            <option value="physical">Produto físico</option>
            <option value="digital">Programa digital</option>
            <option value="ebook">E-book</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="category_id" className="block text-sm font-medium text-white">Categoria</label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="h-11 w-full rounded-mh border border-mh-border bg-mh-surface px-3 text-sm text-white focus:border-mh-red focus:outline-none"
          >
            <option value="">— sem categoria —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Field
        id="short_description"
        name="short_description"
        label="Descrição curta"
        defaultValue={product?.short_description}
      />
      <Textarea
        id="description"
        name="description"
        label="Descrição completa"
        rows={4}
        defaultValue={product?.description}
      />

      {/* Campos por tipo */}
      {isPhysical ? (
        <div className="space-y-4 rounded-lg border border-white/10 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="price" name="price" label="Preço (R$)" placeholder="129,90" defaultValue={centsToInput(product?.price)} />
            <Field id="compare_at_price" name="compare_at_price" label="Preço de (promoção)" placeholder="159,90" defaultValue={centsToInput(product?.compare_at_price)} />
            <Field id="stock" name="stock" label="Estoque" type="number" defaultValue={product?.stock ?? 0} />
            <Field id="sku" name="sku" label="SKU" defaultValue={product?.sku ?? ""} />
            <Field id="weight_grams" name="weight_grams" label="Peso (g)" type="number" defaultValue={product?.weight_grams ?? ""} />
          </div>
          <Textarea
            id="variants"
            name="variants"
            label="Variações (uma por linha: Rótulo: opção1, opção2)"
            rows={3}
            placeholder="Tamanho: P, M, G, GG"
            defaultValue={variantsToText(product?.variants ?? [])}
          />
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border border-white/10 p-4">
          <div className="space-y-1.5">
            <label htmlFor="billing_model" className="block text-sm font-medium text-white">Modelo de cobrança</label>
            <select
              id="billing_model"
              name="billing_model"
              value={billing}
              onChange={(e) => setBilling(e.target.value)}
              className="h-11 w-full rounded-mh border border-mh-border bg-mh-surface px-3 text-sm text-white focus:border-mh-red focus:outline-none"
            >
              <option value="one_time">Pagamento único</option>
              <option value="subscription">Assinatura mensal</option>
            </select>
          </div>
          {isSub ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="monthly_price" name="monthly_price" label="Valor mensal (R$)" placeholder="39,90" defaultValue={centsToInput(product?.monthly_price)} />
              <Field id="grace_days" name="grace_days" label="Carência (dias)" type="number" defaultValue={product?.grace_days ?? 5} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="price" name="price" label="Preço (R$)" placeholder="49,90" defaultValue={centsToInput(product?.price)} />
              <Field
                id="access_duration_days"
                name="access_duration_days"
                label="Dias de acesso"
                type="number"
                hint="Em branco = acesso permanente."
                defaultValue={product?.access_duration_days ?? ""}
              />
            </div>
          )}
          {type === "ebook" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="author" name="author" label="Autoria" defaultValue={product?.author ?? ""} />
              <Field id="chapters_count" name="chapters_count" label="Nº de capítulos" type="number" defaultValue={product?.chapters_count ?? ""} />
            </div>
          )}
        </div>
      )}

      {/* Imagens */}
      <div className="space-y-3 rounded-lg border border-white/10 p-4">
        <p className="text-sm font-medium text-white">Imagens</p>
        {kept.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {kept.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-20 rounded-md border border-mh-border object-cover" />
                <input type="hidden" name="existingImages" value={url} />
                <button
                  type="button"
                  onClick={() => setKept((k) => k.filter((u) => u !== url))}
                  aria-label="Remover imagem"
                  className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-mh-red text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="block w-full text-sm text-mh-muted file:mr-3 file:rounded-md file:border-0 file:bg-mh-surface-2 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-mh-elevated"
        />
        <p className="text-xs text-mh-muted">Envie uma ou mais imagens (a primeira é a capa).</p>
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-white">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-4 accent-mh-red" />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm text-white">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-4 accent-mh-red" />
          Ativo
        </label>
      </div>

      {state.error && (
        <p className="rounded-mh border border-mh-red/40 bg-mh-red/10 px-4 py-3 text-sm text-mh-red-soft">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/admin/produtos">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
