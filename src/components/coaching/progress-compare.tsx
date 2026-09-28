"use client";

import { useState } from "react";

type Item = { id: string; url: string | null; taken_on: string };

export function ProgressCompare({ photos }: { photos: Item[] }) {
  const usable = photos.filter((p) => p.url);
  const [beforeId, setBeforeId] = useState(usable[usable.length - 1]?.id ?? "");
  const [afterId, setAfterId] = useState(usable[0]?.id ?? "");
  const [reveal, setReveal] = useState(50);

  if (usable.length < 2) return null;

  const before = usable.find((p) => p.id === beforeId) ?? usable[usable.length - 1];
  const after = usable.find((p) => p.id === afterId) ?? usable[0];
  const fmt = (d: string) => new Intl.DateTimeFormat("pt-BR").format(new Date(d));

  const selectCls = "h-9 rounded border border-white/10 bg-[#0d0d0f] px-2 text-xs text-white focus:border-mh-red focus:outline-none";

  return (
    <div className="rounded-lg border border-white/10 bg-mh-surface p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-mh-muted">
          Antes
          <select value={beforeId} onChange={(e) => setBeforeId(e.target.value)} className={selectCls}>
            {usable.map((p) => <option key={p.id} value={p.id}>{fmt(p.taken_on)}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-mh-muted">
          Depois
          <select value={afterId} onChange={(e) => setAfterId(e.target.value)} className={selectCls}>
            {usable.map((p) => <option key={p.id} value={p.id}>{fmt(p.taken_on)}</option>)}
          </select>
        </label>
      </div>

      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before.url!} alt="Antes" className="absolute inset-0 size-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after.url!}
          alt="Depois"
          className="absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-white/80" style={{ left: `${reveal}%` }} />
        <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">Antes</span>
        <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">Depois</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={reveal}
        onChange={(e) => setReveal(Number(e.target.value))}
        aria-label="Comparar antes e depois"
        className="mt-3 w-full accent-mh-red"
      />
    </div>
  );
}
