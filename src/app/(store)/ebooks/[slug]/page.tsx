import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/catalog/product-detail";
import { getProductBySlug } from "@/lib/catalog";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Conteúdo não encontrado" };
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function EbookPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.type !== "ebook") notFound();
  return <ProductDetail product={product} />;
}
