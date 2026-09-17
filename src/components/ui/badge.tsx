import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "red" | "muted" | "success";

const tones: Record<Tone, string> = {
  default: "border-mh-border text-mh-text",
  red: "border-mh-red/40 bg-mh-red/10 text-mh-red-soft",
  muted: "border-mh-border text-mh-muted",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

export function Badge({
  tone = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
