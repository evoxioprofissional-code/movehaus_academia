import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenText, ChevronRight, ExternalLink } from "lucide-react";
import { getProductById, getProductImages, listCategories } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/product-form";
import { Badge, Page, PageHeader, btn } from "@/components/admin/kit";

export const metadata = { title: "Editar produto | MoveHaus Admin" };

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, images] = await Promise.all([getProductById(id), listCategories(), getProductImages(id)]);
  if (!product) notFound();
  const isPhysical = product.type === "physical";

  return (
    <Page>
      <PageHeader
        back={{ href: isPhysical ? "/admin/produtos" : "/admin/conteudos", label: isPhysical ? "Produtos" : "PDFs e receitas" }}
        title={product.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            {product.active ? <Badge tone="green" dot>Na loja</Badge> : <Badge tone="neutral" dot>Fora da loja</Badge>}
            <span>Atualizado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(product.updated_at))}</span>
          </span>
        }
        actions={
          product.active && product.slug ? (
            <Link href={isPhysical ? `/loja/${product.slug}` : `/ebooks/${product.slug}`} target="_blank" className={btn("secondary", "md")}>
              <ExternalLink className="size-4" /> Ver na loja
            </Link>
          ) : null
        }
      />
      {!isPhysical && (
        <Link href={`/admin/conteudos/${product.id}`} className="admin-card mb-4 flex items-center gap-3 p-4 transition-transform active:scale-[0.99] sm:px-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e8f0fb] text-[#2a5db0]"><BookOpenText className="size-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ad-ink">Conteúdo para leitura</span>
            <span className="block text-[13px] text-ad-muted">Envie os PDFs, capítulos e receitas que o comprador vai ler.</span>
          </span>
          <ChevronRight className="size-5 text-ad-faint" />
        </Link>
      )}
      <ProductForm product={product} categories={categories} images={images} />
    </Page>
  );
}
