import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { getPublicSettings } from "@/lib/settings";

export async function WhatsappFab() {
  const settings = await getPublicSettings();
  if (!settings.whatsapp) return null;
  return <a href={whatsappLink("Olá! Vim pela loja da MoveHaus e gostaria de tirar uma dúvida.", settings.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" className="fixed bottom-4 right-4 z-40 grid size-12 place-items-center rounded-full border border-white/20 bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:bottom-6 sm:right-6"><MessageCircle className="size-5" /></a>;
}
