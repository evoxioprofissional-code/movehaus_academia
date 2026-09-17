import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "light" | "outline" | "whatsapp";
type Size = "md" | "lg";

const shell: Record<Variant, string> = {
  primary: "bg-mh-red text-white",
  light: "bg-white text-mh-black",
  outline: "border border-white/30 text-white",
  whatsapp: "bg-emerald-600 text-white",
};

// Camada de preenchimento que "varre" no hover/focus.
const fill: Record<Variant, string> = {
  primary: "bg-mh-red-hover",
  light: "bg-white/85",
  outline: "bg-white/10",
  whatsapp: "bg-emerald-500",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface CommonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  leadingIcon?: React.ReactNode;
  /** Mostra a seta que desliza (default true, exceto quando há leadingIcon). */
  showArrow?: boolean;
}

function Inner({
  children,
  leadingIcon,
  showArrow,
}: Pick<CommonProps, "children" | "leadingIcon" | "showArrow">) {
  return (
    <span className="relative z-10 inline-flex items-center gap-2">
      {leadingIcon}
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
      )}
    </span>
  );
}

const base =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-mh font-medium shadow-soft transition-[color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red focus-visible:ring-offset-2 focus-visible:ring-offset-mh-black active:scale-[0.99]";

const fillLayer =
  "absolute inset-0 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100";

export function CtaButton({
  children,
  href,
  external,
  variant = "primary",
  size = "lg",
  className,
  leadingIcon,
  showArrow,
  onClick,
}: CommonProps & {
  href?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const arrow = showArrow ?? !leadingIcon;
  const content = (
    <>
      <span aria-hidden className={cn(fillLayer, fill[variant])} />
      <Inner leadingIcon={leadingIcon} showArrow={arrow}>
        {children}
      </Inner>
    </>
  );
  const cls = cn(base, shell[variant], sizes[size], className);

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  );
}
