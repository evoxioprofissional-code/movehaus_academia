import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { getPublicSettings } from "@/lib/settings";

/** Glyph do Instagram (lucide não distribui ícones de marca). */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

const PAYMENTS = ["Pix", "Visa", "Mastercard", "Elo"];

export async function SiteFooter() {
  const settings = await getPublicSettings();
  const wa = whatsappLink("Olá! Vim pelo site da MoveHaus e gostaria de uma ajuda.", settings.whatsapp);
  return (
    <footer className="mt-auto bg-mh-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Chamada */}
        <div className="flex flex-col gap-6 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mh-red">Precisa de ajuda?</p>
            <h2 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Seu próximo passo começa aqui.
            </h2>
            <p className="mt-4 max-w-md text-mh-muted">
              Fale com a equipe MoveHaus e encontre o que faz sentido para você.
            </p>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-14 shrink-0 items-center justify-center gap-2.5 self-start rounded-xl bg-white px-7 text-[15px] font-semibold text-mh-black transition-colors hover:bg-white/90 lg:self-auto"
          >
            <MessageCircle className="size-5" />
            Falar com a equipe
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Colunas */}
        <div className="grid gap-10 border-t border-white/10 py-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" prefetch={false} aria-label="MoveHaus Training Club — início" className="inline-block">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Move<span className="text-mh-red">Haus</span>
                <span className="align-super text-xs text-mh-muted">®</span>
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.35em] text-mh-muted">
                Training Club
              </span>
            </Link>
            <p className="mt-5 text-sm text-mh-muted">Treino, conteúdo e evolução.</p>
          </div>

          <nav className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white">Explore</h4>
            <ul className="mt-4 space-y-3 text-sm text-mh-muted">
              <li><Link prefetch={false} className="transition-colors hover:text-white" href="/loja">Produtos</Link></li>
              <li><Link prefetch={false} className="transition-colors hover:text-white" href="/ebooks">Conteúdos</Link></li>
              <li><Link prefetch={false} className="transition-colors hover:text-white" href="/sobre">Sobre a MoveHaus</Link></li>
            </ul>
          </nav>

          <nav className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white">Sua conta</h4>
            <ul className="mt-4 space-y-3 text-sm text-mh-muted">
              <li><Link prefetch={false} className="transition-colors hover:text-white" href="/minha-area">Minha área</Link></li>
              <li><Link prefetch={false} className="transition-colors hover:text-white" href="/minha-area">Meus pedidos</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-white">Vamos conversar</h4>
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="mt-4 block text-sm text-mh-muted transition-colors hover:text-white">
                {settings.email}
              </a>
            )}
            <div className="mt-5 flex items-center gap-4 text-mh-muted">
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition-colors hover:text-white">
                <InstagramIcon className="size-6" />
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="transition-colors hover:text-white">
                <MessageCircle className="size-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Base */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-mh-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.academyName}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {PAYMENTS.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                {i > 0 && <span className="text-white/20">·</span>}
                {p}
              </span>
            ))}
          </div>
          <div className="flex gap-6">
            <Link prefetch={false} className="transition-colors hover:text-white" href="/termos">Termos de uso</Link>
            <Link prefetch={false} className="transition-colors hover:text-white" href="/privacidade">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
