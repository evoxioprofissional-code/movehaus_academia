import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase/anon";

/**
 * Textos da home sobrescritos pelo admin (key -> value), cacheados entre
 * requisições. Vazio quando nada foi editado (a home usa os textos padrão).
 */
export const getHomeText = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabaseAnon.from("home_content").select("key, value");
      const out: Record<string, string> = {};
      for (const row of data ?? []) out[row.key] = row.value;
      return out;
    } catch {
      return {};
    }
  },
  ["home-content"],
  { revalidate: 300, tags: ["home-content"] },
);
