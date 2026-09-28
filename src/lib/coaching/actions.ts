"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/user";

/** Concede acesso manual à área de Acompanhamento. */
export async function grantCoachingAccess(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(fd.get("user_id") ?? "");
  if (!userId) return;
  const supabase = await createClient();
  await supabase.from("coaching_access").upsert(
    {
      user_id: userId,
      active: true,
      source: "manual",
      granted_by: admin.id,
      starts_at: new Date().toISOString(),
      expires_at: null,
    },
    { onConflict: "user_id" },
  );
  revalidatePath("/admin/acompanhamento");
}

/** Revoga o acesso (mantém o registro, apenas inativa). */
export async function revokeCoachingAccess(fd: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(fd.get("user_id") ?? "");
  if (!userId) return;
  const supabase = await createClient();
  await supabase
    .from("coaching_access")
    .update({ active: false })
    .eq("user_id", userId);
  revalidatePath("/admin/acompanhamento");
}
