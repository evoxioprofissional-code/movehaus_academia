import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronRight, Package, Search } from "lucide-react";
import { ProductMedia } from "@/components/catalog/product-media";
import { productHref } from "@/components/catalog/product-card";
import { formatBRL } from "@/lib/utils";
import { displayPrice, type Product } from "@/types/catalog";

export function MobileHome({ featuredProduct }: { featuredProduct?: Product }) {
  return (
    <div className="mh-mobile-home md:hidden">
      <div className="mh-app-welcome">
        <h1>Descubra<span>.</span></h1>
        <p>Produtos e leituras para o seu dia.</p>
      </div>
      <form action="/loja" className="mh-app-home-search">
        <Search size={19} strokeWidth={1.7} aria-hidden="true" />
        <input name="q" type="search" aria-label="Buscar na loja" placeholder="O que você procura?" enterKeyHint="search" />
      </form>
      <nav className="mh-app-discover-filters" aria-label="Explorar a MoveHaus">
        <Link href="/" aria-current="page">Destaques</Link>
        <Link href="/loja">Produtos</Link>
        <Link href="/ebooks">PDFs e receitas</Link>
        <Link href="/ofertas">Ofertas</Link>
      </nav>
      <section className="mh-app-home-feature" aria-labelledby="mobile-home-feature">
        {featuredProduct
          ? <ProductMedia product={featuredProduct} className="mh-app-feature-media" priority sizes="230px" />
          : <span className="mh-app-feature-book" aria-hidden="true"><BookOpen size={80} strokeWidth={1} /></span>}
        <div className="mh-app-feature-copy">
          <p>{featuredProduct ? "EM DESTAQUE" : "SUA PRÓXIMA LEITURA"}</p>
          <h2 id="mobile-home-feature">{featuredProduct?.name ?? "Receitas e novas ideias."}</h2>
          <span>{featuredProduct ? formatBRL(displayPrice(featuredProduct)) : "Explore nossa biblioteca digital."}</span>
          <Link href={featuredProduct ? productHref(featuredProduct) : "/ebooks"}>{featuredProduct ? "Ver produto" : "Ver conteúdos"} <ArrowUpRight size={17} /></Link>
        </div>
      </section>
      <nav className="mh-app-shortcuts" aria-label="Atalhos da MoveHaus">
        <Link href="/minha-area/biblioteca" prefetch={false}><span><BookOpen size={19} strokeWidth={1.6} /></span><span>Biblioteca<small>Suas leituras</small></span><ChevronRight size={15} /></Link>
        <Link href="/minha-area/compras" prefetch={false}><span><Package size={19} strokeWidth={1.6} /></span><span>Pedidos<small>Suas compras</small></span><ChevronRight size={15} /></Link>
      </nav>
    </div>
  );
}
