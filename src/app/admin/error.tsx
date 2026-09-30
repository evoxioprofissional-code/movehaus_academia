"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Falha no painel", { digest: error.digest }); }, [error]);
  return <div className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="text-2xl font-semibold text-white">Não foi possível carregar o painel</h1><p className="mt-3 text-sm text-mh-muted">Nenhuma alteração foi aplicada. Tente carregar novamente.</p><Button className="mt-6" onClick={reset}>Tentar novamente</Button></div>;
}
