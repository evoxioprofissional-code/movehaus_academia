"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/utils";

type Point = { date: string; total: number; orders: number };

const fmtDay = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
const fmtShort = (cents: number) => {
  const value = cents / 100;
  if (value >= 1000) return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return `R$ ${Math.round(value).toLocaleString("pt-BR")}`;
};

function label(date: string) {
  return fmtDay.format(new Date(`${date}T12:00:00Z`)).replace(".", "");
}

/** Faturamento por dia: linha com área suave e leitura ao tocar/passar o mouse. */
export function RevenueChart({ data, height = 220 }: { data: Point[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((point) => point.total), 1);
  const top = niceCeil(max);
  const W = 100;
  const H = 100;
  const x = (i: number) => (data.length === 1 ? W / 2 : (i / (data.length - 1)) * W);
  const y = (v: number) => H - (v / top) * H;
  const line = data.map((point, i) => `${i ? "L" : "M"}${x(i).toFixed(3)},${y(point.total).toFixed(3)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const active = hover ?? null;
  const ticks = [top, top / 2, 0];

  return (
    <div className="select-none">
      <div className="flex gap-3">
        <div className="flex w-14 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums text-ad-faint" style={{ height }}>
          {ticks.map((tick) => (
            <span key={tick} className="whitespace-nowrap leading-none">{fmtShort(tick)}</span>
          ))}
        </div>
        <div
          className="relative flex-1 touch-pan-y"
          style={{ height }}
          onPointerLeave={() => setHover(null)}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
            setHover(Math.round(ratio * (data.length - 1)));
          }}
        >
          {/* linhas de grade */}
          {ticks.map((tick) => (
            <span key={tick} className="absolute inset-x-0 border-t border-dashed border-ad-line" style={{ top: `${100 - (tick / top) * 100}%` }} />
          ))}
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="mh-rev-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#d21f35" stopOpacity="0.18" />
                <stop offset="1" stopColor="#d21f35" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#mh-rev-fill)" />
            <path d={line} fill="none" stroke="#d21f35" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {active != null && data[active] && (
            <>
              <span className="pointer-events-none absolute inset-y-0 w-px bg-ad-ink/15" style={{ left: `${x(active)}%` }} />
              <span
                className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-white bg-ad-red shadow-[0_1px_4px_rgb(0_0_0/0.25)]"
                style={{ left: `${x(active)}%`, top: `${y(data[active].total)}%` }}
              />
              <div
                className="pointer-events-none absolute top-0 z-10 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-xl bg-ad-ink px-3 py-2 text-[12px] text-white shadow-lg"
                style={{ left: `${x(active)}%`, transform: `translate(${active > data.length * 0.7 ? "-100%" : active < data.length * 0.3 ? "0" : "-50%"}, calc(-100% - 6px))` }}
              >
                <p className="font-semibold tabular-nums">{formatBRL(data[active].total)}</p>
                <p className="text-white/65">{label(data[active].date)} · {data[active].orders} pedido(s)</p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="relative ml-[calc(3.5rem+12px)] mt-2 h-4 text-[11px] tabular-nums text-ad-faint">
        {axisTicks(data.length).map((i, k, all) => (
          <span
            key={i}
            className="absolute whitespace-nowrap"
            style={{ left: `${x(i)}%`, transform: `translateX(${k === 0 ? "0" : k === all.length - 1 ? "-100%" : "-50%"})` }}
          >
            {axisLabel(data[i].date)}
          </span>
        ))}
      </div>
    </div>
  );
}

function axisTicks(n: number) {
  if (n <= 1) return n ? [0] : [];
  const count = Math.min(n, 5);
  return [...new Set(Array.from({ length: count }, (_, k) => Math.round((k * (n - 1)) / (count - 1))))];
}

function axisLabel(date: string) {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

function niceCeil(value: number) {
  const reais = value / 100;
  if (reais <= 100) return 10000;
  const pow = 10 ** Math.floor(Math.log10(reais));
  const n = reais / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow * 100;
}
