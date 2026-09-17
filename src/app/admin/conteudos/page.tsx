import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { listEbookProducts } from "@/lib/admin/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Conteúdos" };

export default async function AdminConteudosPage() {
  const ebooks = await listEbookProducts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Conteúdos
          </h1>
          <p className="mt-1 text-mh-muted">E-books e seus capítulos.</p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="size-4" />
            Novo e-book
          </Link>
        </Button>
      </div>

      {ebooks.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={BookOpen}
            title="Nenhum e-book"
            description="Crie um produto do tipo E-book para começar."
            action={
              <Button asChild>
                <Link href="/admin/produtos/novo">Novo e-book</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {ebooks.map((e) => (
            <Link
              key={e.id}
              href={`/admin/conteudos/${e.id}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-mh-surface p-4 transition-colors hover:border-white/25"
            >
              <div>
                <div className="font-medium text-white">{e.name}</div>
                <div className="text-xs text-mh-muted">
                  {e.author ? `por ${e.author} · ` : ""}
                  {e.chapters_count ?? 0} capítulos
                </div>
              </div>
              {e.ebook?.status === "published" ? (
                <Badge tone="success">Publicado</Badge>
              ) : (
                <Badge tone="muted">Rascunho</Badge>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
