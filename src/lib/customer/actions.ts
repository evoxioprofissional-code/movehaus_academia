"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type CustomerActionState = { error?: string; message?: string };

export async function updateCustomerProfile(_state: CustomerActionState, formData: FormData): Promise<CustomerActionState> {
  const user = await requireUser("/minha-area");
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/[^0-9+() -]/g, "").trim().slice(0, 30);
  if (fullName.length < 2) return { error: "Informe seu nome." };
  const { error } = await (await createClient()).from("profiles").update({ full_name: fullName, whatsapp, phone: whatsapp }).eq("id", user.id);
  if (error) return { error: "Não foi possível atualizar seus dados." };
  revalidatePath("/minha-area");
  return { message: "Dados atualizados." };
}

export async function saveReadingProgress(productId: string, chapterId: string, percent: number) {
  const user = await requireUser("/minha-area");
  const supabase = await createClient();
  const { data: access } = await supabase.from("digital_access").select("id,permanent,expires_at,status").eq("user_id", user.id).eq("product_id", productId).eq("status", "active").maybeSingle();
  if (!access || (!access.permanent && access.expires_at && Date.parse(access.expires_at) <= Date.now())) return { error: "Acesso indisponível." };
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  const { error } = await supabase.from("reading_progress").upsert({ user_id: user.id, product_id: productId, chapter_id: chapterId, progress_percent: safePercent }, { onConflict: "user_id,product_id" });
  return error ? { error: "Não foi possível salvar o progresso." } : { ok: true };
}

export async function cancelSubscription(formData: FormData) {
  const user = await requireUser("/minha-area");
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: owned } = await supabase.from("subscriptions").select("id,status").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!owned || !["pending", "active", "past_due"].includes(owned.status)) throw new Error("Assinatura não encontrada.");
  const { error } = await createAdminClient().from("subscriptions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Não foi possível solicitar o cancelamento.");
  revalidatePath("/minha-area");
}
