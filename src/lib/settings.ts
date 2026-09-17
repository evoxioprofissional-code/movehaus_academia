import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
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

/**
 * Configurações públicas do site, com fallback para as constantes de src/lib/site.
 * Cacheado por request. Nunca quebra se o banco estiver indisponível.
 */
export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  const fallback: PublicSettings = {
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
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (!data) return fallback;
    return {
      academyName: data.academy_name || fallback.academyName,
      whatsapp: data.whatsapp || fallback.whatsapp,
      whatsappLabel: data.whatsapp_label || fallback.whatsappLabel,
      email: data.email || fallback.email,
      instagram: data.instagram || fallback.instagram,
      address: data.address || fallback.address,
      city: data.city || fallback.city,
      terms: data.terms || "",
      privacy: data.privacy || "",
    };
  } catch {
    return fallback;
  }
});
