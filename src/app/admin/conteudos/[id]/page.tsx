import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, ChevronUp, FileText, PenLine, Plus, Settings2, Trash2 } from "lucide-react";
import { getEbook } from "@/lib/admin/data";
import { createChapter, deleteChapter, moveChapter, updateChapter } from "@/lib/admin/actions";
import { EbookMetaForm } from "@/components/admin/ebook-meta-form";
import { PdfUpload } from "@/components/admin/pdf-upload";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, FormField, Input, Page, PageHeader, Textarea, btn } from "@/components/admin/kit";
import { pdfAttachment } from "@/lib/customer/pdf";

export const metadata = { title: "Editar conteúdo | MoveHaus Admin" };

const iconBtn = "grid size-9 place-items-center rounded-full text-ad-muted transition-colors hover:bg-ad-soft hover:text-ad-ink disabled:opacity-30";

export default async function EditarConteudoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, ebook, chapters } = await getEbook(id);
  if (!product || !["ebook", "digital"].includes(product.type)) notFound();
  const published = ebook?.status === "published";

  return (
    <Page narrow>
      <PageHeader
        back={{ href: "/admin/conteudos", label: "PDFs e receitas" }}
        title={product.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            {published ? <Badge tone="green" dot>Publicado</Badge> : <Badge tone="amber" dot>Rascunho — compradores ainda não veem</Badge>}
          </span>
        }
        actions={
          <Link href={`/admin/produtos/${id}`} className={btn("secondary", "md")}>
            <Settings2 className="size-4" /> Preço e venda
          </Link>
        }
      />

      <div className="space-y-4">
        <Card title="Apresentação" subtitle="Capa, introdução e quem pode ler.">
          <EbookMetaForm productId={id} ebook={ebook} />
        </Card>

        <Card title={`Sumário (${chapters.length})`} subtitle="A ordem aqui é a ordem que o cliente vê." padded={false}>
          {chapters.length === 0 ? (
            <p className="px-5 pb-5 pt-2 text-[14px] text-ad-muted sm:px-6">Ainda vazio. Envie um PDF ou escreva um capítulo abaixo.</p>
          ) : (
            <ol className="mt-2 divide-y divide-ad-line border-t border-ad-line">
              {chapters.map((c, i) => {
                const pdf = pdfAttachment(c.content);
                return (
                  <li key={c.id} className="px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className={pdf ? "grid size-10 shrink-0 place-items-center rounded-xl bg-ad-red-soft text-ad-red" : "grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f0fb] text-[#2a5db0]"}>
                        {pdf ? <FileText className="size-[18px]" /> : <PenLine className="size-[18px]" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-semibold text-ad-ink">{c.title}</p>
                        <p className="text-[12.5px] text-ad-muted">{i + 1}º · {pdf ? "PDF" : "Texto"}</p>
                      </div>
                      <div className="flex items-center">
                        <form action={moveChapter}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="product_id" value={id} />
                          <input type="hidden" name="dir" value="up" />
                          <button type="submit" disabled={i === 0} aria-label="Subir" className={iconBtn}><ChevronUp className="size-[18px]" /></button>
                        </form>
                        <form action={moveChapter}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="product_id" value={id} />
                          <input type="hidden" name="dir" value="down" />
                          <button type="submit" disabled={i === chapters.length - 1} aria-label="Descer" className={iconBtn}><ChevronDown className="size-[18px]" /></button>
                        </form>
                        <form action={deleteChapter}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="product_id" value={id} />
                          <ConfirmButton type="submit" message={`Remover “${c.title}” do sumário?`} aria-label="Remover" className="grid size-9 place-items-center rounded-full text-ad-muted transition-colors hover:bg-ad-red-soft hover:text-ad-red">
                            <Trash2 className="size-4" />
                          </ConfirmButton>
                        </form>
                      </div>
                    </div>
                    {!pdf && (
                      <details className="group mt-2">
                        <summary className="ml-[52px] inline-flex h-8 cursor-pointer list-none items-center rounded-full px-3 text-[13px] font-semibold text-ad-ink-2 hover:bg-ad-soft [&::-webkit-details-marker]:hidden">
                          <span className="group-open:hidden">Editar texto</span>
                          <span className="hidden group-open:inline">Fechar</span>
                        </summary>
                        <form action={updateChapter} className="mt-2 grid gap-3 rounded-2xl bg-ad-soft/60 p-3 sm:ml-[52px]">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="product_id" value={id} />
                          <Input name="title" defaultValue={c.title} aria-label="Título" className="bg-white" />
                          <Textarea name="content" rows={8} defaultValue={c.content} placeholder="Conteúdo do capítulo…" className="bg-white" />
                          <button type="submit" className={btn("primary", "sm", "justify-self-start")}>Salvar capítulo</button>
                        </form>
                      </details>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Enviar PDF" subtitle="Vira um item do sumário, lido dentro do app.">
            <PdfUpload productId={id} />
          </Card>

          <Card title="Escrever capítulo ou receita" subtitle="Para textos curtos digitados aqui mesmo.">
            <form action={createChapter} className="grid gap-4">
              <input type="hidden" name="product_id" value={id} />
              <FormField label="Título"><Input name="title" required placeholder="Ex.: Panqueca de banana" /></FormField>
              <FormField label="Texto (pode completar depois)"><Textarea name="content" rows={4} /></FormField>
              <button type="submit" className={btn("primary", "md", "sm:justify-self-start")}><Plus className="size-4" /> Adicionar ao sumário</button>
            </form>
          </Card>
        </div>
      </div>
    </Page>
  );
}
