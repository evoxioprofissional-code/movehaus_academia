import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

/** Botão flutuante de WhatsApp — círculo no mobile, pílula com rótulo no desktop. */
export function WhatsappFab() {
  if (!SITE.whatsapp) return null;
  return (
    <a
      href={whatsappLink("Olá! Vim pela loja da MoveHaus e gostaria de tirar uma dúvida.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-4 right-4 z-40 flex h-13 items-center gap-2 rounded-full bg-emerald-600 px-3.5 text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] ring-1 ring-white/10 transition-all hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="size-6 shrink-0" />
      <span className="hidden pr-1 text-sm font-semibold sm:inline">
        Fale conosco
      </span>
    </a>
  );
}
