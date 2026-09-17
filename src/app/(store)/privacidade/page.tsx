import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { getPublicSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Política de privacidade" };

export default async function PrivacidadePage() {
  const settings = await getPublicSettings();
  return (
    <LegalPage
      content={settings.privacy}
      title="Política de privacidade"
      intro="Levamos a sério a proteção dos seus dados, conforme a LGPD. O texto definitivo está em revisão e será publicado aqui."
      topics={[
        "Quais dados coletamos (nome, contato, endereço e histórico de compras).",
        "Como usamos os dados para processar pedidos e liberar acessos.",
        "Com quem compartilhamos (ex.: meio de pagamento e transporte).",
        "Seus direitos: acesso, correção, exportação e exclusão da conta.",
        "Como falar com a MoveHaus sobre seus dados.",
      ]}
    />
  );
}
