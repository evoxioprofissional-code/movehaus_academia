import { Dumbbell } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listCoachingMembers } from "@/lib/coaching/admin-data";
import { grantCoachingAccess, revokeCoachingAccess } from "@/lib/coaching/actions";

export const metadata = { title: "Acompanhamento | MoveHaus Admin" };

export default async function AdminCoachingPage() {
  const members = await listCoachingMembers();
  const withAccess = members.filter((m) => m.hasAccess).length;

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8">
      <AdminPageHeader
        title="Acompanhamento"
        description={`Libere o acesso à área do aluno. ${withAccess} com acesso ativo. (Na Fase 5, a assinatura fará isso automaticamente.)`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/admin/acompanhamento/receitas">Receitas</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/acompanhamento/recompensas">Recompensas</a>
            </Button>
          </div>
        }
      />

      {members.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={Dumbbell}
            title="Nenhum cliente"
            description="Quando houver contas cadastradas, você poderá liberar o acesso aqui."
          />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg bg-mh-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-white/8 text-left text-xs text-mh-muted">
              <tr>
                <th className="p-3">Aluno</th>
                <th>Contato</th>
                <th>Acesso</th>
                <th>Origem</th>
                <th className="text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.025]">
                  <td className="p-3">
                    <p className="font-medium text-white">{m.full_name || "Sem nome"}</p>
                    {m.role === "admin" && (
                      <span className="text-xs text-mh-red-soft">Administrador</span>
                    )}
                  </td>
                  <td>
                    <p>{m.email}</p>
                    <p className="text-xs text-mh-muted">{m.whatsapp || "—"}</p>
                  </td>
                  <td>
                    {m.hasAccess ? (
                      <Badge tone="success">Ativo</Badge>
                    ) : (
                      <Badge tone="muted">Sem acesso</Badge>
                    )}
                  </td>
                  <td className="text-mh-muted">
                    {m.hasAccess ? (m.source === "subscription" ? "Assinatura" : "Manual") : "—"}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href={`/admin/acompanhamento/${m.id}/treino`}>Montar treino</a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/admin/acompanhamento/${m.id}/metas`}>Metas</a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={`/admin/acompanhamento/${m.id}/nutricao`}>Nutrição</a>
                      </Button>
                      {m.hasAccess ? (
                        <form action={revokeCoachingAccess} className="inline">
                          <input type="hidden" name="user_id" value={m.id} />
                          <Button type="submit" variant="outline" size="sm">Revogar</Button>
                        </form>
                      ) : (
                        <form action={grantCoachingAccess} className="inline">
                          <input type="hidden" name="user_id" value={m.id} />
                          <Button type="submit" size="sm">Liberar acesso</Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
