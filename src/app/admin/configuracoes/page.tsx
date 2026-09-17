import { getSettings } from "@/lib/admin/data";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Configurações" };

export default async function AdminConfiguracoesPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Configurações
      </h1>
      <p className="mb-6 mt-1 text-mh-muted">
        Dados da academia, contato, regras e políticas. Usados na loja.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
