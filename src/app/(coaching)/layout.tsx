import { CoachingShell } from "@/components/coaching/coaching-shell";
import { NavigationFeedback } from "@/components/layout/navigation-feedback";
import { getProfile } from "@/lib/auth/user";

export default async function CoachingLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const initial = (profile?.full_name || profile?.email || "M")
    .trim()
    .charAt(0)
    .toLocaleUpperCase("pt-BR");

  return (
    <>
      <NavigationFeedback />
      <CoachingShell initial={initial}>{children}</CoachingShell>
    </>
  );
}
