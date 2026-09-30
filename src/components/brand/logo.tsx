import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Marca da MoveHaus. Usa a arte oficial em public/brand. */
export function Logo({
  className,
  priority,
  size = 44,
}: {
  className?: string;
  priority?: boolean;
  size?: number;
}) {
  return (
    <Link
      href="/"
      aria-label="MoveHaus Training Club — início"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src="/brand/movehaus-logo.jpg"
        alt="MoveHaus Training Club"
        width={size}
        height={size}
        priority={priority}
        className="h-auto max-w-full rounded-md object-contain"
      />
    </Link>
  );
}
