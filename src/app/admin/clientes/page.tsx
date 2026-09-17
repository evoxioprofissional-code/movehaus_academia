import { MessageCircle, ShieldCheck } from "lucide-react";
import { listCustomers } from "@/lib/admin/data";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const metadata = { title: "Clientes" };

function waLink(whatsapp: string | null, name: string | null) {
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const num = digits.length <= 11 ? `55${digits}` : digits;
  const msg = `Olá${name ? `, ${name.split(" ")[0]}` : ""}! Aqui é da MoveHaus.`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export default async function AdminClientesPage() {
  const customers = await listCustomers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Clientes
      </h1>
      <p className="mt-1 text-mh-muted">{customers.length} cadastrados</p>

      {customers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Users}
            title="Nenhum cliente ainda"
            description="As contas criadas na loja aparecem aqui."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-mh-surface text-left text-xs uppercase tracking-wide text-mh-muted">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3 text-right">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((c) => {
                const wa = waLink(c.whatsapp, c.full_name);
                return (
                  <tr key={c.id} className="hover:bg-mh-surface/40">
                    <td className="px-4 py-3 font-medium text-white">
                      {c.full_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-mh-muted">
                      <div>{c.email}</div>
                      {c.whatsapp && <div className="text-xs">{c.whatsapp}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {c.role === "admin" ? (
                        <Badge tone="red">
                          <ShieldCheck className="size-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge tone="muted">Cliente</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600/15 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/25"
                        >
                          <MessageCircle className="size-4" />
                          Conversar
                        </a>
                      ) : (
                        <span className="text-xs text-mh-muted">sem número</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
