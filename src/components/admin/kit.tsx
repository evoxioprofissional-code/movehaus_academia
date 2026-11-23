/*
 * Kit visual do painel MoveHaus. Tudo que se repete nas telas do admin mora
 * aqui para todas terem a mesma cara: claro, arejado, vermelho da marca como
 * ação e preto MoveHaus como contraste.
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Estrutura ---------------- */

export function Page({ children, className, narrow }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return (
    <div className={cn("mx-auto w-full px-4 pb-32 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8", narrow ? "max-w-[880px]" : "max-w-[1320px]", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  back,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-full pr-3 text-[13px] font-medium text-ad-muted transition-colors hover:text-ad-ink">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        )}
        {eyebrow && <p className="mb-1 text-[13px] text-ad-muted">{eyebrow}</p>}
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-ad-ink sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-ad-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  padded = true,
  id,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("admin-card scroll-mt-24", className)}>
      {title && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-ad-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-ad-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={cn(padded && "p-5 sm:p-6", padded && title && "pt-4 sm:pt-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------------- Cores de apoio ---------------- */

export type Tone = "neutral" | "red" | "green" | "amber" | "blue" | "violet" | "ink";

export const TONE_SOFT: Record<Tone, string> = {
  neutral: "bg-ad-soft text-ad-ink-2",
  red: "bg-ad-red-soft text-ad-red",
  green: "bg-[#e7f4ea] text-[#1f7a3d]",
  amber: "bg-[#fdf1df] text-[#a05a06]",
  blue: "bg-[#e8f0fb] text-[#2a5db0]",
  violet: "bg-[#f0ebfa] text-[#6a42c2]",
  ink: "bg-ad-ink text-white",
};

export const TONE_SOLID: Record<Tone, string> = {
  neutral: "bg-ad-ink-2",
  red: "bg-ad-red",
  green: "bg-[#2e9a52]",
  amber: "bg-[#e08a1a]",
  blue: "bg-[#3a6fc4]",
  violet: "bg-[#7a52d1]",
  ink: "bg-ad-ink",
};

export const TONE_HEX: Record<Tone, string> = {
  neutral: "#737470",
  red: "#d21f35",
  green: "#2e9a52",
  amber: "#e08a1a",
  blue: "#3a6fc4",
  violet: "#7a52d1",
  ink: "#202522",
};

export function Badge({ tone = "neutral", dot, children, className }: { tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium leading-none", TONE_SOFT[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

/** Ícone em quadradinho suave (métricas, listas). */
export function IconTile({ icon: Icon, tone = "neutral", solid, className }: { icon: LucideIcon; tone?: Tone; solid?: boolean; className?: string }) {
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", solid ? cn(TONE_SOLID[tone], "text-white") : TONE_SOFT[tone], className)}>
      <Icon className="size-[18px]" strokeWidth={2} />
    </span>
  );
}

/* ---------------- Indicadores ---------------- */

export function Sparkline({ values, color, id, className }: { values: number[]; color: string; id: string; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 36 - ((v - min) / (max - min || 1)) * 30]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const gid = `spark-${id}`;
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.2" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L100,40 L0,40 Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  spark,
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  spark?: number[];
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-ad-muted">{label}</p>
        <IconTile icon={icon} tone={tone} className="size-9 rounded-[10px]" />
      </div>
      <p className="mt-2 text-[24px] font-bold leading-none tracking-[-0.03em] tabular-nums text-ad-ink sm:text-[27px]">{value}</p>
      {hint && <p className="relative z-10 mt-2.5 max-w-[60%] truncate text-[12.5px] text-ad-muted">{hint}</p>}
      {spark && <Sparkline values={spark} color={TONE_HEX[tone]} id={label.replace(/\W/g, "")} className="pointer-events-none absolute bottom-0 right-0 h-11 w-[42%]" />}
    </>
  );
  const cls = "admin-card relative block overflow-hidden p-4 sm:p-5";
  return href ? <Link href={href} className={cn(cls, "transition-transform active:scale-[0.99]")}>{body}</Link> : <div className={cls}>{body}</div>;
}

/* ---------------- Botões ---------------- */

type BtnVariant = "primary" | "brand" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg" | "icon";

const BTN: Record<BtnVariant, string> = {
  primary: "bg-ad-ink text-white hover:bg-[#2f3631]",
  brand: "bg-ad-red text-white hover:bg-ad-red-hover",
  secondary: "bg-white text-ad-ink shadow-[0_0_0_1px_rgb(32_37_34/0.12)] hover:bg-ad-soft",
  ghost: "text-ad-ink hover:bg-ad-soft",
  danger: "bg-white text-ad-red shadow-[0_0_0_1px_rgb(210_31_53/0.28)] hover:bg-ad-red-soft",
};

const BTN_SIZE: Record<BtnSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-12 px-6 text-[15px]",
  icon: "size-10",
};

export function btn(variant: BtnVariant = "secondary", size: BtnSize = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background,box-shadow,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
    BTN_SIZE[size],
    BTN[variant],
    className,
  );
}

/* ---------------- Formulário ---------------- */

export const inputCls =
  "w-full rounded-xl border-0 bg-ad-soft px-3.5 text-[15px] text-ad-ink outline-none ring-1 ring-transparent transition-[box-shadow,background] placeholder:text-ad-faint hover:bg-[#ecebe6] focus:bg-white focus:ring-2 focus:ring-ad-ink/30 sm:text-[14px]";

export function FormField({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-ad-ink-2">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-[12px] leading-snug text-ad-faint">{hint}</p>}
    </div>
  );
}

export function Input({ className, prefix, suffix, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: string; suffix?: string }) {
  if (prefix || suffix) {
    return (
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-ad-muted">{prefix}</span>}
        <input className={cn(inputCls, "h-12 sm:h-11", prefix && "pl-10", suffix && "pr-12", className)} {...props} />
        {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-ad-muted">{suffix}</span>}
      </span>
    );
  }
  return <input className={cn(inputCls, "h-12 sm:h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, "min-h-[104px] py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select className={cn(inputCls, "h-12 cursor-pointer appearance-none pr-10 sm:h-11", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ad-muted" />
    </span>
  );
}

/** Interruptor que funciona em formulário comum (envia "on" quando ligado). */
export function Toggle({ name, label, description, defaultChecked, className }: { name: string; label: React.ReactNode; description?: React.ReactNode; defaultChecked?: boolean; className?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-4 py-1", className)}>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-ad-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[12.5px] text-ad-muted">{description}</span>}
      </span>
      <span className="relative shrink-0">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="block h-[26px] w-[44px] rounded-full bg-[#dedcd5] transition-colors duration-200 peer-checked:bg-ad-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ad-ink/30" />
        <span className="absolute left-[3px] top-[3px] size-5 rounded-full bg-white shadow-[0_2px_4px_rgb(0_0_0/0.18)] transition-transform duration-200 peer-checked:translate-x-[18px]" />
      </span>
    </label>
  );
}

export function Alert({ tone = "red", children }: { tone?: "red" | "green" | "amber"; children: React.ReactNode }) {
  return <p role={tone === "red" ? "alert" : "status"} className={cn("rounded-2xl px-4 py-3 text-[14px]", TONE_SOFT[tone])}>{children}</p>;
}

/* ---------------- Vazio ---------------- */

export function Empty({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-ad-soft text-ad-muted"><Icon className="size-6" /></span>
      <p className="mt-4 text-[16px] font-semibold text-ad-ink">{title}</p>
      {text && <p className="mt-1 max-w-[360px] text-[14px] text-ad-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Status de pedido ---------------- */

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Recebido", tone: "amber" },
  paid: { label: "Pago", tone: "blue" },
  preparing: { label: "Preparando", tone: "violet" },
  shipped: { label: "Enviado", tone: "blue" },
  delivered: { label: "Entregue", tone: "green" },
  cancelled: { label: "Cancelado", tone: "neutral" },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Aguardando pagamento", tone: "amber" },
  approved: { label: "Pago", tone: "green" },
  failed: { label: "Pagamento falhou", tone: "red" },
  refunded: { label: "Reembolsado", tone: "neutral" },
  cancelled: { label: "Cancelado", tone: "neutral" },
};

export function OrderBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function PaymentBadge({ status }: { status: string }) {
  const s = PAYMENT_STATUS[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/* ---------------- Período ---------------- */

const PERIODS = [
  { value: 1, label: "24h" },
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

/** Seletor de período em pílulas (links, sem precisar de botão "Aplicar"). */
export function PeriodTabs({ value, basePath }: { value: number; basePath: string }) {
  return (
    <div className="inline-flex rounded-full bg-white p-1 shadow-[0_0_0_1px_rgb(32_37_34/0.08)]" role="tablist" aria-label="Período">
      {PERIODS.map((period) => (
        <Link
          key={period.value}
          href={`${basePath}?period=${period.value}`}
          role="tab"
          aria-selected={value === period.value}
          scroll={false}
          className={cn(
            "grid h-9 min-w-[60px] place-items-center rounded-full px-3 text-[13px] font-semibold transition-colors",
            value === period.value ? "bg-ad-ink text-white" : "text-ad-muted hover:text-ad-ink",
          )}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}

/** Variação contra o período anterior. */
export function Delta({ now, before }: { now: number; before: number }) {
  if (!before && !now) return <span className="text-ad-faint">sem movimento</span>;
  if (!before) return <span className="font-semibold text-[#1f7a3d]">novo no período</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  return (
    <span className={cn("font-semibold", up ? "text-[#1f7a3d]" : "text-ad-red")}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% <span className="font-normal text-ad-muted">vs. anterior</span>
    </span>
  );
}
