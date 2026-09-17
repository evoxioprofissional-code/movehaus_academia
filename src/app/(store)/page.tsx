import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextEffect } from "@/components/ui/text-effect";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductMedia } from "@/components/catalog/product-media";
import { productHref } from "@/components/catalog/product-card";
import { Price } from "@/components/catalog/price";
import { accessDescription } from "@/components/catalog/billing-info";
import { ScrollExpandHero } from "@/components/home/scroll-expand-hero";
import { CommunityGallery } from "@/components/home/community-gallery";
import { ReaderPreview } from "@/components/home/reader-preview";
import {
  getEbooks,
  getFeaturedProducts,
  getOnSaleProducts,
} from "@/lib/catalog";
import { formatBRL } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";
import { hasBilling, isPhysical } from "@/types/catalog";
import { ABOUT, COMMUNITY, DIGITAL, HERO, OFFER } from "@/content/home";

export default async function HomePage() {
  const [featured, onSale, ebooks] = await Promise.all([
    getFeaturedProducts(),
    getOnSaleProducts(),
    getEbooks(),
  ]);

  const featuredProducts = featured.filter((p) => p.type !== "ebook").slice(0, 4);
  const mainEbook = ebooks[0];
  const otherEbooks = ebooks.slice(1, 4);
  const offer = onSale[0];

  return (
    <>
      {/* ================= HERO (expansão de mídia ao rolar) ================= */}
      <ScrollExpandHero
        media={
          <PhotoSlot
            src={HERO.image.src}
            alt={HERO.image.alt}
            caption={HERO.image.caption}
            priority
            overlay
            sizes="100vw"
            className="absolute inset-0"
          />
        }
      >
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            {HERO.eyebrow}
          </p>
          <TextEffect
            as="h1"
            trigger="mount"
            text={HERO.title}
            className="mt-4 max-w-2xl font-display text-[clamp(2.3rem,6.6vw,4.5rem)] font-bold uppercase leading-[0.94] text-white"
          />
          <p className="mt-5 max-w-lg text-base text-white/80 sm:text-lg">
            {HERO.text}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaButton href={HERO.primary.href} variant="primary" size="lg">
              {HERO.primary.label}
            </CtaButton>
            <CtaButton href={HERO.secondary.href} variant="outline" size="lg">
              {HERO.secondary.label}
            </CtaButton>
          </div>
        </div>
      </ScrollExpandHero>

      {/* ================= ISSO É MOVEHAUS (comunidade) ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
            {COMMUNITY.kicker}
          </p>
          <TextEffect
            as="h2"
            trigger="inView"
            text={COMMUNITY.title}
            className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-[34px]"
          />
          <p className="mt-3 text-mh-muted">{COMMUNITY.text}</p>
        </div>
        <CommunityGallery items={COMMUNITY.items} />
      </section>

      {/* ================= PRODUTOS EM DESTAQUE ================= */}
      {featuredProducts.length > 0 && (
        <section className="border-t border-white/5 bg-mh-ink/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <SectionHeading
              kicker="Loja"
              title="Produtos em destaque"
              description="Vestuário e itens de treino selecionados."
              href="/loja"
              linkLabel="Ver a loja"
            />
            <ProductGrid products={featuredProducts} reveal />
          </div>
        </section>
      )}

      {/* ================= CONTEÚDOS DIGITAIS (editorial) ================= */}
      {mainEbook && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <SectionHeading
            kicker={DIGITAL.kicker}
            title={DIGITAL.title}
            description={DIGITAL.text}
            href="/ebooks"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Destaque principal */}
            <Reveal className="lg:col-span-7">
              <article className="group relative h-full overflow-hidden rounded-lg">
                <Link
                  href={productHref(mainEbook)}
                  aria-label={mainEbook.name}
                  className="absolute inset-0 z-10"
                />
                <div className="grid h-full grid-cols-1 sm:grid-cols-2">
                  <ProductMedia
                    product={mainEbook}
                    sizes="(max-width: 640px) 100vw, 40vw"
                    className="aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[24rem]"
                  />
                  <div className="flex flex-col justify-center gap-3 bg-mh-surface p-6 sm:p-8">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-mh-red">
                      E-book em destaque
                    </span>
                    <h3 className="text-2xl font-semibold leading-tight text-white">
                      {mainEbook.name}
                    </h3>
                    {"author" in mainEbook && mainEbook.author && (
                      <p className="text-sm text-mh-muted">por {mainEbook.author}</p>
                    )}
                    <p className="line-clamp-2 text-sm text-mh-muted">
                      {mainEbook.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mh-muted">
                      {"chaptersCount" in mainEbook && mainEbook.chaptersCount && (
                        <span>{mainEbook.chaptersCount} capítulos</span>
                      )}
                      <span className="text-white">
                        {accessDescription(mainEbook)}
                      </span>
                    </div>

                    <ReaderPreview
                      chapters={
                        "chaptersCount" in mainEbook
                          ? mainEbook.chaptersCount
                          : undefined
                      }
                    />

                    <div className="mt-1 flex items-center justify-between">
                      <Price product={mainEbook} />
                      <span className="relative z-20 inline-flex items-center gap-1 text-sm font-medium text-white">
                        Conhecer
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Outros conteúdos */}
            <Reveal delay={120} className="lg:col-span-5">
              <div className="flex h-full flex-col gap-3">
                {otherEbooks.length > 0 ? (
                  otherEbooks.map((eb) => (
                    <Link
                      key={eb.id}
                      href={productHref(eb)}
                      className="group flex flex-1 items-center gap-4 rounded-lg bg-mh-surface p-3 transition-colors hover:bg-mh-surface-2"
                    >
                      <ProductMedia
                        product={eb}
                        sizes="80px"
                        className="size-20 shrink-0 rounded-md"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-[15px] font-medium text-white">
                          {eb.name}
                        </h4>
                        <p className="mt-0.5 truncate text-xs text-mh-muted">
                          {hasBilling(eb) && eb.billingModel === "subscription"
                            ? "Assinatura mensal"
                            : "Pagamento único"}
                        </p>
                        <div className="mt-1.5">
                          <Price product={eb} size="sm" />
                        </div>
                      </div>
                      <ArrowUpRight className="size-5 shrink-0 text-mh-muted transition-colors group-hover:text-white" />
                    </Link>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-start justify-center gap-3 rounded-lg bg-mh-surface p-6">
                    <BookOpen className="size-6 text-mh-red" />
                    <p className="text-sm text-mh-muted">
                      Novos conteúdos estão a caminho.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/ebooks">Ver todos os conteúdos</Link>
                    </Button>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= OFERTAS (campanha) ================= */}
      {offer && isPhysical(offer) && offer.compareAtPrice && (
        <section className="px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-lg">
            <PhotoSlot
              src={OFFER.image.src}
              alt={OFFER.image.alt}
              caption={OFFER.image.caption}
              tone="red"
              overlay
              sizes="100vw"
              className="min-h-[22rem] sm:min-h-[24rem]"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-xl px-6 py-10 sm:px-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    {OFFER.kicker}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-none text-white sm:text-5xl">
                    {OFFER.title}
                  </h2>
                  <p className="mt-3 text-white/80">{OFFER.text}</p>

                  <div className="mt-6 flex items-center gap-4 rounded-lg bg-black/40 p-4 backdrop-blur-sm">
                    <ProductMedia
                      product={offer}
                      sizes="80px"
                      className="size-20 shrink-0 rounded-md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {offer.name}
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-semibold tabular-nums text-white">
                          {formatBRL(offer.price)}
                        </span>
                        <span className="text-sm text-white/60 line-through">
                          {formatBRL(offer.compareAtPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <CtaButton
                    href={productHref(offer)}
                    variant="light"
                    size="lg"
                    className="mt-6"
                  >
                    Aproveitar oferta
                  </CtaButton>
                </div>
              </div>
            </PhotoSlot>
          </div>
        </section>
      )}

      {/* ================= SOBRE (bloco claro) ================= */}
      <section className="bg-mh-paper text-mh-paper-ink">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">
              {ABOUT.kicker}
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {ABOUT.title}
            </h2>
            <p className="mt-4 max-w-md text-mh-paper-muted">{ABOUT.text}</p>
            <Button asChild size="lg" variant="onDark" className="mt-7">
              <Link href="/sobre">Conhecer a MoveHaus</Link>
            </Button>
          </div>
          <PhotoSlot
            src={ABOUT.image.src}
            alt={ABOUT.image.alt}
            caption={ABOUT.image.caption}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-72 w-full rounded-lg sm:h-96"
          />
        </div>
      </section>

      {/* ================= CTA WHATSAPP ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-white/10 bg-mh-surface p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Ficou com alguma dúvida?
            </h2>
            <p className="mt-2 max-w-md text-mh-muted">
              Fale com a equipe da MoveHaus no WhatsApp. A gente ajuda a escolher
              o que faz sentido para o seu momento.
            </p>
          </div>
          <CtaButton
            href={whatsappLink("Olá! Quero ajuda para escolher um produto da MoveHaus.")}
            external
            variant="whatsapp"
            size="lg"
            leadingIcon={<MessageCircle className="size-5" />}
          >
            Chamar no WhatsApp
          </CtaButton>
        </div>
      </section>
    </>
  );
}
