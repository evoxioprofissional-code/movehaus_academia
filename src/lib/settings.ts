import { unstable_cache } from "next/cache";
import { supabaseAnon } from "@/lib/supabase/anon";
import { SITE } from "@/lib/site";

export type PublicSettings = {
  academyName: string;
  whatsapp: string;
  whatsappLabel: string;
  email: string;
  instagram: string;
  address: string;
  city: string;
  terms: string;
  privacy: string;
};

const FALLBACK: PublicSettings = {
  academyName: SITE.name,
  whatsapp: SITE.whatsapp,
  whatsappLabel: SITE.whatsappLabel,
  email: SITE.email,
  instagram: SITE.instagram,
  address: SITE.address,
  city: SITE.city,
  terms: "",
  privacy: "",
};

/**
 * Configurações públicas do site, com fallback para as constantes de src/lib/site.
 * Cacheadas entre requisições (5 min) via cliente anônimo — nunca quebra se o
 * banco estiver indisponível.
 */
export const getPublicSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    try {
      const { data } = await supabaseAnon
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (!data) return FALLBACK;
      return {
        academyName: data.academy_name || FALLBACK.academyName,
        whatsapp: data.whatsapp || FALLBACK.whatsapp,
        whatsappLabel: data.whatsapp_label || FALLBACK.whatsappLabel,
        email: data.email || FALLBACK.email,
        instagram: data.instagram || FALLBACK.instagram,
        address: data.address || FALLBACK.address,
        city: data.city || FALLBACK.city,
        terms: data.terms || "",
        privacy: data.privacy || "",
      };
    } catch {
      return FALLBACK;
    }
  },
  ["public-settings"],
  { revalidate: 300, tags: ["settings"] },
);
