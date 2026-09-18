import { getSettings } from "@/lib/admin/data";
import { SettingsForm } from "@/components/admin/settings-form";
import { AdminPageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Configurações" };

export default async function AdminConfiguracoesPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8">
      <AdminPageHeader title="Configurações" description="Dados da academia, contato, regras da loja, segurança e políticas." />
      <div className="mt-5">
      <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
