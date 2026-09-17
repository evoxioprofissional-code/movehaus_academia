import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { listProducts, listCategories } from "@/lib/admin/data";
import { deleteProduct, toggleProductActive } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import { formatBRL } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  physical: "Físico",
  digital: "Programa",
  ebook: "E-book",
};

function priceLabel(p: {
  type: string;
  price: number | null;
  monthly_price: number | null;
  billing_model: string | null;
}) {
  if (p.billing_model === "subscription")
    return `${formatBRL(p.monthly_price ?? 0)}/mês`;
  return formatBRL(p.price ?? 0);
}

export default async function AdminProdutosPage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Produtos
          </h1>
          <p className="mt-1 text-mh-muted">{products.length} cadastrados</p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="size-4" />
            Novo produto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Package}
            title="Nenhum produto ainda"
            description="Cadastre o primeiro produto da loja."
            action={
              <Button asChild>
                <Link href="/admin/produtos/novo">Novo produto</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-mh-surface text-left text-xs uppercase tracking-wide text-mh-muted">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-mh-surface/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-xs text-mh-muted">
                      {p.category_id ? catName.get(p.category_id) : "sem categoria"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-mh-muted">
                    {TYPE_LABEL[p.type] ?? p.type}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white">
                    {priceLabel(p)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-mh-muted">
                    {p.type === "physical" ? p.stock : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {p.active ? (
                      <Badge tone="success">Ativo</Badge>
                    ) : (
                      <Badge tone="muted">Inativo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <form action={toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="active" value={String(!p.active)} />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1 text-xs text-mh-muted hover:bg-white/5 hover:text-white"
                        >
                          {p.active ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        aria-label="Editar"
                        className="grid size-8 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-white"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          aria-label="Excluir"
                          className="grid size-8 place-items-center rounded-md text-mh-muted hover:bg-white/5 hover:text-mh-red-soft"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </form>
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
