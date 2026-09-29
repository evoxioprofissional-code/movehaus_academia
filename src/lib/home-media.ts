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
  { revalidate: 30, tags: ["home-media"] },
);
