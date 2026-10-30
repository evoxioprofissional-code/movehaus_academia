import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerOverview } from "@/lib/customer/data";
import { LibraryCards } from "@/components/customer/library-cards";

export const metadata = { title: "Minha biblioteca" };

export default async function LibraryPage() {
  const overview = await getCustomerOverview();
  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link href="/minha-area" className="inline-flex min-h-10 items-center gap-2 text-sm text-mh-muted hover:text-white"><ArrowLeft className="size-4" />Minha área</Link><h1 className="mt-4 text-3xl font-bold text-white">Minha biblioteca</h1><p className="mt-2 text-sm text-mh-muted">Seus programas, aulas e e-books. Abra um conteúdo para começar ou continuar de onde parou.</p><LibraryCards overview={overview} /></div>;
}
