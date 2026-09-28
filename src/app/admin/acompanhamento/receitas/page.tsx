import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createRecipe, deleteRecipe, toggleRecipe } from "@/lib/coaching/nutrition-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Receitas | MoveHaus Admin" };
const inputCls = "w-full rounded border border-white/10 bg-[#0d0d0f] px-3 py-2 text-sm text-white focus:border-mh-red focus:outline-none";

export default async function AdminReceitasPage() {
  const supabase = await createClient();
  const { data: recipes } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/acompanhamento" className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white">
        <ArrowLeft className="size-4" /> Acompanhamento
      </Link>
      <AdminPageHeader title="Receitas" description="Publique receitas para os alunos assinantes." />

      <details className="mt-5 rounded-lg bg-mh-surface p-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium"><Plus className="size-4" /> Nova receita</summary>
        <form action={createRecipe} className="mt-4 space-y-3">
          <input name="title" required placeholder="Título" className={inputCls.replace("py-2", "h-10")} />
          <input name="description" placeholder="Descrição curta" className={inputCls.replace("py-2", "h-10")} />
          <textarea name="ingredients" rows={4} placeholder="Ingredientes (um por linha)" className={inputCls} />
          <textarea name="steps" rows={4} placeholder="Modo de preparo" className={inputCls} />
          <Button type="submit">Publicar receita</Button>
        </form>
      </details>

      <div className="mt-5 space-y-2">
        {(recipes ?? []).map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg bg-mh-surface p-4">
            <div>
              <p className="font-medium text-white">{r.title}</p>
              {r.description && <p className="text-xs text-mh-muted">{r.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={r.active ? "success" : "muted"}>{r.active ? "Ativa" : "Inativa"}</Badge>
              <form action={toggleRecipe}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="active" value={String(!r.active)} />
                <Button type="submit" variant="outline" size="sm">{r.active ? "Desativar" : "Ativar"}</Button>
              </form>
              <form action={deleteRecipe}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" aria-label="Excluir" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-white/5 hover:text-mh-red-soft"><Trash2 className="size-4" /></button>
              </form>
            </div>
          </div>
        ))}
        {(recipes ?? []).length === 0 && <p className="text-sm text-mh-muted">Nenhuma receita ainda.</p>}
      </div>
    </div>
  );
}
