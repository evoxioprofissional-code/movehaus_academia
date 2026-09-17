import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
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
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          E-books
        </h1>
        <p className="mt-2 text-mh-muted">
          Conteúdo de nutrição e organização de rotina, lido direto no leitor
          interno — com progresso salvo e sem download. Cada título pode ser por
          pagamento único ou assinatura mensal.
        </p>
      </header>

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
