import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductMedia } from "@/components/catalog/product-media";
import { productHref } from "@/components/catalog/product-card";
import { Price } from "@/components/catalog/price";
import { accessDescription } from "@/components/catalog/billing-info";
import { CommunityFeature } from "@/components/home/community-feature";
import { ReaderPreview } from "@/components/home/reader-preview";
import { getHomeMedia, getPublicBanners } from "@/lib/home-media";
import { getHomeText } from "@/lib/home-content";
import {
  getEbooks,
  getFeaturedProducts,
  getOnSaleProducts,
} from "@/lib/catalog";
import { formatBRL } from "@/lib/utils";
import { hasBilling, isPhysical } from "@/types/catalog";
import { ABOUT, COMMUNITY, DIGITAL, HERO, OFFER } from "@/content/home";

export default async function HomePage() {
  const [featured, onSale, ebooks, media, banners, text] = await Promise.all([
    getFeaturedProducts(),
    getOnSaleProducts(),
    getEbooks(),
    getHomeMedia(),
    getPublicBanners(),
    getHomeText(),
  ]);
  // Texto da home: valor editado no admin, com fallback para o padrão.
  const t = (key: string, fallback: string) => text[key] ?? fallback;

  const featuredProducts = featured.filter((p) => p.type !== "ebook").slice(0, 4);
  const mainEbook = ebooks[0];
  const otherEbooks = ebooks.slice(1, 4);
  const offer = onSale[0];
  const campaign = banners[0];

  // O upload antigo do topo é uma arte da logo, não uma fotografia. Novos
  // uploads do painel continuam substituindo normalmente a imagem conceitual.
  const legacyLogoHero = media.hero?.includes("hero-56b0d9a7-3c2e-45b5-8f51-a6630cabe6cf.png");
  const heroImage = media.hero && !legacyLogoHero ? media.hero : HERO.image.src!;
  const heroTitle = t("hero.title", HERO.title).split("\n");

  const communityMain = media.community_0 ?? COMMUNITY.items[0].media.src!;
  const communityDetail = media.community_1 ?? COMMUNITY.items[1].media.src!;

  return (
    <>
      <section className="relative isolate flex min-h-[570px] items-end overflow-hidden bg-[#090a0c] sm:min-h-[550px] sm:items-center lg:min-h-[440px]" aria-labelledby="home-hero-title">
        <Image
          src={heroImage}
          alt={HERO.image.alt}
          fill
          priority
          unoptimized={heroImage.startsWith("http")}
          sizes="100vw"
          className="object-cover object-[64%_center] sm:object-[62%_center] lg:object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.82)_0%,rgba(0,0,0,.58)_40%,rgba(0,0,0,.08)_75%)] max-sm:bg-[linear-gradient(0deg,rgba(0,0,0,.88)_0%,rgba(0,0,0,.44)_55%,rgba(0,0,0,.12)_100%)]" />
        <div className="relative z-10 w-full px-5 pb-10 pt-28 sm:px-8 sm:py-16 lg:px-[4vw] lg:py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/80 sm:text-xs">
            {t("hero.eyebrow", HERO.eyebrow)}
          </p>
          <h1 id="home-hero-title" className="mt-4 max-w-[720px] font-sans text-[clamp(3.25rem,13vw,5rem)] font-extrabold leading-[0.94] tracking-[-0.055em] text-white lg:text-[clamp(5rem,5.7vw,6.7rem)]">
            {heroTitle.map((line, index) => (
              <span key={index} className={`block ${index > 0 ? "text-[#ed0925]" : ""}`}>{line}</span>
            ))}
          </h1>
          <p className="mt-5 max-w-[650px] text-base leading-snug text-white/90 sm:text-[20px]">
            {t("hero.text", HERO.text)}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
            <CtaButton href={HERO.primary.href} variant="primary" size="lg" className="min-w-[196px] justify-center rounded-md">
              {t("hero.primary", HERO.primary.label)}
            </CtaButton>
            <Link href={HERO.secondary.href} className="inline-flex min-h-11 items-center gap-5 border-b border-white/80 text-sm font-medium text-white transition-colors hover:border-mh-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red sm:text-base">
              {t("hero.secondary", HERO.secondary.label)} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {campaign && (campaign.desktopUrl || campaign.mobileUrl) && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
          <Link href={campaign.link || "/ofertas"} className="group relative block min-h-52 overflow-hidden rounded-xl bg-mh-surface sm:min-h-72">
            <picture>{campaign.mobileUrl && <source media="(max-width: 639px)" srcSet={campaign.mobileUrl} />}<img src={campaign.desktopUrl || campaign.mobileUrl || ""} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" /></picture>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative flex min-h-52 max-w-xl flex-col justify-end p-6 sm:min-h-72 sm:p-9"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Campanha MoveHaus</p><h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{campaign.title}</h2>{campaign.subtitle && <p className="mt-2 text-white/75">{campaign.subtitle}</p>}<span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">{campaign.button_label || "Conhecer oferta"}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></div>
          </Link>
        </section>
      )}

      <CommunityFeature
        kicker={t("community.kicker", COMMUNITY.kicker)}
        title={t("community.title", COMMUNITY.title)}
        text={t("community.text", COMMUNITY.text)}
        caption={t("community.item1", COMMUNITY.items[1].caption)}
        mainSrc={communityMain}
        detailSrc={communityDetail}
      />

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
            kicker={t("digital.kicker", DIGITAL.kicker)}
            title={t("digital.title", DIGITAL.title)}
            description={t("digital.text", DIGITAL.text)}
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
              src={media.offer ?? OFFER.image.src}
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
                    {t("offer.kicker", OFFER.kicker)}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-none text-white sm:text-5xl">
                    {t("offer.title", OFFER.title)}
                  </h2>
                  <p className="mt-3 text-white/80">{t("offer.text", OFFER.text)}</p>

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
              {t("about.kicker", ABOUT.kicker)}
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t("about.title", ABOUT.title)}
            </h2>
            <p className="mt-4 max-w-md text-mh-paper-muted">{t("about.text", ABOUT.text)}</p>
            <Button asChild size="lg" variant="onDark" className="mt-7">
              <Link href="/sobre">Conhecer a MoveHaus</Link>
            </Button>
          </div>
          <PhotoSlot
            src={media.about ?? ABOUT.image.src}
            alt={ABOUT.image.alt}
            caption={ABOUT.image.caption}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-72 w-full rounded-lg sm:h-96"
          />
        </div>
      </section>
    </>
  );
}
