import Link from "next/link";
import { Mail, MessageCircle, Search, ShieldCheck, Users } from "lucide-react";
import { Badge, Card, Empty, Page, PageHeader, btn, inputCls } from "@/components/admin/kit";
import { listCustomers } from "@/lib/admin/data";
import { cn, formatBRL } from "@/lib/utils";

export const metadata = { title: "Clientes | MoveHaus Admin" };

function waLink(phone: string | null, name: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const number = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${number}?text=${encodeURIComponent(`Olá${name ? `, ${name.split(" ")[0]}` : ""}! Aqui é da MoveHaus.`)}`;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });

const ROLES = [
  { key: "", label: "Todos" },
  { key: "customer", label: "Clientes" },
  { key: "admin", label: "Administradores" },
];

const GRID = "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_80px_120px_120px_96px]";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const params = await searchParams;
  const all = await listCustomers();
  const query = (params.q || "").toLowerCase();
  const role = params.role || "";
  const customers = all.filter((customer) => (!query || `${customer.full_name} ${customer.email} ${customer.whatsapp}`.toLowerCase().includes(query)) && (!role || customer.role === role));
  const buyers = all.filter((customer) => customer.orderCount > 0).length;

  return (
    <Page>
      <PageHeader title="Clientes" subtitle={`${all.length} conta(s) cadastrada(s) · ${buyers} já compraram`} />

      <form className="admin-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        {role && <input type="hidden" name="role" value={role} />}
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ad-muted" />
          <input name="q" defaultValue={params.q} placeholder="Buscar por nome, e-mail ou telefone" className={cn(inputCls, "h-12 pl-11")} />
        </label>
        <button className={btn("primary", "md", "h-12")}>Buscar</button>
      </form>

      <div className="admin-noscroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {ROLES.map((item) => {
          const on = item.key === role;
          const href = { pathname: "/admin/clientes", query: { ...(params.q ? { q: params.q } : {}), ...(item.key ? { role: item.key } : {}) } };
          return (
            <Link key={item.key || "all"} href={href} scroll={false} className={cn("inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13.5px] font-semibold", on ? "bg-ad-ink text-white" : "bg-white text-ad-ink-2 shadow-[0_0_0_1px_rgb(32_37_34/0.08)] hover:bg-ad-soft")}>
              {item.label}
            </Link>
          );
        })}
      </div>

      {customers.length === 0 ? (
        <Card className="mt-4"><Empty icon={Users} title="Nenhum cliente encontrado" text="Ajuste a busca ou aguarde novos cadastros na loja." /></Card>
      ) : (
        <Card className="mt-4" padded={false}>
          <div className={cn("hidden gap-4 border-b border-ad-line px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ad-faint lg:grid", GRID)}>
            <span>Cliente</span><span>Contato</span><span className="text-right">Pedidos</span><span className="text-right">Total gasto</span><span>Cadastro</span><span />
          </div>
          <ul className="divide-y divide-ad-line">
            {customers.map((customer) => {
              const initials = (customer.full_name || customer.email || "C").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
              const wa = waLink(customer.whatsapp || customer.phone, customer.full_name);
              return (
                <li key={customer.id} className={cn("grid grid-cols-[1fr_auto] items-center gap-x-4 px-4 py-3.5 sm:px-6", GRID)}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ad-soft text-[12px] font-bold text-ad-ink-2">{initials}</span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[14.5px] font-semibold text-ad-ink">
                        <span className="truncate">{customer.full_name || "Sem nome"}</span>
                        {customer.role === "admin" && <Badge tone="red" className="px-2 py-0.5 text-[11px]"><ShieldCheck className="size-3" />Admin</Badge>}
                      </p>
                      <p className="truncate text-[12.5px] text-ad-muted lg:hidden">{customer.orderCount} pedido(s) · {formatBRL(customer.totalSpent)}</p>
                    </div>
                  </div>
                  <div className="hidden min-w-0 lg:block">
                    <p className="truncate text-[13.5px] text-ad-ink-2">{customer.email}</p>
                    <p className="truncate text-[12.5px] text-ad-muted">{customer.whatsapp || customer.phone || "Sem telefone"}</p>
                  </div>
                  <span className="hidden text-right text-[14px] tabular-nums lg:block">{customer.orderCount}</span>
                  <span className="hidden text-right text-[14px] font-semibold tabular-nums lg:block">{formatBRL(customer.totalSpent)}</span>
                  <span className="hidden text-[13px] text-ad-muted lg:block">{dateFmt.format(new Date(customer.created_at))}</span>
                  <div className="flex justify-end gap-1.5">
                    {wa && (
                      <a href={wa} target="_blank" rel="noreferrer" aria-label="Conversar no WhatsApp" className="grid size-10 place-items-center rounded-full bg-[#e7f4ea] text-[#1f7a3d] transition-transform active:scale-95">
                        <MessageCircle className="size-[18px]" />
                      </a>
                    )}
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} aria-label="Enviar e-mail" className="grid size-10 place-items-center rounded-full bg-ad-soft text-ad-ink-2 transition-transform active:scale-95">
                        <Mail className="size-[18px]" />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </Page>
  );
}
