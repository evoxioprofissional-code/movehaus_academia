import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase/anon";

/**
 * Imagens da home cadastradas pelo admin (key -> URL pública), cacheadas entre
 * requisições. Vazio se nada foi enviado (a home mostra o placeholder).
 */
export const getHomeMedia = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabaseAnon
        .from("home_media")
        .select("key, storage_path");
      const out: Record<string, string> = {};
      for (const r of data ?? []) {
        const { data: pub } = supabaseAnon.storage
          .from("catalog")
          .getPublicUrl(r.storage_path);
        out[r.key] = pub.publicUrl;
      }
      return out;
    } catch {
      return {};
    }
  },
  ["home-media"],
  { revalidate: 300, tags: ["home-media"] },
);

export const getPublicBanners = unstable_cache(async () => {
  try {
    const now = new Date().toISOString();
    const { data } = await supabaseAnon.from("banners").select("*").eq("active", true).order("position");
    return (data ?? []).filter((banner) => (!banner.starts_at || banner.starts_at <= now) && (!banner.ends_at || banner.ends_at >= now)).map((banner) => ({
      ...banner,
      desktopUrl: banner.desktop_image_path ? supabaseAnon.storage.from("catalog").getPublicUrl(banner.desktop_image_path).data.publicUrl : null,
      mobileUrl: banner.mobile_image_path ? supabaseAnon.storage.from("catalog").getPublicUrl(banner.mobile_image_path).data.publicUrl : null,
    }));
  } catch { return []; }
}, ["public-banners"], { revalidate: 300, tags: ["banners"] });
