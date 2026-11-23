import Image from "next/image";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { BannerForm } from "@/components/admin/banner-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge, Card, Empty, Page, PageHeader } from "@/components/admin/kit";
import { deleteBanner } from "@/lib/admin/actions";
import { listBanners } from "@/lib/admin/data";
import { publicEnv } from "@/lib/env";

export const metadata = { title: "Banners | MoveHaus Admin" };

const storageUrl = (path: string | null) => (path ? `${publicEnv.supabaseUrl}/storage/v1/object/public/catalog/${path}` : null);
function bannerTiming(banner: { starts_at: string | null; ends_at: string | null }) {
  const now = Date.now();
  return {
    ended: banner.ends_at ? new Date(banner.ends_at).getTime() < now : false,
    scheduled: banner.starts_at ? new Date(banner.starts_at).getTime() > now : false,
  };
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });

export default async function BannersPage() {
  const banners = await listBanners();

  return (
    <Page>
      <PageHeader title="Banners" subtitle="Campanhas com imagem própria para computador e celular." />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="order-2 xl:order-1">
          {banners.length === 0 ? (
            <Card><Empty icon={ImageIcon} title="Nenhum banner" text="Crie uma campanha no formulário. Ela entra sem apagar a vitrine atual." /></Card>
          ) : (
            <ul className="space-y-2.5">
              {banners.map((banner) => {
                const image = storageUrl(banner.desktop_image_path) ?? storageUrl(banner.mobile_image_path);
                const { ended, scheduled } = bannerTiming(banner);
                return (
                  <li key={banner.id} className="admin-card flex items-center gap-3 p-3 sm:gap-4">
                    <span className="relative aspect-[16/9] w-28 shrink-0 overflow-hidden rounded-xl bg-ad-soft sm:w-40">
                      {image ? <Image src={image} alt="" fill sizes="160px" className="object-cover" /> : <ImageIcon className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-ad-faint" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ad-ink">{banner.title}</p>
                      {banner.subtitle && <p className="truncate text-[13px] text-ad-muted">{banner.subtitle}</p>}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {!banner.active ? <Badge tone="neutral">Desligado</Badge> : ended ? <Badge tone="neutral">Encerrado</Badge> : scheduled ? <Badge tone="amber">Agendado</Badge> : <Badge tone="green" dot>No ar</Badge>}
                        <Badge tone="neutral">Ordem {banner.position}</Badge>
                        {banner.ends_at && <Badge tone="neutral">até {dateFmt.format(new Date(banner.ends_at))}</Badge>}
                      </div>
                    </div>
                    <form action={deleteBanner}>
                      <input type="hidden" name="id" value={banner.id} />
                      <ConfirmButton message={`Excluir o banner “${banner.title}”?`} aria-label="Excluir banner" className="grid size-10 place-items-center rounded-full text-ad-muted hover:bg-ad-red-soft hover:text-ad-red">
                        <Trash2 className="size-4" />
                      </ConfirmButton>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Card className="order-1 h-fit xl:sticky xl:top-[92px] xl:order-2" title={<span className="inline-flex items-center gap-2"><Plus className="size-4" /> Novo banner</span>}>
          <BannerForm />
        </Card>
      </div>
    </Page>
  );
}
