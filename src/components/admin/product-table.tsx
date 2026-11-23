"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Eye, EyeOff, ImageOff, MoreHorizontal, Pencil, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { bulkUpdateProducts, deleteProduct, toggleProductActive } from "@/lib/admin/actions";
import type { ProductImageRow, ProductRow } from "@/lib/admin/data";
import { publicEnv } from "@/lib/env";
import { cn, formatBRL } from "@/lib/utils";
import { Badge, Card } from "@/components/admin/kit";

type Row = ProductRow & { categoryName: string; primaryImage?: ProductImageRow };
const typeLabel = { physical: "Físico", digital: "PDF", ebook: "E-book" };

function imageUrl(image?: ProductImageRow) {
  if (!image) return "";
  return image.legacy_url || (image.storage_path ? `${publicEnv.supabaseUrl}/storage/v1/object/public/catalog/${image.storage_path}` : "");
}

function priceOf(row: Row) {
  return row.billing_model === "subscription" ? `${formatBRL(row.monthly_price ?? 0)}/mês` : formatBRL(row.price ?? 0);
}

function StockBadge({ row }: { row: Row }) {
  if (row.type !== "physical") return <span className="text-[13px] text-ad-faint">Digital</span>;
  if (!row.track_inventory) return <span className="text-[13px] text-ad-muted">Sem controle</span>;
  if (row.stock <= 0) return <Badge tone="red">Esgotado</Badge>;
  if (row.stock <= row.minimum_stock) return <Badge tone="amber">{row.stock} un. · baixo</Badge>;
  return <span className="text-[13.5px] tabular-nums text-ad-ink-2">{row.stock} un.</span>;
}

function Thumb({ row, size = 48 }: { row: Row; size?: number }) {
  const src = imageUrl(row.primaryImage);
  return (
    <span className="relative shrink-0 overflow-hidden rounded-xl bg-ad-soft" style={{ width: size, height: size }}>
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : <ImageOff className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-ad-faint" />}
    </span>
  );
}

function RowMenu({ row }: { row: Row }) {
  return (
    <details className="relative">
      <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-full text-ad-muted hover:bg-ad-soft hover:text-ad-ink [&::-webkit-details-marker]:hidden" aria-label="Mais ações">
        <MoreHorizontal className="size-[18px]" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-48 rounded-2xl bg-white p-1.5 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.25),0_0_0_1px_rgb(32_37_34/0.06)]">
        <Link href={`/admin/produtos/${row.id}`} className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] text-ad-ink hover:bg-ad-soft"><Pencil className="size-4 text-ad-muted" />Editar</Link>
        <form action={toggleProductActive}>
          <input type="hidden" name="id" value={row.id} />
          <input type="hidden" name="active" value={String(!row.active)} />
          <button className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] text-ad-ink hover:bg-ad-soft">
            {row.active ? <EyeOff className="size-4 text-ad-muted" /> : <Eye className="size-4 text-ad-muted" />}
            {row.active ? "Tirar da loja" : "Colocar na loja"}
          </button>
        </form>
        <form action={deleteProduct} onSubmit={(event) => { if (!confirm(`Excluir “${row.name}”? Esta ação não pode ser desfeita.`)) event.preventDefault(); }}>
          <input type="hidden" name="id" value={row.id} />
          <button className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[14px] text-ad-red hover:bg-ad-red-soft"><Trash2 className="size-4" />Excluir</button>
        </form>
      </div>
    </details>
  );
}

function Check2({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="grid size-9 shrink-0 cursor-pointer place-items-center" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className={cn("grid size-[22px] place-items-center rounded-[7px] border-2 transition-colors", checked ? "border-ad-ink bg-ad-ink text-white" : "border-[#cfcdc6] bg-white")}>
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </label>
  );
}

const GRID = "lg:grid-cols-[36px_minmax(0,2.4fr)_90px_130px_140px_110px_44px]";

export function ProductTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const all = rows.length > 0 && selected.length === rows.length;
  function toggle(id: string) {
    setSelected((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  }

  return (
    <div className="mt-4">
      <Card padded={false} className="overflow-visible">
        <div className={cn("hidden items-center gap-3 border-b border-ad-line px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-ad-faint lg:grid", GRID)}>
          <Check2 checked={all} onChange={() => setSelected(all ? [] : rows.map((row) => row.id))} label="Selecionar todos" />
          <span>Produto</span>
          <span>Tipo</span>
          <span className="text-right">Preço</span>
          <span>Estoque</span>
          <span>Situação</span>
          <span />
        </div>
        <ul className="divide-y divide-ad-line">
          {rows.map((row) => (
            <li key={row.id} className={cn("relative grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 sm:px-4", GRID, selected.includes(row.id) && "bg-ad-soft/70")}>
              <Check2 checked={selected.includes(row.id)} onChange={() => toggle(row.id)} label={`Selecionar ${row.name}`} />

              {/* Celular: linha inteira clicável */}
              <Link href={`/admin/produtos/${row.id}`} className="flex min-w-0 items-center gap-3 lg:hidden">
                <Thumb row={row} size={56} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[14.5px] font-semibold text-ad-ink">{row.name}</span>
                    {row.featured && <Star className="size-3.5 shrink-0 fill-[#e08a1a] text-[#e08a1a]" />}
                  </span>
                  <span className="mt-0.5 block text-[14px] font-semibold tabular-nums text-ad-ink-2">{priceOf(row)}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    {!row.active && <Badge tone="neutral">Fora da loja</Badge>}
                    {row.type === "physical" ? <StockBadge row={row} /> : <Badge tone="blue">{typeLabel[row.type]}</Badge>}
                  </span>
                </span>
              </Link>
              <ChevronRight className="size-5 text-ad-faint lg:hidden" />

              {/* Computador */}
              <Link href={`/admin/produtos/${row.id}`} className="hidden min-w-0 items-center gap-3 lg:flex">
                <Thumb row={row} />
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-semibold text-ad-ink hover:underline">{row.name}</span>
                    {row.featured && <Star className="size-3.5 shrink-0 fill-[#e08a1a] text-[#e08a1a]" />}
                  </span>
                  <span className="block truncate text-[12.5px] text-ad-muted">{row.categoryName}{row.sku ? ` · ${row.sku}` : ""}</span>
                </span>
              </Link>
              <span className="hidden text-[13.5px] text-ad-ink-2 lg:block">{typeLabel[row.type]}</span>
              <span className="hidden text-right lg:block">
                <span className="block text-[14px] font-semibold tabular-nums text-ad-ink">{priceOf(row)}</span>
                {row.compare_at_price ? <span className="block text-[12px] tabular-nums text-ad-faint line-through">{formatBRL(row.compare_at_price)}</span> : null}
              </span>
              <span className="hidden lg:block"><StockBadge row={row} /></span>
              <span className="hidden lg:block">{row.active ? <Badge tone="green" dot>Na loja</Badge> : <Badge tone="neutral" dot>Fora</Badge>}</span>
              <span className="hidden justify-end lg:flex"><RowMenu row={row} /></span>
            </li>
          ))}
        </ul>
      </Card>

      {selected.length > 0 && (
        <form action={bulkUpdateProducts} onSubmit={() => setTimeout(() => setSelected([]), 0)} className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[560px] items-center gap-2 rounded-full bg-ad-ink p-1.5 pl-4 text-white shadow-[0_16px_40px_-12px_rgb(0_0_0/0.5)] lg:bottom-6 lg:left-[calc(256px+1.5rem)]">
          {selected.map((id) => <input key={id} type="hidden" name="ids" value={id} />)}
          <span className="shrink-0 text-[13.5px] font-semibold tabular-nums">{selected.length} selec.</span>
          <select name="operation" aria-label="Ação em massa" className="h-10 min-w-0 flex-1 cursor-pointer rounded-full border-0 bg-white/12 px-3 text-[13.5px] text-white outline-none [&>option]:text-ad-ink">
            <option value="activate">Colocar na loja</option>
            <option value="deactivate">Tirar da loja</option>
            <option value="feature">Destacar</option>
            <option value="unfeature">Remover destaque</option>
          </select>
          <button className="h-10 shrink-0 rounded-full bg-ad-red px-4 text-[13.5px] font-semibold">Aplicar</button>
          <button type="button" onClick={() => setSelected([])} aria-label="Limpar seleção" className="grid size-10 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10"><X className="size-4" /></button>
        </form>
      )}
    </div>
  );
}

