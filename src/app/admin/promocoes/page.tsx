import { BadgePercent, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponForm } from "@/components/admin/coupon-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { deleteCoupon } from "@/lib/admin/actions";
import { listCoupons } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Cupons e promoções | MoveHaus Admin" };
export default async function PromotionsPage() {
  const coupons = await listCoupons();
  return <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8"><AdminPageHeader title="Cupons e promoções" description="Crie regras comerciais com validade e limites claros." /><div className="mt-5"><CouponForm /></div>{coupons.length === 0 ? <div className="mt-5"><EmptyState icon={BadgePercent} title="Nenhum cupom criado" description="Crie o primeiro cupom usando o formulário acima." /></div> : <div className="mt-5 overflow-hidden rounded-lg bg-mh-surface">{coupons.map((coupon) => <div key={coupon.id} className="flex flex-wrap items-center gap-4 border-b border-white/6 p-4"><div className="min-w-40 flex-1"><p className="font-mono font-semibold text-white">{coupon.code}</p><p className="text-sm text-mh-muted">{coupon.description || "Sem descrição"}</p></div><p className="text-sm">{coupon.discount_type === "percentage" ? `${coupon.discount_value / 100}%` : formatBRL(coupon.discount_value)}</p><p className="text-sm text-mh-muted">{coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ""} usos</p><Badge tone={coupon.active ? "success" : "muted"}>{coupon.active ? "Ativo" : "Inativo"}</Badge><form action={deleteCoupon}><input type="hidden" name="id" value={coupon.id} /><button aria-label="Excluir cupom" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-red-500/10 hover:text-red-300"><Trash2 className="size-4" /></button></form></div>)}</div>}</div>;
}
