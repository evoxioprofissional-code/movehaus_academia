import { requireAdmin, getProfile } from "@/lib/auth/user";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const profile = await getProfile();

  return <AdminShell adminName={profile?.full_name || "Administrador"}>{children}</AdminShell>;
}
