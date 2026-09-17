import * as React from "react";
import { cn } from "@/lib/utils";

/** Input de formulário com rótulo. */
export function Field({
  label,
  id,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-mh border border-mh-border bg-mh-surface px-3 text-sm text-white placeholder:text-mh-muted focus:border-mh-red focus:outline-none focus:ring-1 focus:ring-mh-red",
          className,
        )}
        {...props}
      />
      {hint && <p className="text-xs text-mh-muted">{hint}</p>}
    </div>
  );
}
