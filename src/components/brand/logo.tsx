import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Marca oficial com recorte responsivo da arte quadrada de origem. */
export function Logo({ className, priority, size = 44 }: { className?: string; priority?: boolean; size?: number }) {
  const width = Math.round(size * 1.58);
  const height = Math.round(size * 0.56);
  return (
    <Link href="/" aria-label="MoveHaus Training Club — início" className={cn("relative inline-flex shrink-0 overflow-hidden", className)} style={{ width, height }}>
      <Image src="/brand/movehaus-logo.jpg" alt="MoveHaus Training Club" fill priority={priority} sizes={width + "px"} className="scale-[1.05] object-cover object-center" />
    </Link>
  );
}
