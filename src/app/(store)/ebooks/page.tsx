import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorialPageHero } from "@/components/ui/editorial-page-hero";
import { getEbooks } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "PDFs e receitas",
  description:
    "PDFs, e-books e receitas para ler na sua biblioteca MoveHaus.",
};

export default async function EbooksPage() {
  const ebooks = await getEbooks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <EditorialPageHero
        kicker="Biblioteca MoveHaus"
        mobileTitle="PDFs e receitas"
        title="Sua próxima leitura está aqui."
        description="PDFs, e-books, receitas e materiais digitais. Compre seu acesso e leia na plataforma, com sua posição salva."
        aside="Cada conteúdo informa claramente se o acesso é único, permanente, por período ou por assinatura."
      />

      {ebooks.length > 0 ? (
        <ProductGrid products={ebooks} priorityCount={4} />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Nenhum material publicado"
          description="Os conteúdos aparecem aqui assim que forem publicados."
        />
      )}
    </div>
  );
}
