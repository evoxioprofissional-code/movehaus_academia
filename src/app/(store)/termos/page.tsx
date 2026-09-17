import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de uso"
      intro="Estes termos regulam o uso da loja e dos conteúdos da MoveHaus Training Club. O texto definitivo está em revisão e será publicado aqui."
      topics={[
        "Regras de compra de produtos físicos e digitais.",
        "Condições de acesso a conteúdos por pagamento único e por assinatura.",
        "Cancelamento de assinatura e política de reembolso.",
        "Uso individual do conteúdo e proibição de redistribuição.",
        "Responsabilidades do cliente e da MoveHaus.",
      ]}
    />
  );
}
