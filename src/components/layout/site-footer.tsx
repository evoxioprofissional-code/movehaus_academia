import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { whatsappLink } from "@/lib/site";
import { getPublicSettings } from "@/lib/settings";

function InstagramIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none" /></svg>;
}

export async function SiteFooter() {
  const settings = await getPublicSettings();
  const hasWhatsapp = Boolean(settings.whatsapp);
  const hasInstagram = Boolean(settings.instagram);
  const hasEmail = Boolean(settings.email);

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#08090b]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-8 lg:py-14">
        <div className="md:col-span-4">
          <Logo size={74} className="[&_img]:rounded-none" />
          <p className="mt-4 max-w-[290px] text-sm leading-relaxed text-mh-muted">MoveHaus Training Club. Produtos, programas e conteúdos para quem evolui todo dia.</p>
          {hasInstagram && <div className="mt-5 flex gap-2"><a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-mh-red hover:text-mh-red"><InstagramIcon className="size-5" /></a></div>}
        </div>
        <div className="md:col-span-2"><h2 className="text-sm font-semibold text-white">Loja</h2><ul className="mt-4 space-y-2.5 text-sm text-mh-muted"><li><Link className="hover:text-white" href="/loja">Produtos</Link></li><li><Link className="hover:text-white" href="/ebooks">Conteúdos</Link></li><li><Link className="hover:text-white" href="/ofertas">Ofertas</Link></li></ul></div>
        <div className="md:col-span-2"><h2 className="text-sm font-semibold text-white">Conta</h2><ul className="mt-4 space-y-2.5 text-sm text-mh-muted"><li><Link className="hover:text-white" href="/minha-area">Minha área</Link></li><li><Link className="hover:text-white" href="/login">Entrar</Link></li><li><Link className="hover:text-white" href="/carrinho">Carrinho</Link></li></ul></div>
        <div className="md:col-span-4"><h2 className="text-sm font-semibold text-white">Contato</h2><ul className="mt-4 space-y-3 text-sm text-mh-muted">{(settings.address || settings.city) && <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-white" /><span>{settings.address || settings.city}</span></li>}{hasWhatsapp && <li><a href={whatsappLink(undefined, settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white"><MessageCircle className="size-4 text-white" />{settings.whatsappLabel || "Fale com a equipe"}</a></li>}{hasEmail && <li><a href={"mailto:" + settings.email} className="flex items-center gap-2.5 hover:text-white"><Mail className="size-4 text-white" />{settings.email}</a></li>}</ul></div>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-5 text-xs text-mh-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} {settings.academyName}. Todos os direitos reservados.</p><div className="flex gap-5"><Link className="hover:text-white" href="/termos">Termos</Link><Link className="hover:text-white" href="/privacidade">Privacidade</Link>{hasWhatsapp && <a className="hover:text-white" href={whatsappLink(undefined, settings.whatsapp)} target="_blank" rel="noopener noreferrer">Contato</a>}</div></div></div>
    </footer>
  );
}
