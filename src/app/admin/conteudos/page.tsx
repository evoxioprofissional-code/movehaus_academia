import Link from "next/link";
import Image from "next/image";
import { BookOpenText, Pencil, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { listEbookProducts } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Conteúdos | MoveHaus Admin" };
export default async function ContentPage() {
  const ebooks = await listEbookProducts();
  return <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8"><AdminPageHeader title="Conteúdos" description="E-books, programas e capítulos publicados para clientes." action={<Button asChild><Link href="/admin/produtos/novo"><Plus className="size-4" />Novo conteúdo</Link></Button>} />
    {ebooks.length === 0 ? <div className="mt-5"><EmptyState icon={BookOpenText} title="Nenhum conteúdo" description="Crie um produto do tipo e-book para começar." /></div> : <div className="mt-5 overflow-x-auto rounded-lg bg-mh-surface"><table className="w-full min-w-[900px] text-sm"><thead className="border-b border-white/8 text-left text-xs text-mh-muted"><tr><th className="p-3">Conteúdo</th><th>Capítulos</th><th>Cobrança</th><th>Preço</th><th>Acessos</th><th>Status</th><th>Atualizado</th><th /></tr></thead><tbody className="divide-y divide-white/6">{ebooks.map((ebook) => <tr key={ebook.id} className="hover:bg-white/[0.025]"><td className="p-3"><div className="flex items-center gap-3"><div className="relative size-12 overflow-hidden rounded bg-[#0d0d0f]">{ebook.ebook?.cover_url ? <Image src={ebook.ebook.cover_url} alt="" fill sizes="48px" className="object-cover" /> : <BookOpenText className="absolute inset-0 m-auto size-5 text-mh-muted" />}</div><div><p className="font-medium">{ebook.name}</p><p className="text-xs text-mh-muted">{ebook.author || "Autoria não informada"}</p></div></div></td><td>{ebook.chapters_count ?? 0}</td><td>{ebook.billing_model === "subscription" ? "Mensal" : "Pagamento único"}</td><td>{ebook.billing_model === "subscription" ? `${formatBRL(ebook.monthly_price ?? 0)}/mês` : formatBRL(ebook.price ?? 0)}</td><td className="text-mh-muted">—</td><td><Badge tone={ebook.ebook?.status === "published" ? "success" : "muted"}>{ebook.ebook?.status === "published" ? "Publicado" : "Rascunho"}</Badge></td><td className="text-xs text-mh-muted">{new Intl.DateTimeFormat("pt-BR").format(new Date(ebook.updated_at))}</td><td><Link href={`/admin/conteudos/${ebook.id}`} className="grid size-9 place-items-center rounded hover:bg-white/5" aria-label="Editar"><Pencil className="size-4" /></Link></td></tr>)}</tbody></table></div>}
  </div>;
}
