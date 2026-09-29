import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorialPageHero } from "@/components/ui/editorial-page-hero";
import { getEbooks } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "E-books",
  description:
    "Conteúdos de nutrição da MoveHaus, lidos no leitor interno protegido.",
};

export default async function EbooksPage() {
  const ebooks = await getEbooks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <EditorialPageHero
        kicker="Conteúdos MoveHaus"
        title="Conhecimento para sustentar a constância."
        description="Materiais de nutrição e organização de rotina para ler no seu ritmo, com progresso salvo no leitor interno."
        aside="Cada conteúdo informa claramente se o acesso é único, permanente, por período ou por assinatura."
      />

      {ebooks.length > 0 ? (
        <ProductGrid products={ebooks} priorityCount={4} />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Nenhum e-book publicado"
          description="Os conteúdos aparecem aqui assim que forem publicados."
        />
      )}
    </div>
  );
}
