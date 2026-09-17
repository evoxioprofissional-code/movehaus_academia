import Image from "next/image";
import { cn } from "@/lib/utils";

type Tone = "dark" | "red" | "paper";

const toneBg: Record<Tone, string> = {
  dark: "bg-[linear-gradient(135deg,#1d1d22_0%,#101013_45%,#0a0a0b_100%)]",
  red: "bg-[linear-gradient(135deg,#3a0d10_0%,#1a0709_50%,#0a0a0b_100%)]",
  paper: "bg-[linear-gradient(135deg,#eeeae1_0%,#e2ddd2_100%)]",
};

const toneMark: Record<Tone, string> = {
  dark: "text-white/[0.05]",
  red: "text-white/[0.06]",
  paper: "text-black/[0.05]",
};

/**
 * Slot de imagem. Se `src` existir, renderiza a foto (next/image, object-cover).
 * Caso contrário, mostra um placeholder fotográfico de marca (duotone + grão) —
 * sem ícones — pensado para ser trocado por uma foto real depois.
 *
 * As fotos ficam registradas em src/content/home.ts; basta apontar o `src`
 * para um arquivo em /public/images para a foto aparecer.
 */
export function PhotoSlot({
  src,
  alt,
  caption,
  tone = "dark",
  priority,
  sizes,
  overlay,
  className,
  children,
}: {
  src?: string | null;
  alt: string;
  caption?: string;
  tone?: Tone;
  priority?: boolean;
  sizes?: string;
  /** Escurece a base para dar legibilidade a textos sobrepostos. */
  overlay?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden mh-noise", !src && toneBg[tone], className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "100vw"}
          className="object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(229,18,28,0.12),transparent_60%)]"
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 grid place-items-center font-display text-[clamp(2rem,9vw,5rem)] font-bold uppercase tracking-tight",
              toneMark[tone],
            )}
          >
            MoveHaus
          </span>
          {caption && (
            <span className="pointer-events-none absolute bottom-3 left-3 text-[11px] font-medium uppercase tracking-widest text-white/25">
              {caption}
            </span>
          )}
        </>
      )}

      {overlay && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
        />
      )}

      {children}
    </div>
  );
}
