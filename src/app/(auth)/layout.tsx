import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(max-width: 767px)", color: "#f6f5f2" },
    { media: "(min-width: 768px)", color: "#090a0c" },
  ],
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mh-mobile-app mh-auth-app grid min-h-svh w-full flex-1 bg-mh-black lg:grid-cols-[minmax(22rem,0.85fr)_1.15fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[#101012] p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rotate-12 bg-mh-red" />
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/55">MoveHaus Training Club</p>
          <h2 className="mt-6 max-w-md font-display text-6xl font-bold uppercase leading-[0.9] text-white">
            Suas compras.<br /><span className="text-mh-red">Suas leituras.</span>
          </h2>
        </div>
        <p className="relative max-w-sm text-sm leading-relaxed text-white/55">
          Compras e produtos digitais reunidos na sua área MoveHaus.
        </p>
      </aside>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6 lg:py-16">
        <div className="mb-8 flex items-center justify-between">
          <Logo priority />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-mh-muted hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </div>
        {children}
      </div>
      <AppBottomNav />
    </div>
  );
}
