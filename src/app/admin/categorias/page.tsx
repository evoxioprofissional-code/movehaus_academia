import { Trash2 } from "lucide-react";
import { listCategories } from "@/lib/admin/data";
import { upsertCategory, deleteCategory } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriasPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Categorias
      </h1>

      {/* Nova categoria */}
      <form
        action={upsertCategory}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-white/10 bg-mh-surface p-4"
      >
        <div className="flex-1 space-y-1.5">
          <label className="block text-sm font-medium text-white">Nome</label>
          <input
            name="name"
            required
            placeholder="Ex.: Suplementos"
            className="h-10 w-full rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
          />
        </div>
        <div className="w-24 space-y-1.5">
          <label className="block text-sm font-medium text-white">Ordem</label>
          <input
            name="position"
            type="number"
            defaultValue={categories.length + 1}
            className="h-10 w-full rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-white focus:border-mh-red focus:outline-none"
          />
        </div>
        <Button type="submit">Adicionar</Button>
      </form>

      {/* Lista */}
      <div className="mt-6 space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-mh-surface p-3"
          >
            <form action={upsertCategory} className="flex flex-1 flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <input
                name="name"
                defaultValue={c.name}
                className="h-9 flex-1 rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-white focus:border-mh-red focus:outline-none"
              />
              <input
                name="slug"
                defaultValue={c.slug}
                className="h-9 w-40 rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-mh-muted focus:border-mh-red focus:outline-none"
              />
              <input
                name="position"
                type="number"
                defaultValue={c.position}
                className="h-9 w-16 rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-white focus:border-mh-red focus:outline-none"
              />
              <label className="flex items-center gap-1.5 text-xs text-mh-muted">
                <input type="checkbox" name="active" defaultChecked={c.active} className="size-4 accent-mh-red" />
                ativa
              </label>
              <Button type="submit" variant="outline" size="sm">Salvar</Button>
            </form>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                aria-label="Excluir categoria"
                className="grid size-9 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-mh-red-soft"
              >
                <Trash2 className="size-4" />
              </button>
            </form>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-mh-muted">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
}
