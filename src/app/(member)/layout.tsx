import { MemberShell } from "@/components/customer/member-shell";
import { NavigationFeedback } from "@/components/layout/navigation-feedback";
import { getProfile } from "@/lib/auth/user";
import { getPublicSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/site";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings] = await Promise.all([getProfile(), getPublicSettings()]);
  const initials = (profile?.full_name || profile?.email || "M")
    .trim()
    .charAt(0)
    .toLocaleUpperCase("pt-BR");

  return (
    <>
      <NavigationFeedback />
      <MemberShell
        initials={initials}
        city={settings.city}
        helpHref={settings.whatsapp ? whatsappLink("Olá! Preciso de ajuda na minha área MoveHaus.", settings.whatsapp) : "/sobre"}
      >
        {children}
      </MemberShell>
    </>
  );
}
