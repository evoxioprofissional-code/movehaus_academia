"use client";

import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/lib/admin/actions";

export function CategoryDelete({ id, count, name }: { id: string; count: number; name: string }) {
  return (
    <button
      name="id"
      value={id}
      formAction={deleteCategory}
      onClick={(event) => {
        const text = count ? `A categoria “${name}” está ligada a ${count} produto(s). Eles ficarão sem categoria. Continuar?` : `Excluir a categoria “${name}”?`;
        if (!confirm(text)) event.preventDefault();
      }}
      aria-label="Excluir categoria"
      className="grid size-9 place-items-center rounded-full text-ad-muted transition-colors hover:bg-ad-red-soft hover:text-ad-red"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
