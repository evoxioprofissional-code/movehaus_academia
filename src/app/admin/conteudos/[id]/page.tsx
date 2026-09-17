import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { getEbook } from "@/lib/admin/data";
import {
  createChapter,
  deleteChapter,
  moveChapter,
  updateChapter,
} from "@/lib/admin/actions";
import { EbookMetaForm } from "@/components/admin/ebook-meta-form";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Editar conteúdo" };

export default async function EditarConteudoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { product, ebook, chapters } = await getEbook(id);
  if (!product || product.type !== "ebook") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/conteudos"
        className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Conteúdos
      </Link>
      <h1 className="mb-1 mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {product.name}
      </h1>
      <p className="mb-6 text-sm text-mh-muted">
        Edite a apresentação e os capítulos.{" "}
        <Link href={`/admin/produtos/${id}`} className="underline hover:text-white">
          Dados comerciais do produto
        </Link>
      </p>

      <EbookMetaForm productId={id} ebook={ebook} />

      {/* Capítulos */}
      <h2 className="mb-3 mt-8 text-lg font-semibold text-white">
        Capítulos ({chapters.length})
      </h2>

      <div className="space-y-3">
        {chapters.map((c, i) => (
          <div key={c.id} className="rounded-lg border border-white/10 bg-mh-surface p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-mh-muted">
                Capítulo {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <form action={moveChapter}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="product_id" value={id} />
                  <input type="hidden" name="dir" value="up" />
                  <button type="submit" disabled={i === 0} aria-label="Subir" className="grid size-8 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-white disabled:opacity-30">
                    <ChevronUp className="size-4" />
                  </button>
                </form>
                <form action={moveChapter}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="product_id" value={id} />
                  <input type="hidden" name="dir" value="down" />
                  <button type="submit" disabled={i === chapters.length - 1} aria-label="Descer" className="grid size-8 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-white disabled:opacity-30">
                    <ChevronDown className="size-4" />
                  </button>
                </form>
                <form action={deleteChapter}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="product_id" value={id} />
                  <button type="submit" aria-label="Excluir" className="grid size-8 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-mh-red-soft">
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>
            <form action={updateChapter} className="space-y-2">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="product_id" value={id} />
              <input
                name="title"
                defaultValue={c.title}
                className="h-10 w-full rounded-mh border border-mh-border bg-mh-black px-3 text-sm font-medium text-white focus:border-mh-red focus:outline-none"
              />
              <textarea
                name="content"
                rows={5}
                defaultValue={c.content}
                placeholder="Conteúdo do capítulo..."
                className="w-full rounded-mh border border-mh-border bg-mh-black px-3 py-2 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
              />
              <Button type="submit" variant="outline" size="sm">Salvar capítulo</Button>
            </form>
          </div>
        ))}
      </div>

      {/* Novo capítulo */}
      <form action={createChapter} className="mt-4 space-y-2 rounded-lg border border-dashed border-white/15 p-4">
        <input type="hidden" name="product_id" value={id} />
        <p className="text-sm font-medium text-white">Adicionar capítulo</p>
        <input
          name="title"
          required
          placeholder="Título do capítulo"
          className="h-10 w-full rounded-mh border border-mh-border bg-mh-black px-3 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
        />
        <textarea
          name="content"
          rows={4}
          placeholder="Conteúdo (opcional agora)"
          className="w-full rounded-mh border border-mh-border bg-mh-black px-3 py-2 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none"
        />
        <Button type="submit">Adicionar capítulo</Button>
      </form>
    </div>
  );
}
