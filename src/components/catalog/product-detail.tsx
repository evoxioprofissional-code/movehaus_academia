import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronRight,
  Lock,
  MonitorSmartphone,
} from "lucide-react";
import { ProductMedia } from "@/components/catalog/product-media";
import { Price } from "@/components/catalog/price";
import { BillingDetails } from "@/components/catalog/billing-info";
import { AddToCart } from "@/components/cart/add-to-cart";
import { Badge } from "@/components/ui/badge";
import { isEbook, isPhysical, type Product } from "@/types/catalog";

export function ProductDetail({ product }: { product: Product }) {
  const backHref = isEbook(product) ? "/ebooks" : "/loja";
  const backLabel = isEbook(product) ? "E-books" : "Loja";
  const soldOut = isPhysical(product) && product.stock <= 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-mh-muted">
        <Link href={backHref} className="hover:text-white">
          {backLabel}
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-mh-text">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Mídia */}
        <div>
          <ProductMedia
            product={product}
            priority
            className="mx-auto max-w-md lg:max-w-none"
          />
        </div>

        {/* Informações */}
        <div className="flex flex-col gap-6">
          <div>
            {isPhysical(product) &&
              product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <Badge tone="red" className="mb-3">
                  Oferta
                </Badge>
              )}
            <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-mh-muted">{product.shortDescription}</p>
          </div>

          <Price product={product} size="lg" />

          <BillingDetails product={product} />

          <AddToCart product={product} />

          {/* Metadados */}
          <dl className="grid grid-cols-2 gap-3 border-t border-mh-border pt-6 text-sm">
            {isPhysical(product) && (
              <>
                <div>
                  <dt className="text-mh-muted">Disponibilidade</dt>
                  <dd className="font-medium text-white">
                    {soldOut ? "Esgotado" : `${product.stock} em estoque`}
                  </dd>
                </div>
                <div>
                  <dt className="text-mh-muted">Código</dt>
                  <dd className="font-medium text-white">{product.sku}</dd>
                </div>
              </>
            )}
            {isEbook(product) && product.chaptersCount != null && (
              <div>
                <dt className="text-mh-muted">Capítulos</dt>
                <dd className="font-medium text-white">
                  {product.chaptersCount}
                </dd>
              </div>
            )}
            {isEbook(product) && product.author && (
              <div>
                <dt className="text-mh-muted">Autoria</dt>
                <dd className="font-medium text-white">{product.author}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Descrição completa */}
      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold uppercase tracking-tight text-white">
          Sobre o {isEbook(product) ? "conteúdo" : "produto"}
        </h2>
        <p className="mt-3 leading-relaxed text-mh-muted">
          {product.description}
        </p>

        {isEbook(product) && (
          <ul className="mt-6 space-y-2 text-sm text-mh-text">
            {[
              { icon: BookOpen, text: "Leitura no leitor interno, com progresso salvo." },
              { icon: MonitorSmartphone, text: "Acesso pelo computador e pelo celular." },
              { icon: Lock, text: "Conteúdo protegido, sem download de arquivo." },
              { icon: Check, text: "Material educativo — não substitui acompanhamento individual." },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-2">
                <f.icon className="size-4 shrink-0 text-mh-red" />
                {f.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isPhysical(product) && product.weightGrams != null && (
        <p className="mt-8 text-xs text-mh-muted">
          Peso aproximado: {formatWeight(product.weightGrams)}. O frete é
          calculado no checkout.
        </p>
      )}
    </div>
  );
}

function formatWeight(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toFixed(1)} kg` : `${grams} g`;
}
