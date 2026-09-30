"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Falha de interface", { digest: error.digest }); }, [error]);
  return <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-4 py-16 text-center"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-mh-red">Algo saiu do ritmo</p><h1 className="mt-3 text-3xl font-semibold text-white">Não foi possível carregar esta parte do site</h1><p className="mt-3 text-mh-muted">Tente novamente. Se o problema continuar, fale com a equipe MoveHaus.</p><Button className="mt-6" onClick={reset}>Tentar novamente</Button></div></div>;
}
