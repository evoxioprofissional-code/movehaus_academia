import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MessageCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorialPageHero } from "@/components/ui/editorial-page-hero";
import { getPublicSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Atendimento da loja",
  description: "Ajuda com produtos, pedidos, retirada e leitura dos PDFs comprados na MoveHaus.",
};

export default async function AtendimentoPage() {
  const settings = await getPublicSettings();
  const options = [
    { icon: Package, title: "Pedidos e comprovantes", text: "Consulte o pagamento e o código da compra. Para produtos físicos, combine a retirada ou entrega com a loja.", href: "/minha-area/compras", label: "Ver meus pedidos" },
    { icon: BookOpen, title: "PDFs e receitas", text: "Após a confirmação do pagamento, os materiais adquiridos ficam disponíveis para leitura dentro da sua biblioteca.", href: "/minha-area/biblioteca", label: "Abrir minha biblioteca" },
  ];

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <EditorialPageHero kicker="Atendimento" title="Como podemos ajudar?" description="Tudo sobre suas compras na loja MoveHaus." />
    <div className="grid gap-4 md:grid-cols-2">
      {options.map(({ icon: Icon, title, text, href, label }) => <section key={href} className="rounded-2xl border border-mh-border bg-mh-surface p-6">
        <Icon className="size-6 text-mh-red" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mh-muted">{text}</p>
        <Button asChild variant="outline" className="mt-5"><Link href={href} prefetch={false}>{label}</Link></Button>
      </section>)}
    </div>
    <section className="mt-5 rounded-2xl border border-mh-border bg-mh-surface p-6">
      <h2 className="text-xl font-semibold">Fale com a loja</h2>
      <p className="mt-2 text-sm text-mh-muted">Tenha o número do pedido ou o código do comprovante em mãos para facilitar o atendimento.</p>
      <Button asChild className="mt-5"><a href={whatsappLink("Olá! Preciso de ajuda com uma compra na loja MoveHaus.", settings.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" />Atendimento pelo WhatsApp</a></Button>
      {settings.email && <p className="mt-4 text-sm text-mh-muted">E-mail: <a href={`mailto:${settings.email}`} className="underline underline-offset-4">{settings.email}</a></p>}
      {settings.address && <p className="mt-2 text-sm text-mh-muted">Endereço: {settings.address}</p>}
      {settings.deliveryRules && <div className="mt-5 border-t border-mh-border pt-5"><h3 className="font-semibold">Entrega e retirada</h3><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-mh-muted">{settings.deliveryRules}</p></div>}
    </section>
  </div>;
}
