import Link from "next/link";
import Image from "next/image";
import { BookOpenText, ChevronRight, Plus } from "lucide-react";
import { Badge, Card, Empty, Page, PageHeader, btn } from "@/components/admin/kit";
import { listEbookProducts } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "PDFs e receitas | MoveHaus Admin" };

export default async function ContentPage() {
  const ebooks = await listEbookProducts();
  const drafts = ebooks.filter((ebook) => ebook.ebook?.status !== "published").length;

  return (
    <Page>
      <PageHeader
        title="PDFs e receitas"
        subtitle={ebooks.length ? `${ebooks.length} material(is) · ${drafts} em rascunho` : "Materiais digitais que o cliente lê dentro do app."}
        actions={
          <Link href="/admin/produtos/novo?tipo=ebook" className={btn("brand", "md")}>
            <Plus className="size-[18px]" strokeWidth={2.4} /> Novo PDF
          </Link>
        }
      />

      {ebooks.length === 0 ? (
        <Card>
          <Empty
            icon={BookOpenText}
            title="Nenhum material ainda"
            text="Crie um PDF ou e-book e depois envie os arquivos e capítulos."
            action={<Link href="/admin/produtos/novo?tipo=ebook" className={btn("brand", "md")}><Plus className="size-4" /> Novo PDF</Link>}
          />
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ebooks.map((ebook) => {
            const published = ebook.ebook?.status === "published";
            return (
              <li key={ebook.id}>
                <Link href={`/admin/conteudos/${ebook.id}`} className="admin-card group flex h-full items-center gap-4 p-3.5 transition-transform active:scale-[0.99]">
                  <span className="relative aspect-[3/4] w-[72px] shrink-0 overflow-hidden rounded-xl bg-ad-soft shadow-[0_6px_16px_-8px_rgb(0_0_0/0.35)]">
                    {ebook.ebook?.cover_url ? (
                      <Image src={ebook.ebook.cover_url} alt="" fill sizes="72px" className="object-cover" />
                    ) : (
                      <BookOpenText className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-ad-faint" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[15px] font-semibold leading-snug text-ad-ink">{ebook.name}</span>
                    <span className="mt-1 block text-[13px] tabular-nums text-ad-ink-2">
                      {ebook.billing_model === "subscription" ? `${formatBRL(ebook.monthly_price ?? 0)}/mês` : formatBRL(ebook.price ?? 0)}
                      <span className="text-ad-muted"> · {ebook.chapters_count ?? 0} item(ns)</span>
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {published ? <Badge tone="green" dot>Publicado</Badge> : <Badge tone="amber" dot>Rascunho</Badge>}
                      {!ebook.active && <Badge tone="neutral">Fora da loja</Badge>}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ad-faint transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
