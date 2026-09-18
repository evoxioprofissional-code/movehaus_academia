import { ImageIcon, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BannerForm } from "@/components/admin/banner-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { deleteBanner } from "@/lib/admin/actions";
import { listBanners } from "@/lib/admin/data";

export const metadata = { title: "Banners | MoveHaus Admin" };
export default async function BannersPage() {
  const banners = await listBanners();
  return <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8"><AdminPageHeader title="Banners e vitrines" description="Organize campanhas da página inicial com imagens específicas para desktop e celular." /><div className="mt-5"><BannerForm /></div>{banners.length === 0 ? <div className="mt-5"><EmptyState icon={ImageIcon} title="Nenhum banner cadastrado" description="Adicione uma campanha sem substituir o conteúdo editorial atual da home." /></div> : <div className="mt-5 space-y-2">{banners.map((banner) => <div key={banner.id} className="flex items-center gap-4 rounded-lg bg-mh-surface p-4"><span className="grid size-10 place-items-center rounded bg-[#0d0d0f] text-mh-muted"><ImageIcon className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate font-medium">{banner.title}</p><p className="truncate text-sm text-mh-muted">{banner.subtitle}</p></div><Badge tone={banner.active ? "success" : "muted"}>{banner.active ? "Ativo" : "Inativo"}</Badge><span className="text-sm text-mh-muted">Ordem {banner.position}</span><form action={deleteBanner}><input type="hidden" name="id" value={banner.id} /><button aria-label="Excluir banner" className="grid size-9 place-items-center rounded text-mh-muted hover:bg-red-500/10 hover:text-red-300"><Trash2 className="size-4" /></button></form></div>)}</div>}</div>;
}
