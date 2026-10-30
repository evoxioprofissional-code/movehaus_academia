"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyReceipt({ code }: { code: string }) {
  const [message, setMessage] = useState("");
  return <div><Button variant="outline" onClick={async () => {
    try { await navigator.clipboard.writeText(code); setMessage("Código copiado!"); }
    catch { setMessage("Selecione e copie o código acima."); }
  }}>Copiar código</Button>{message && <p role="status" className="mt-2 text-sm text-mh-muted">{message}</p>}</div>;
}
