import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { SearchBar } from "@/components/catalog/search-bar";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorialPageHero } from "@/components/ui/editorial-page-hero";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Loja",
  description: "Produtos oficiais, vestuário, acessórios e suplementos MoveHaus.",
};

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;
  const [allCategories, products, physicalProducts] = await Promise.all([
    getCategories(),
    getProducts({ type: "physical", categorySlug: categoria, query: q }),
    getProducts({ type: "physical" }),
  ]);

  const categories = allCategories.filter((c) =>
    physicalProducts.some((product) => product.categorySlug === c.slug),
  );
  const list = products;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <EditorialPageHero
        kicker="Loja oficial"
        mobileTitle="Loja"
        title="Sua seleção MoveHaus."
        description="Vestuário, acessórios e suplementos. Explore os produtos e acompanhe cada compra pela sua conta."
        aside="Produtos oficiais, compra segura e atendimento direto da equipe MoveHaus."
      />

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
