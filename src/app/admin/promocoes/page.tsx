import { BadgePercent, Plus, Trash2 } from "lucide-react";
import { CouponForm } from "@/components/admin/coupon-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, Empty, Page, PageHeader } from "@/components/admin/kit";
import { deleteCoupon } from "@/lib/admin/actions";
import { listCoupons } from "@/lib/admin/data";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Cupons | MoveHaus Admin" };

function isExpired(endsAt: string | null) {
  return endsAt ? new Date(endsAt).getTime() < Date.now() : false;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });

export default async function PromotionsPage() {
  const coupons = await listCoupons();

  return (
    <Page>
      <PageHeader title="Cupons" subtitle="Descontos que o cliente digita no carrinho. Para promoção de um produto, use o preço antigo no cadastro dele." />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="order-2 xl:order-1">
          {coupons.length === 0 ? (
            <Card><Empty icon={BadgePercent} title="Nenhum cupom criado" text="Crie o primeiro cupom no formulário." /></Card>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.ends_at);
                const soldOut = coupon.usage_limit ? coupon.usage_count >= coupon.usage_limit : false;
                const live = coupon.active && !expired && !soldOut;
                const usage = coupon.usage_limit ? Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100) : 0;
                return (
                  <li key={coupon.id} className="admin-card relative overflow-hidden p-4 sm:p-5">
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: live ? "#d21f35" : "#d6d4cd" }} />
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[17px] font-bold tracking-wide text-ad-ink">{coupon.code}</p>
                        <p className="truncate text-[13px] text-ad-muted">{coupon.description || "Sem descrição"}</p>
                      </div>
                      <span className="rounded-xl bg-ad-red-soft px-2.5 py-1 text-[15px] font-bold tabular-nums text-ad-red">
                        {coupon.discount_type === "percentage" ? `-${coupon.discount_value / 100}%` : `-${formatBRL(coupon.discount_value)}`}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {live ? <Badge tone="green" dot>Valendo</Badge> : expired ? <Badge tone="neutral">Expirado</Badge> : soldOut ? <Badge tone="neutral">Esgotado</Badge> : <Badge tone="neutral">Pausado</Badge>}
                      {coupon.minimum_order ? <Badge tone="neutral">Mín. {formatBRL(coupon.minimum_order)}</Badge> : null}
                      {coupon.ends_at && <Badge tone="neutral">até {dateFmt.format(new Date(coupon.ends_at))}</Badge>}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] text-ad-muted">{coupon.usage_count}{coupon.usage_limit ? ` de ${coupon.usage_limit}` : ""} uso(s)</p>
                        {coupon.usage_limit ? <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ad-soft"><div className="h-full rounded-full bg-ad-ink" style={{ width: `${usage}%` }} /></div> : null}
                      </div>
                      <form action={deleteCoupon}>
                        <input type="hidden" name="id" value={coupon.id} />
                        <ConfirmButton message={`Excluir o cupom ${coupon.code}?`} aria-label={`Excluir cupom ${coupon.code}`} className="grid size-9 place-items-center rounded-full text-ad-muted hover:bg-ad-red-soft hover:text-ad-red"><Trash2 className="size-4" /></ConfirmButton>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Card className="order-1 h-fit xl:sticky xl:top-[92px] xl:order-2" title={<span className="inline-flex items-center gap-2"><Plus className="size-4" /> Novo cupom</span>}>
          <CouponForm />
        </Card>
      </div>
    </Page>
  );
}
