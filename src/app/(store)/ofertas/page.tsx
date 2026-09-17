import type { Metadata } from "next";
import { Tag } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getOnSaleProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Produtos com preço promocional na MoveHaus.",
};

export default async function OfertasPage() {
  const onSale = await getOnSaleProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          Ofertas
        </h1>
        <p className="mt-2 text-mh-muted">
          Preços especiais por tempo limitado. Aproveite enquanto durar o
          estoque.
        </p>
      </header>

      {onSale.length > 0 ? (
        <ProductGrid products={onSale} priorityCount={4} />
      ) : (
        <EmptyState
          icon={Tag}
          title="Sem ofertas no momento"
          description="Quando houver promoções, elas aparecem aqui."
          action={
            <Button asChild variant="outline">
              <Link href="/loja">Ver a loja</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
