import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <Logo />
      <p className="font-display text-6xl font-bold text-mh-red">404</p>
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-tight text-white">
          Página não encontrada
        </h1>
        <p className="mt-2 max-w-sm text-mh-muted">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Ir para o início</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/loja">Ver a loja</Link>
        </Button>
      </div>
    </div>
  );
}
