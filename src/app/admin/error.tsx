"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { btn } from "@/components/admin/kit";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Falha no painel", { digest: error.digest });
  }, [error]);
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-ad-red-soft text-ad-red"><AlertTriangle className="size-6" /></span>
      <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-ad-ink">Não foi possível carregar</h1>
      <p className="mt-2 text-[14px] text-ad-muted">Nenhuma alteração foi aplicada. Tente de novo.</p>
      <button onClick={reset} className={btn("primary", "md", "mt-6")}>Tentar novamente</button>
    </div>
  );
}
