import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { SearchBar } from "@/components/catalog/search-bar";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Loja",
  description: "Vestuário, acessórios e programas de treino da MoveHaus.",
};

// Categorias mostradas na loja (e-books ficam em /ebooks).
const STORE_CATEGORIES = ["vestuario", "acessorios", "programas"];

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;
  const [allCategories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: categoria, query: q }),
  ]);

  const categories = allCategories.filter((c) =>
    STORE_CATEGORIES.includes(c.slug),
  );
  const list = products.filter((p) => p.type !== "ebook");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          Loja
        </h1>
        <p className="mt-1 text-mh-muted">
          Vestuário, acessórios e programas de treino.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4">
        <SearchBar action="/loja" defaultValue={q} />
        <CategoryFilter
          basePath="/loja"
          categories={categories}
          active={categoria}
          query={q}
        />
      </div>

      {list.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-mh-muted">
            {list.length} {list.length === 1 ? "produto" : "produtos"}
          </p>
          <ProductGrid products={list} priorityCount={4} />
        </>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="Nada encontrado"
          description={
            q
              ? `Não achamos resultados para “${q}”. Tente outro termo.`
              : "Não há produtos nesta categoria por enquanto."
          }
        />
      )}
    </div>
  );
}
