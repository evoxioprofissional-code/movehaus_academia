import type { ReactNode } from "react";

export function EditorialPageHero({
  kicker,
  title,
  description,
  aside,
}: {
  kicker: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <header className="relative mb-10 overflow-hidden border-b border-white/10 pb-10 pt-5 sm:mb-12 sm:pb-12 sm:pt-8">
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-1 w-24 bg-mh-red sm:w-40"
      />
      <div
        aria-hidden="true"
        className="absolute -right-12 top-0 h-full w-40 skew-x-[-18deg] bg-white/[0.025]"
      />
      <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem] md:items-end">
        <div className="max-w-3xl">
          <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-mh-red">
            <span className="h-px w-8 bg-mh-red" aria-hidden="true" />
            {kicker}
          </p>
          <h1 className="font-display text-[clamp(2.9rem,8vw,5.8rem)] font-bold leading-[0.88] tracking-[-0.02em] text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            {description}
          </p>
        </div>
        {aside && (
          <div className="border-l-2 border-mh-red pl-4 text-sm leading-relaxed text-white/55">
            {aside}
          </div>
        )}
      </div>
    </header>
  );
}
