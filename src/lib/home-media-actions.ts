"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/user";

async function removeStored(path: string | null | undefined) {
  if (!path) return;
  try {
    await createAdminClient().storage.from("catalog").remove([path]);
  } catch {
    // ignora
  }
}

/** Envia/troca a imagem de um slot da home. */
export async function uploadHomeImage(fd: FormData): Promise<void> {
  await requireAdmin();
  const key = String(fd.get("key") ?? "").trim();
  const file = fd.get("image") as File | null;
  if (!key || !file || file.size === 0) return;
  if (file.size > 8 * 1024 * 1024) return; // 8MB

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `home/${key}-${crypto.randomUUID()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("catalog")
    .upload(path, file, { contentType: file.type || "image/jpeg" });
  if (error) return;

  const supabase = await createClient();
  const { data: prev } = await supabase
    .from("home_media")
    .select("storage_path")
    .eq("key", key)
    .maybeSingle();
  await supabase.from("home_media").upsert(
    { key, storage_path: path },
    { onConflict: "key" },
  );
  await removeStored(prev?.storage_path); // apaga a imagem antiga

  updateTag("home-media");
  revalidatePath("/");
  revalidatePath("/admin/home");
}

/** Remove a imagem do slot (volta ao placeholder). */
export async function removeHomeImage(fd: FormData): Promise<void> {
  await requireAdmin();
  const key = String(fd.get("key") ?? "");
  if (!key) return;
  const supabase = await createClient();
  const { data: prev } = await supabase
    .from("home_media")
    .select("storage_path")
    .eq("key", key)
    .maybeSingle();
  await supabase.from("home_media").delete().eq("key", key);
  await removeStored(prev?.storage_path);

  updateTag("home-media");
  revalidatePath("/");
  revalidatePath("/admin/home");
}
