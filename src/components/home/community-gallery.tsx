"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhotoSlot } from "@/components/ui/photo-slot";
import type { MediaSlot } from "@/content/home";

type Item = { caption: string; tone: "dark" | "red"; media: MediaSlot };

export function CommunityGallery({ items }: { items: Item[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Setas — desktop */}
      <div className="pointer-events-none absolute -top-14 right-0 hidden gap-2 lg:flex">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scrollByCard(-1)}
          className="pointer-events-auto grid size-10 place-items-center rounded-full border border-mh-border text-mh-text transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Próximo"
          onClick={() => scrollByCard(1)}
          className="pointer-events-auto grid size-10 place-items-center rounded-full border border-mh-border text-mh-text transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {items.map((item, i) => (
          <figure
            key={i}
            data-card
            className="relative aspect-[3/4] w-[78%] shrink-0 snap-start overflow-hidden rounded-lg sm:w-[46%] lg:w-[31%]"
          >
            <PhotoSlot
              src={item.media.src}
              alt={item.media.alt}
              caption={item.media.caption}
              tone={item.tone}
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 31vw"
              className="absolute inset-0"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[15px] font-semibold leading-snug text-white">
                {item.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
