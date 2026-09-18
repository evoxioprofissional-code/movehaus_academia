"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Pencil, Star } from "lucide-react";
import { useState } from "react";
import { bulkUpdateProducts, deleteProduct, toggleProductActive } from "@/lib/admin/actions";
import type { ProductImageRow, ProductRow } from "@/lib/admin/data";
import { publicEnv } from "@/lib/env";
import { formatBRL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Row = ProductRow & { categoryName: string; primaryImage?: ProductImageRow };
const typeLabel = { physical: "Físico", digital: "Programa", ebook: "E-book" };

function imageUrl(image?: ProductImageRow) {
  if (!image) return "";
  return image.legacy_url || (image.storage_path ? `${publicEnv.supabaseUrl}/storage/v1/object/public/catalog/${image.storage_path}` : "");
}

export function ProductTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const all = rows.length > 0 && selected.length === rows.length;
  function toggle(id: string) { setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); }

  return (
    <div className="mt-4">
      {selected.length > 0 && <form action={bulkUpdateProducts} className="mb-3 flex flex-wrap items-center gap-2 rounded-md bg-mh-surface px-3 py-2"><span className="mr-2 text-sm text-mh-muted">{selected.length} selecionado(s)</span>{selected.map((id) => <input key={id} type="hidden" name="ids" value={id} />)}<select name="operation" className="h-9 rounded border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="activate">Ativar</option><option value="deactivate">Desativar</option><option value="feature">Destacar</option><option value="unfeature">Remover destaque</option></select><button className="h-9 rounded bg-white px-3 text-sm font-medium text-black">Aplicar</button></form>}
      <div className="overflow-hidden rounded-lg bg-mh-surface">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="border-b border-white/8 bg-white/[0.025] text-left text-xs text-mh-muted"><tr><th className="w-10 px-4 py-3"><input type="checkbox" checked={all} onChange={() => setSelected(all ? [] : rows.map((row) => row.id))} /></th><th className="px-3 py-3">Produto</th><th className="px-3 py-3">Tipo</th><th className="px-3 py-3">Preço</th><th className="px-3 py-3">Estoque</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Cobrança</th><th className="px-3 py-3">Atualizado</th><th className="w-12" /></tr></thead>
            <tbody className="divide-y divide-white/6">{rows.map((row) => { const src = imageUrl(row.primaryImage); const price = row.billing_model === "subscription" ? `${formatBRL(row.monthly_price ?? 0)}/mês` : formatBRL(row.price ?? 0); return <tr key={row.id} className="hover:bg-white/[0.025]"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /></td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="relative size-11 shrink-0 overflow-hidden rounded bg-[#0d0d0f]">{src ? <Image src={src} alt="" fill sizes="44px" className="object-cover" /> : <span className="grid h-full place-items-center text-[10px] text-mh-muted">sem foto</span>}</div><div><div className="flex items-center gap-1.5 font-medium text-white">{row.name}{row.featured && <Star className="size-3.5 fill-amber-300 text-amber-300" />}</div><div className="text-xs text-mh-muted">{row.categoryName} · {row.sku || "sem SKU"}</div></div></div></td><td className="px-3 text-mh-muted">{typeLabel[row.type]}</td><td className="px-3 tabular-nums text-white">{price}{row.compare_at_price && <div className="text-xs text-mh-muted line-through">{formatBRL(row.compare_at_price)}</div>}</td><td className="px-3"><span className={row.type === "physical" && row.stock <= row.minimum_stock ? "text-amber-300" : "text-mh-muted"}>{row.type === "physical" ? row.stock : "—"}</span></td><td className="px-3">{row.active ? <Badge tone="success">Ativo</Badge> : <Badge tone="muted">Inativo</Badge>}</td><td className="px-3 text-mh-muted">{row.billing_model === "subscription" ? "Mensal" : row.type === "physical" ? "Venda" : "Único"}</td><td className="px-3 text-xs text-mh-muted">{new Intl.DateTimeFormat("pt-BR").format(new Date(row.updated_at))}</td><td className="px-3"><details className="relative"><summary className="grid size-8 cursor-pointer list-none place-items-center rounded hover:bg-white/5"><MoreHorizontal className="size-4" /></summary><div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-white/10 bg-[#18181b] p-1 shadow-xl"><Link href={`/admin/produtos/${row.id}`} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-white/5"><Pencil className="size-4" />Editar</Link><form action={toggleProductActive}><input type="hidden" name="id" value={row.id} /><input type="hidden" name="active" value={String(!row.active)} /><button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-white/5">{row.active ? "Desativar" : "Ativar"}</button></form><form action={deleteProduct} onSubmit={(event) => { if (!confirm(`Excluir “${row.name}”? Esta ação não pode ser desfeita.`)) event.preventDefault(); }}><input type="hidden" name="id" value={row.id} /><button className="w-full rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">Excluir</button></form></div></details></td></tr>; })}</tbody>
          </table>
        </div>
        <div className="divide-y divide-white/8 lg:hidden">{rows.map((row) => <div key={row.id} className="p-4"><div className="flex gap-3"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggle(row.id)} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate font-medium">{row.name}</p><Badge tone={row.active ? "success" : "muted"}>{row.active ? "Ativo" : "Inativo"}</Badge></div><p className="mt-1 text-xs text-mh-muted">{row.categoryName} · {typeLabel[row.type]}</p><div className="mt-3 flex items-center justify-between"><span className="text-sm font-medium">{row.billing_model === "subscription" ? `${formatBRL(row.monthly_price ?? 0)}/mês` : formatBRL(row.price ?? 0)}</span><Link href={`/admin/produtos/${row.id}`} className="rounded border border-white/10 px-3 py-1.5 text-xs">Editar</Link></div></div></div></div>)}</div>
      </div>
    </div>
  );
}
