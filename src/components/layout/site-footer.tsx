import Link from "next/link";
import { MapPin, Mail, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SITE, whatsappLink } from "@/lib/site";

/** Glyph do Instagram (lucide não distribui ícones de marca). */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}

const PAYMENTS = ["Pix", "Visa", "Master", "Elo", "Amex", "Boleto"];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-mh-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        {/* Marca */}
        <div className="md:col-span-4">
          <Logo size={48} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mh-muted">
            Loja oficial da MoveHaus Training Club. Produtos, programas e
            conteúdos para quem leva a evolução a sério.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid size-10 place-items-center rounded-full border border-mh-border text-mh-muted transition-colors hover:border-white/30 hover:text-white"
            >
              <MessageCircle className="size-5" />
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid size-10 place-items-center rounded-full border border-mh-border text-mh-muted transition-colors hover:border-white/30 hover:text-white"
            >
              <InstagramIcon className="size-5" />
            </a>
          </div>
        </div>

        {/* Navegação */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-white">Loja</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-mh-muted">
            <li><Link className="hover:text-white" href="/loja">Produtos</Link></li>
            <li><Link className="hover:text-white" href="/ebooks">Conteúdos</Link></li>
            <li><Link className="hover:text-white" href="/ofertas">Ofertas</Link></li>
            <li><Link className="hover:text-white" href="/sobre">Sobre a MoveHaus</Link></li>
          </ul>
        </div>

        {/* Conta */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-white">Conta</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-mh-muted">
            <li><Link className="hover:text-white" href="/minha-area">Minha área</Link></li>
            <li><Link className="hover:text-white" href="/login">Entrar</Link></li>
            <li><Link className="hover:text-white" href="/carrinho">Carrinho</Link></li>
          </ul>
        </div>

        {/* Contato */}
        <div className="md:col-span-4">
          <h4 className="text-sm font-semibold text-white">Contato</h4>
          <ul className="mt-4 space-y-3 text-sm text-mh-muted">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-mh-muted" />
              <span>{SITE.address}</span>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white"
              >
                <MessageCircle className="size-4 shrink-0" />
                {SITE.whatsappLabel}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 hover:text-white"
              >
                <Mail className="size-4 shrink-0" />
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-mh-muted">
              Pagamento
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="rounded border border-mh-border bg-mh-surface px-2 py-1 text-[11px] font-medium text-mh-text"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Base legal */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-mh-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link className="hover:text-white" href="/termos">Termos de uso</Link>
            <Link className="hover:text-white" href="/privacidade">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
