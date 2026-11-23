import { getSettings } from "@/lib/admin/data";
import { SettingsForm } from "@/components/admin/settings-form";
import { Page, PageHeader } from "@/components/admin/kit";

export const metadata = { title: "Configurações | MoveHaus Admin" };

export default async function AdminConfiguracoesPage() {
  const settings = await getSettings();
  return (
    <Page narrow>
      <PageHeader title="Configurações" subtitle="Dados da loja, atendimento, retirada e políticas de compra." />
      <SettingsForm settings={settings} />
    </Page>
  );
}
