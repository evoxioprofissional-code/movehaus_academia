import { requireAdmin, getProfile } from "@/lib/auth/user";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminNavCounts } from "@/lib/admin/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const [profile, counts] = await Promise.all([getProfile(), adminNavCounts()]);

  return (
    <AdminShell adminName={profile?.full_name || "Administrador"} counts={counts}>
      {children}
    </AdminShell>
  );
}
