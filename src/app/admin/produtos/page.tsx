import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductTable } from "@/components/admin/product-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listCategories, listProductsPage } from "@/lib/admin/data";
import { Package } from "lucide-react";

export const metadata = { title: "Produtos | MoveHaus Admin" };

export default async function AdminProdutosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const filters = { search: value("q"), category: value("category"), type: value("type"), status: value("status"), stock: value("stock"), featured: value("featured"), sort: value("sort"), page: Number(value("page")) || 1 };
  const [{ products, count, page, pageSize, primaryByProduct }, categories] = await Promise.all([listProductsPage(filters), listCategories()]);
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const rows = products.map((product) => ({ ...product, categoryName: product.category_id ? categoryName.get(product.category_id) ?? "Sem categoria" : "Sem categoria", primaryImage: primaryByProduct.get(product.id) }));
  const pages = Math.max(1, Math.ceil(count / pageSize));

  return <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
    <AdminPageHeader title="Produtos" description={`${count} produto(s) no catálogo.`} action={<Button asChild><Link href="/admin/produtos/novo"><Plus className="size-4" />Novo produto</Link></Button>} />
    <form className="mt-5 grid gap-2 rounded-lg bg-mh-surface p-3 md:grid-cols-[minmax(220px,1fr)_repeat(5,minmax(120px,auto))]">
      <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mh-muted" /><input name="q" defaultValue={filters.search} placeholder="Buscar por nome ou SKU" className="h-10 w-full rounded-md border border-white/10 bg-[#0d0d0f] pl-9 pr-3 text-sm outline-none focus:border-mh-red" /></label>
      <select name="category" defaultValue={filters.category} className="h-10 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="">Categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
      <select name="type" defaultValue={filters.type} className="h-10 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="">Tipos</option><option value="physical">Físico</option><option value="digital">Programa</option><option value="ebook">E-book</option></select>
      <select name="status" defaultValue={filters.status} className="h-10 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="">Status</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select>
      <select name="stock" defaultValue={filters.stock} className="h-10 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="">Estoque</option><option value="low">Baixo</option><option value="out">Esgotado</option></select>
      <select name="featured" defaultValue={filters.featured} className="h-10 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="">Destaque</option><option value="yes">Em destaque</option><option value="no">Sem destaque</option></select>
      <select name="sort" defaultValue={filters.sort} className="h-10 rounded-md border border-white/10 bg-[#0d0d0f] px-2 text-sm"><option value="recent">Mais recentes</option><option value="oldest">Mais antigos</option><option value="name">Nome</option><option value="stock">Estoque</option></select>
      <button className="h-10 rounded-md bg-white px-4 text-sm font-medium text-black md:col-start-6">Filtrar</button>
    </form>
    {rows.length ? <ProductTable rows={rows} /> : <div className="mt-5"><EmptyState icon={Package} title="Nenhum produto encontrado" description="Ajuste os filtros ou cadastre um novo produto." /></div>}
    {pages > 1 && <nav className="mt-4 flex items-center justify-end gap-2 text-sm"><span className="text-mh-muted">Página {page} de {pages}</span>{page > 1 && <Link className="rounded border border-white/10 px-3 py-2" href={{ query: { ...params, page: page - 1 } }}>Anterior</Link>}{page < pages && <Link className="rounded border border-white/10 px-3 py-2" href={{ query: { ...params, page: page + 1 } }}>Próxima</Link>}</nav>}
  </div>;
}
