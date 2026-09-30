import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "light" | "onDark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red focus-visible:ring-offset-2 focus-visible:ring-offset-mh-black disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-admin-red text-white hover:bg-admin-red-hover",
  outline:
    "border border-admin-border bg-transparent text-mh-text hover:border-[#444955] hover:bg-white/[0.035]",
  ghost: "bg-transparent text-mh-muted hover:text-white hover:bg-white/5",
  // Botão claro (para blocos sobre superfície escura ou dentro de fotos)
  light: "bg-white text-mh-black hover:bg-white/90",
  // Botão para uso sobre bloco claro (paper)
  onDark: "bg-mh-black text-white hover:bg-mh-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
