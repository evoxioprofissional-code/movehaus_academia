"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/site";
import { signOut } from "@/lib/auth/actions";

export function MobileNav({
  items,
  authed = false,
}: {
  items: { href: string; label: string }[];
  authed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="-ml-1 grid size-10 place-items-center rounded-full text-mh-text hover:bg-white/5 hover:text-white"
      >
        <Menu className="size-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={close}
          />
          <nav className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-mh-ink">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo size={40} />
              <button
                type="button"
                onClick={close}
                aria-label="Fechar menu"
                className="grid size-10 place-items-center rounded-full text-mh-muted hover:bg-white/5 hover:text-white"
              >
                <X className="size-6" />
              </button>
            </div>

            <form
              action="/loja"
              onSubmit={close}
              className="mx-5 mb-2 flex items-center gap-2 rounded-mh border border-mh-border bg-mh-surface px-3"
            >
              <Search className="size-4 shrink-0 text-mh-muted" />
              <input
                type="search"
                name="q"
                placeholder="Buscar..."
                aria-label="Buscar"
                className="h-11 w-full bg-transparent text-sm text-white placeholder:text-mh-muted focus:outline-none"
              />
            </form>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center justify-between rounded-mh px-4 py-3.5 text-lg font-medium transition-colors",
                      active
                        ? "bg-mh-surface text-white"
                        : "text-mh-text hover:bg-mh-surface",
                    )}
                  >
                    {item.label}
                    <ArrowUpRight
                      className={cn(
                        "size-5",
                        active ? "text-mh-red" : "text-mh-muted",
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="space-y-1 border-t border-mh-border px-3 py-3">
              {authed ? (
                <>
                  <Link
                    href="/minha-area"
                    onClick={close}
                    className="flex items-center gap-3 rounded-mh px-4 py-3 text-sm font-medium text-mh-text hover:bg-mh-surface"
                  >
                    <UserRound className="size-5 text-mh-muted" />
                    Minha conta
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      onClick={close}
                      className="flex w-full items-center gap-3 rounded-mh px-4 py-3 text-sm font-medium text-mh-text hover:bg-mh-surface"
                    >
                      <LogOut className="size-5 text-mh-muted" />
                      Sair
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={close}
                  className="flex items-center gap-3 rounded-mh px-4 py-3 text-sm font-medium text-mh-text hover:bg-mh-surface"
                >
                  <UserRound className="size-5 text-mh-muted" />
                  Entrar / Criar conta
                </Link>
              )}
              <Link
                href="/carrinho"
                onClick={close}
                className="flex items-center gap-3 rounded-mh px-4 py-3 text-sm font-medium text-mh-text hover:bg-mh-surface"
              >
                <ShoppingBag className="size-5 text-mh-muted" />
                Carrinho
              </Link>
              <a
                href={whatsappLink("Olá! Vim pela loja da MoveHaus.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="mt-1 flex items-center justify-center gap-2 rounded-mh bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                <MessageCircle className="size-5" />
                Falar no WhatsApp
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
