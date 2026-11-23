import Link from "next/link";
import { Package, Plus, Search, SlidersHorizontal } from "lucide-react";
import { ProductTable } from "@/components/admin/product-table";
import { Card, Empty, Page, PageHeader, Select, btn, inputCls } from "@/components/admin/kit";
import { listCategories, listProductsPage } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

export const metadata = { title: "Produtos | MoveHaus Admin" };

const QUICK = [
  { label: "Todos", query: {} },
  { label: "Físicos", query: { type: "physical" } },
  { label: "PDFs", query: { type: "digital" } },
  { label: "E-books", query: { type: "ebook" } },
  { label: "Estoque baixo", query: { stock: "low" } },
  { label: "Esgotados", query: { stock: "out" } },
  { label: "Inativos", query: { status: "inactive" } },
] as { label: string; query: Record<string, string> }[];

export default async function AdminProdutosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const filters = { search: value("q"), category: value("category"), type: value("type"), status: value("status"), stock: value("stock"), featured: value("featured"), sort: value("sort"), page: Number(value("page")) || 1 };
  const [{ products, count, page, pageSize, primaryByProduct }, categories] = await Promise.all([listProductsPage(filters), listCategories()]);
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const rows = products.map((product) => ({ ...product, categoryName: product.category_id ? categoryName.get(product.category_id) ?? "Sem categoria" : "Sem categoria", primaryImage: primaryByProduct.get(product.id) }));
  const pages = Math.max(1, Math.ceil(count / pageSize));
  const advanced = !!(filters.category || filters.featured || (filters.sort && filters.sort !== "recent"));
  const quickActive = (query: Record<string, string>) => {
    const keys = ["type", "stock", "status"] as const;
    return keys.every((key) => (query[key] ?? "") === (filters[key] ?? ""));
  };
  const pageHref = (target: number) => ({ query: { ...Object.fromEntries(Object.entries(params).filter(([, v]) => typeof v === "string")), page: target } });

  return (
    <Page>
      <PageHeader
        title="Produtos"
        subtitle={`${count} ${count === 1 ? "item" : "itens"} no catálogo`}
        actions={
          <Link href="/admin/produtos/novo" className={btn("brand", "md", "hidden sm:inline-flex lg:hidden")}>
            <Plus className="size-[18px]" strokeWidth={2.4} /> Novo produto
          </Link>
        }
      />

      <form className="admin-card p-3">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ad-muted" />
            <input name="q" defaultValue={filters.search} placeholder="Buscar por nome ou SKU" className={cn(inputCls, "h-12 pl-11")} />
          </label>
          <button className={btn("primary", "md", "h-12")}>Buscar</button>
        </div>
        {filters.type && <input type="hidden" name="type" value={filters.type} />}
        {filters.stock && <input type="hidden" name="stock" value={filters.stock} />}
        {filters.status && <input type="hidden" name="status" value={filters.status} />}
        <details className="group mt-1" open={advanced}>
          <summary className="flex h-10 cursor-pointer list-none items-center gap-2 px-1 text-[13px] font-semibold text-ad-muted hover:text-ad-ink [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="size-4" /> Mais filtros
          </summary>
          <div className="grid gap-2 pt-1 sm:grid-cols-3">
            <Select name="category" defaultValue={filters.category} aria-label="Categoria">
              <option value="">Todas as categorias</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
            <Select name="featured" defaultValue={filters.featured} aria-label="Destaque">
              <option value="">Com ou sem destaque</option>
              <option value="yes">Só em destaque</option>
              <option value="no">Sem destaque</option>
            </Select>
            <Select name="sort" defaultValue={filters.sort} aria-label="Ordenar">
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="name">Nome (A–Z)</option>
              <option value="stock">Estoque</option>
            </Select>
          </div>
        </details>
      </form>

      <div className="admin-noscroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {QUICK.map((chip) => {
          const on = quickActive(chip.query);
          return (
            <Link
              key={chip.label}
              href={{ pathname: "/admin/produtos", query: { ...(filters.search ? { q: filters.search } : {}), ...chip.query } }}
              scroll={false}
              className={cn("inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13.5px] font-semibold transition-colors", on ? "bg-ad-ink text-white" : "bg-white text-ad-ink-2 shadow-[0_0_0_1px_rgb(32_37_34/0.08)] hover:bg-ad-soft")}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      {rows.length ? (
        <ProductTable rows={rows} />
      ) : (
        <Card className="mt-4">
          <Empty
            icon={Package}
            title="Nenhum produto encontrado"
            text="Ajuste a busca ou os filtros, ou cadastre um item novo."
            action={<Link href="/admin/produtos/novo" className={btn("brand", "md")}><Plus className="size-4" /> Novo produto</Link>}
          />
        </Card>
      )}

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-2">
          <span className="text-[13px] text-ad-muted">Página {page} de {pages}</span>
          <div className="flex gap-2">
            {page > 1 && <Link className={btn("secondary", "sm")} href={pageHref(page - 1)}>Anterior</Link>}
            {page < pages && <Link className={btn("secondary", "sm")} href={pageHref(page + 1)}>Próxima</Link>}
          </div>
        </nav>
      )}
    </Page>
  );
}
