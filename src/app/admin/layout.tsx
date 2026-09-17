import Link from "next/link";
import { ArrowUpRight, LogOut, ShieldCheck } from "lucide-react";
import { requireAdmin, getProfile } from "@/lib/auth/user";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col bg-mh-black">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-mh-ink/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-mh-red" />
            <span className="font-semibold text-white">MoveHaus</span>
            <span className="rounded bg-mh-surface px-1.5 py-0.5 text-[11px] uppercase tracking-widest text-mh-muted">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                Ver o site
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <span className="hidden text-sm text-mh-muted sm:inline">
              {profile?.full_name || "Administrador"}
            </span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="size-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-white/10 bg-mh-ink/60">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
          <AdminNav />
        </div>
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
}
