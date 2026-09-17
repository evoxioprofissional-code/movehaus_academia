import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo priority />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
