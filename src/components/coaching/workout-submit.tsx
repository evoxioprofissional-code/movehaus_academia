"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botão de envio para iniciar/continuar treino com estado "Iniciando…".
 * Dá retorno imediato enquanto o servidor cria a sessão (evita a sensação de
 * travamento e cliques duplicados).
 */
export function WorkoutSubmit({
  className,
  label,
  pendingLabel = "Iniciando…",
  withIcon = true,
  disabled,
}: {
  className?: string;
  label: string;
  pendingLabel?: string;
  withIcon?: boolean;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={cn(className, pending && "opacity-80")}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> {pendingLabel}
        </>
      ) : (
        <>
          {withIcon && <Play className="size-4 fill-current" />} {label}
        </>
      )}
    </button>
  );
}
