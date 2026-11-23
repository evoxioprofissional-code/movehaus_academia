import { listCategories } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/product-form";
import { Page, PageHeader } from "@/components/admin/kit";

export const metadata = { title: "Novo produto | MoveHaus Admin" };

export default async function NovoProdutoPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const [categories, params] = await Promise.all([listCategories(), searchParams]);
  const initialType = params.tipo === "ebook" || params.tipo === "digital" ? params.tipo : "physical";
  return (
    <Page>
      <PageHeader
        back={{ href: initialType === "physical" ? "/admin/produtos" : "/admin/conteudos", label: initialType === "physical" ? "Produtos" : "PDFs e receitas" }}
        title={initialType === "physical" ? "Novo produto" : "Novo PDF ou receita"}
        subtitle="Preencha o essencial agora. Dá para completar o resto depois."
      />
      <ProductForm categories={categories} initialType={initialType} />
    </Page>
  );
}
