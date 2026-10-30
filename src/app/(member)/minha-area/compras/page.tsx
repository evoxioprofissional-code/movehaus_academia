import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerOverview } from "@/lib/customer/data";
import { PurchaseCards } from "@/components/customer/purchase-cards";

export const metadata = { title: "Minhas compras" };

export default async function PurchasesPage() {
  const overview = await getCustomerOverview();
  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link href="/minha-area" className="inline-flex min-h-10 items-center gap-2 text-sm text-mh-muted hover:text-white"><ArrowLeft className="size-4" />Minha área</Link><h1 className="mt-4 text-3xl font-bold text-white">Minhas compras</h1><p className="mt-2 text-sm text-mh-muted">Acompanhe pagamentos, assinaturas e comprovantes. Para receber um produto físico, envie à academia o código da compra confirmada.</p><PurchaseCards overview={overview} /></div>;
}
