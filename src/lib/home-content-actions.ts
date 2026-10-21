"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/user";
import { HOME_TEXT_FIELDS } from "@/content/home";

/** Salva os textos da home. Campo igual ao padrão (ou vazio) volta ao padrão. */
export async function saveHomeTexts(fd: FormData): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const toUpsert: { key: string; value: string }[] = [];
  const toDelete: string[] = [];
  for (const field of HOME_TEXT_FIELDS) {
    // Normaliza quebras de linha (textarea manda \r\n; os padrões usam \n).
    const value = String(fd.get(field.key) ?? "").replace(/\r\n/g, "\n").trim();
    if (value && value !== field.default.trim()) toUpsert.push({ key: field.key, value });
    else toDelete.push(field.key);
  }

  if (toUpsert.length) await supabase.from("home_content").upsert(toUpsert, { onConflict: "key" });
  if (toDelete.length) await supabase.from("home_content").delete().in("key", toDelete);

  updateTag("home-content");
  revalidatePath("/");
  revalidatePath("/admin/home");
}
