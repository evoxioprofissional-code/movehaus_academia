import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { getCustomerOverview } from "@/lib/customer/data";

type Overview = Awaited<ReturnType<typeof getCustomerOverview>>;
export function LibraryCards({ overview, limit }: { overview: Overview; limit?: number }) {
  const productById = new Map(overview.products.map((product) => [product.id, product]));
  const progressById = new Map(overview.progress.map((progress) => [progress.product_id, progress]));
  return <>{overview.access.length === 0 ? (
            <div className="mt-4 flex min-h-28 items-center gap-5 rounded-2xl border border-white/[0.08] bg-[#111216] p-5">
              <BookOpen className="size-9 shrink-0 text-white/20" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-sm text-white/60">Nenhum conteúdo liberado ainda.</p>
                <Link href="/ebooks" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-mh-red hover:text-mh-red-soft">Explorar conteúdos <ArrowRight className="size-4" /></Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {overview.access.slice(0, limit).map((access) => {
                const product = productById.get(access.product_id);
                if (!product) return null;
                const progress = progressById.get(access.product_id);
                const complete = Math.round(progress?.progress_percent ?? 0);
                return (
                  <article key={access.id} className="rounded-2xl border border-white/[0.08] bg-[#111216] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[11px] font-semibold uppercase tracking-widest text-mh-red">{product.type === "ebook" ? "E-book" : "Conteúdo"}</p><h3 className="mt-1 font-semibold text-white">{product.name}</h3></div>
                      <Badge tone={access.available ? "success" : "muted"}>{access.available ? access.permanent ? "Permanente" : "Liberado" : "Indisponível"}</Badge>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mh-red" style={{ width: `${complete}%` }} /></div>
                    <p className="mt-2 text-xs text-white/50">{complete}% concluído{access.expires_at && !access.permanent ? ` · Acesso até ${new Intl.DateTimeFormat("pt-BR").format(new Date(access.expires_at))}` : ""}</p>
                    {access.available && product.type !== "physical" && <Link href={`/minha-area/ler/${product.slug}`} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-mh-red hover:text-mh-red-soft">{product.type === "digital" ? complete > 0 ? "Continuar conteúdo" : "Acessar conteúdo" : complete > 0 ? "Continuar leitura" : "Começar leitura"}<ArrowRight className="size-4" /></Link>}
                  </article>
                );
              })}
            </div>
          )}</>;
}
