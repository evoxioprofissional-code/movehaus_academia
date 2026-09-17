import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Novo produto" };

export default async function NovoProdutoPage() {
  const categories = await listCategories();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/produtos"
        className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Produtos
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Novo produto
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
