import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Dumbbell, MessageCircle, Shirt } from "lucide-react";
import { CommunityGallery } from "@/components/home/community-gallery";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductMedia } from "@/components/catalog/product-media";
import { Price } from "@/components/catalog/price";
import { QuickAdd } from "@/components/catalog/quick-add";
import { productHref } from "@/components/catalog/product-card";
import { CtaButton } from "@/components/ui/cta-button";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { ABOUT, COMMUNITY, DIGITAL, HERO, OFFER } from "@/content/home";
import { getEbooks, getOnSaleProducts, getProducts } from "@/lib/catalog";
import { getHomeMedia, getPublicBanners } from "@/lib/home-media";
import { getPublicSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";
import { formatBRL } from "@/lib/utils";
import { hasBilling, isPhysical, type Product } from "@/types/catalog";

const INVALID_HERO_MEDIA = "hero-56b0d9a7-3c2e-45b5-8f51-a6630cabe6cf.png";

const SHORTCUTS = [
  { label: "Vestuário", href: "/loja?categoria=vestuario", icon: Shirt },
  { label: "Programas de treino", href: "/loja?categoria=programas", icon: Dumbbell },
  { label: "Conteúdos", href: "/ebooks", icon: BookOpen },
];

function SectionHeading({ kicker, title, text, href, linkLabel }: { kicker: string; title: string; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mh-red">{kicker}</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mh-muted sm:text-[15px]">{text}</p>}
      </div>
      {href && linkLabel && <Link href={href} className="hidden shrink-0 items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white sm:inline-flex">{linkLabel}<ArrowRight className="size-4" /></Link>}
    </div>
  );
}

function BillingLabel({ product }: { product: Product }) {
  if (!hasBilling(product)) return null;
  return <span>{product.billingModel === "subscription" ? "Assinatura mensal" : product.accessDurationDays ? "Pagamento único · acesso por " + product.accessDurationDays + " dias" : "Pagamento único · acesso permanente"}</span>;
}

export default async function HomePage() {
  const [products, ebooks, saleProducts, media, banners, settings] = await Promise.all([
    getProducts(),
    getEbooks(),
    getOnSaleProducts(),
    getHomeMedia(),
    getPublicBanners(),
    getPublicSettings(),
  ]);

  const preferred = products.filter((product) => product.type !== "ebook").sort((a, b) => Number(b.featured) - Number(a.featured));
  const featuredProducts = preferred.slice(0, 4);
  const contentProducts = ebooks.slice(0, 3);
  const offer = saleProducts[0];
  const campaign = banners[0];
  const heroMedia = media.hero && !media.hero.includes(INVALID_HERO_MEDIA) ? media.hero : null;
  const communityItems = COMMUNITY.items.slice(0, 3).map((item, index) => ({ ...item, media: { ...item.media, src: media["community_" + index] ?? item.media.src } }));
  const hasWhatsapp = Boolean(settings.whatsapp);

  return (
    <div className="overflow-hidden bg-[#08090b]">
      <section className="relative min-h-[690px] border-b border-white/10 sm:min-h-[650px] lg:min-h-[620px]">
        <PhotoSlot src={heroMedia} alt={HERO.image.alt} tone="dark" priority sizes="100vw" className="absolute inset-0" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,9,0.98)_0%,rgba(6,7,9,0.9)_38%,rgba(6,7,9,0.34)_72%,rgba(6,7,9,0.2)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(6,7,9,0.3)_0%,rgba(6,7,9,0.78)_42%,rgba(6,7,9,0.98)_78%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08090b] to-transparent" />
        <div className="relative mx-auto flex min-h-[690px] max-w-[1280px] items-end px-4 pb-24 pt-28 sm:min-h-[650px] sm:items-center sm:px-6 sm:pb-16 sm:pt-24 lg:min-h-[620px] lg:px-8">
          <div className="max-w-[650px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/65 sm:text-[11px]">{HERO.eyebrow}</p>
            <h1 className="mt-4 max-w-[760px] whitespace-pre-line font-display text-[9vw] min-[430px]:text-[3rem] sm:text-[4.5rem] lg:text-[5rem] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-white">{HERO.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">{HERO.text}</p>
            <div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row">
              <CtaButton href={HERO.primary.href} size="lg" className="w-full min-[430px]:w-auto">{HERO.primary.label}</CtaButton>
              <CtaButton href={HERO.secondary.href} variant="outline" size="lg" className="w-full min-[430px]:w-auto">{HERO.secondary.label}</CtaButton>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Atalhos da loja" className="border-b border-white/10 bg-[#0a0b0d]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-white/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {SHORTCUTS.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="group flex min-h-16 items-center justify-between gap-4 px-1 py-4 text-sm font-medium text-white/85 transition-colors hover:text-white sm:px-7"><span className="flex items-center gap-3"><Icon className="size-5 text-white" strokeWidth={1.8} />{label}</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>)}
        </div>
      </nav>

      {featuredProducts.length > 0 && <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading kicker="Loja" title="Vista o seu próximo nível." text="Vestuário, acessórios e programas selecionados para acompanhar a sua jornada." href="/loja" linkLabel="Ver todos os produtos" />
        <ProductGrid products={featuredProducts} priorityCount={4} />
        <Link href="/loja" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white sm:hidden">Ver todos os produtos<ArrowRight className="size-4" /></Link>
      </section>}

      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <SectionHeading kicker="Comunidade" title="Isso é MoveHaus." text="Gente treinando, evoluindo e fazendo parte de algo maior que um treino." href="/sobre" linkLabel="Conheça o clube" />
        <CommunityGallery items={communityItems} />
      </section>

      {contentProducts.length > 0 && <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <SectionHeading kicker={DIGITAL.kicker} title={DIGITAL.title} text={DIGITAL.text} href="/ebooks" linkLabel="Ver todos os conteúdos" />
        <div className="grid gap-4 lg:grid-cols-3">
          {contentProducts.map((product, index) => <article key={product.id} className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-[#121316] sm:grid sm:grid-cols-[minmax(150px,0.85fr)_1.15fr] lg:block">
            <Link href={productHref(product)} aria-label={product.name} className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mh-red" />
            <ProductMedia product={product} priority={index === 0} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 40vw, 33vw" className="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.025] sm:h-full sm:aspect-auto lg:h-auto lg:aspect-[16/10]" />
            <div className="pointer-events-none flex min-h-[190px] flex-col p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-mh-red">{index === 0 ? "Conteúdo em destaque" : "Conteúdo"}</p>
              <h3 className="mt-2 text-lg font-semibold leading-tight text-white">{product.name}</h3>
              {product.type === "ebook" && product.author && <p className="mt-1 text-xs text-mh-muted">por {product.author}</p>}
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-mh-muted">{product.shortDescription || product.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/65">{product.type === "ebook" && product.chaptersCount ? <span>{product.chaptersCount} capítulos</span> : null}<BillingLabel product={product} /></div>
              <div className="mt-auto flex items-end justify-between gap-4 pt-5"><Price product={product} size="sm" /><div className="pointer-events-auto relative z-20"><QuickAdd product={product} /></div></div>
            </div>
          </article>)}
        </div>
        <Link href="/ebooks" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white sm:hidden">Ver todos os conteúdos<ArrowRight className="size-4" /></Link>
      </section>}

      {(campaign || offer) && <section className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="relative min-h-[430px] overflow-hidden rounded-xl border border-white/10 bg-[#17090b]">
          {campaign?.desktopUrl ? <><Image src={campaign.desktopUrl} alt="" fill sizes="100vw" className="hidden object-cover sm:block" />{campaign.mobileUrl ? <Image src={campaign.mobileUrl} alt="" fill sizes="100vw" className="object-cover sm:hidden" /> : <Image src={campaign.desktopUrl} alt="" fill sizes="100vw" className="object-cover sm:hidden" />}</> : <PhotoSlot src={media.offer ?? OFFER.image.src} alt={OFFER.image.alt} tone="red" sizes="100vw" className="absolute inset-0" />}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,4,7,0.97)_0%,rgba(26,4,7,0.82)_43%,rgba(10,10,12,0.12)_100%)] max-sm:bg-[linear-gradient(180deg,rgba(20,4,6,0.68)_0%,rgba(20,4,6,0.94)_75%)]" />
          <div className="relative z-10 flex min-h-[430px] max-w-[620px] flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mh-red">Campanha</p>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl">{campaign?.title || OFFER.title}</h2>
            <p className="mt-4 max-w-lg text-white/75">{campaign?.subtitle || OFFER.text}</p>
            {offer && isPhysical(offer) && <div className="mt-7 flex max-w-md items-center gap-4 rounded-lg border border-white/15 bg-black/45 p-3 backdrop-blur-sm">
              <ProductMedia product={offer} sizes="72px" className="size-16 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{offer.name}</p><div className="mt-1 flex items-baseline gap-2"><span className="text-xl font-semibold text-white">{formatBRL(offer.price)}</span>{offer.compareAtPrice && <span className="text-sm text-white/55 line-through">{formatBRL(offer.compareAtPrice)}</span>}</div></div>
            </div>}
            {(campaign?.link || offer) && <CtaButton href={campaign?.link || (offer ? productHref(offer) : "/ofertas")} className="mt-7 w-fit">{campaign?.button_label || "Aproveitar oferta"}</CtaButton>}
          </div>
        </div>
      </section>}

      <section className="bg-[#f2efe8] text-[#111214]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mh-red">{ABOUT.kicker}</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl">{ABOUT.title}</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-black/60">{ABOUT.text}</p>
            <CtaButton href="/sobre" variant="outline" className="mt-7 !border-[#111214] !bg-[#111214] !text-white">Conhecer a MoveHaus</CtaButton>
          </div>
          <PhotoSlot src={media.about ?? ABOUT.image.src} alt={ABOUT.image.alt} tone="paper" sizes="(max-width: 1023px) 100vw, 50vw" className="aspect-[4/3] rounded-xl" />
        </div>
      </section>

      {hasWhatsapp && <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-7 rounded-xl border border-white/10 bg-[#111216] p-7 sm:flex-row sm:items-center sm:p-10">
          <div><h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Ficou com alguma dúvida?</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-mh-muted sm:text-base">Fale com a equipe e encontre o que faz sentido para o seu momento.</p></div>
          <CtaButton href={whatsappLink("Olá! Quero falar com a equipe MoveHaus.", settings.whatsapp)} external variant="whatsapp" leadingIcon={<MessageCircle className="size-5" />} className="w-full shrink-0 sm:w-auto">Chamar no WhatsApp</CtaButton>
        </div>
      </section>}
    </div>
  );
}
