import { Plus, Tags } from "lucide-react";
import { CategoryDelete } from "@/components/admin/category-delete";
import { Badge, Card, Empty, FormField, Input, Page, PageHeader, Toggle, btn, inputCls } from "@/components/admin/kit";
import { upsertCategory } from "@/lib/admin/actions";
import { listCategoriesWithCounts } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Categorias | MoveHaus Admin" };

export default async function CategoriesPage() {
  const categories = await listCategoriesWithCounts();
  return (
    <Page narrow>
      <PageHeader title="Categorias" subtitle="Organize como os produtos aparecem nos filtros da loja." />

      <details className="admin-card group" open={categories.length === 0}>
        <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="grid size-10 place-items-center rounded-xl bg-ad-red text-white"><Plus className="size-5" strokeWidth={2.4} /></span>
          <span className="flex-1 text-[15px] font-semibold text-ad-ink">Nova categoria</span>
          <span className="text-[13px] text-ad-muted group-open:hidden">Toque para abrir</span>
        </summary>
        <form action={upsertCategory} className="grid gap-4 border-t border-ad-line p-4 sm:grid-cols-[1fr_1.4fr_110px] sm:px-5">
          <FormField label="Nome"><Input name="name" required placeholder="Ex.: Camisetas" /></FormField>
          <FormField label="Descrição (opcional)"><Input name="description" /></FormField>
          <FormField label="Ordem"><Input name="position" type="number" defaultValue={categories.length + 1} /></FormField>
          <Toggle name="active" label="Mostrar na loja" defaultChecked className="sm:col-span-2" />
          <button className={btn("primary", "md", "sm:self-end")}>Adicionar</button>
        </form>
      </details>

      {categories.length === 0 ? (
        <Card className="mt-4"><Empty icon={Tags} title="Nenhuma categoria" text="Crie a primeira categoria para organizar os produtos." /></Card>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {categories.map((category) => (
            <li key={category.id}>
              <form action={upsertCategory} className="admin-card p-4 sm:px-5">
                <input type="hidden" name="id" value={category.id} />
                <input type="hidden" name="slug" value={category.slug} />
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ad-soft text-[13px] font-bold tabular-nums text-ad-ink-2">{category.position}</span>
                  <div className="min-w-0 flex-1">
                    <input name="name" defaultValue={category.name} aria-label="Nome" className="w-full rounded-lg bg-transparent px-1 py-0.5 text-[16px] font-semibold text-ad-ink outline-none hover:bg-ad-soft focus:bg-ad-soft" />
                    <input name="description" defaultValue={category.description} placeholder="Adicionar descrição" aria-label="Descrição" className="w-full rounded-lg bg-transparent px-1 py-0.5 text-[13.5px] text-ad-muted outline-none placeholder:text-ad-faint hover:bg-ad-soft focus:bg-ad-soft" />
                  </div>
                  <Badge tone={category.productCount ? "neutral" : "amber"}>{category.productCount} produto(s)</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ad-line pt-3">
                  <label className="flex items-center gap-2 text-[13px] text-ad-muted">
                    Ordem
                    <input name="position" type="number" defaultValue={category.position} className={cn(inputCls, "h-10 w-20 text-center")} />
                  </label>
                  <Toggle name="active" label={category.active ? "Na loja" : "Oculta"} defaultChecked={category.active} className="flex-row-reverse gap-2.5 [&>span:first-child>span]:text-[13px]" />
                  <div className="ml-auto flex items-center gap-1">
                    <CategoryDelete id={category.id} count={category.productCount} name={category.name} />
                    <button className={btn("secondary", "sm")}>Salvar</button>
                  </div>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
