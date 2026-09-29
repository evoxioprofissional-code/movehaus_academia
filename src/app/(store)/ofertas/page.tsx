import type { Metadata } from "next";
import { Tag } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { EditorialPageHero } from "@/components/ui/editorial-page-hero";
import { getOnSaleProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Produtos com preço promocional na MoveHaus.",
};

export default async function OfertasPage() {
  const onSale = await getOnSaleProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <EditorialPageHero
        kicker="Seleção da semana"
        title="Boas escolhas. Condições melhores."
        description="Uma seleção curta de produtos e conteúdos com condições especiais por tempo limitado."
        aside="As ofertas e a disponibilidade são atualizadas pela equipe MoveHaus."
      />

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
