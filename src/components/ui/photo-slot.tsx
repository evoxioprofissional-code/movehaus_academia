import Image from "next/image";
import { cn } from "@/lib/utils";

type Tone = "dark" | "red" | "paper";

const toneBg: Record<Tone, string> = {
  dark: "bg-[#111216]",
  red: "bg-[#21090c]",
  paper: "bg-[#e7e2d8]",
};

export function PhotoSlot({ src, alt, tone = "dark", priority, sizes, overlay, fit = "cover", className, children }: { src?: string | null; alt: string; caption?: string; tone?: Tone; priority?: boolean; sizes?: string; overlay?: boolean; fit?: "cover" | "contain"; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden", fit === "contain" ? "bg-[#101012]" : !src && toneBg[tone], className)}>
      {src ? <Image src={src} alt={alt} fill priority={priority} sizes={sizes ?? "100vw"} className={fit === "contain" ? "object-contain p-5 sm:p-8 lg:p-10" : "object-cover"} /> : <div aria-hidden className="absolute inset-0 overflow-hidden"><div className="absolute -right-[12%] top-[-20%] h-[78%] w-[48%] rotate-12 bg-mh-red/[0.08]" /><div className="absolute bottom-[15%] left-[8%] h-px w-[58%] bg-white/10" /><div className="absolute bottom-[10%] left-[8%] h-px w-[36%] bg-mh-red/35" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.08),transparent_30%)]" /></div>}
      {overlay && <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />}
      {children}
    </div>
  );
}
