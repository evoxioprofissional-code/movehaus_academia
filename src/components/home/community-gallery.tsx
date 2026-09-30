import { PhotoSlot } from "@/components/ui/photo-slot";
import type { MediaSlot } from "@/content/home";

type Item = { caption: string; tone: "dark" | "red"; media: MediaSlot };

export function CommunityGallery({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.slice(0, 3).map((item) => (
        <figure key={item.caption} className="group relative aspect-[4/3] overflow-hidden rounded-lg sm:aspect-[4/5] lg:aspect-[4/3]">
          <PhotoSlot src={item.media.src} alt={item.media.alt} caption={item.media.caption} tone={item.tone} sizes="(max-width: 639px) 100vw, 33vw" className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.025]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-4"><p className="text-sm font-semibold leading-snug text-white">{item.caption}</p></figcaption>
          <span aria-hidden className="absolute left-0 top-0 h-12 w-1 bg-mh-red opacity-0 transition-opacity group-hover:opacity-100" />
        </figure>
      ))}
    </div>
  );
}
