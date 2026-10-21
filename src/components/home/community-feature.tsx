import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  kicker: string;
  title: string;
  text: string;
  caption: string;
  mainSrc: string;
  detailSrc: string;
};

export function CommunityFeature({
  kicker,
  title,
  text,
  caption,
  mainSrc,
  detailSrc,
}: Props) {
  return (
    <section aria-labelledby="community-title" className="scroll-mt-16 overflow-hidden bg-[#0b0c0e] text-white sm:grid sm:scroll-mt-[70px] sm:grid-cols-[74%_26%] xl:min-h-[600px] xl:grid-cols-[36%_46%_18%]">
      <div className="flex flex-col justify-center px-5 py-12 sm:col-span-2 sm:px-8 sm:py-14 xl:col-span-1 xl:px-[clamp(2rem,4.3vw,5.5rem)] xl:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-mh-red">
          {kicker}
        </p>
        <h2 id="community-title" className="mt-5 font-display text-[clamp(3.75rem,11vw,5.5rem)] font-bold leading-[0.94] tracking-tight xl:text-[clamp(4.5rem,6vw,7.2rem)]">
          {title.split("\n").map((line, index) => (
            <span key={index} className="block">{line}</span>
          ))}
        </h2>
        <p className="mt-6 max-w-[30rem] text-base leading-relaxed text-white/78 sm:text-xl xl:text-[clamp(1.15rem,1.5vw,1.75rem)]">
          {text}
        </p>
        <span aria-hidden="true" className="mt-7 h-1 w-14 bg-mh-red" />
        <Link href="/sobre" className="mt-7 inline-flex min-h-11 w-fit items-center gap-3 border-b border-white/70 text-base font-medium text-white transition-colors hover:border-mh-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mh-red sm:text-lg">
          Conhecer o clube <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative min-h-[350px] sm:min-h-[490px] xl:min-h-[600px]">
        <Image
          src={mainSrc}
          alt="Pessoas conversando após um treino"
          fill
          unoptimized={mainSrc.startsWith("http")}
          sizes="(max-width: 1279px) 100vw, 46vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent sm:hidden" />
        <p className="absolute bottom-5 left-5 text-sm font-medium text-white sm:hidden">{caption}</p>
      </div>

      <div className="relative hidden min-h-[490px] sm:block xl:min-h-[600px]">
        <Image
          src={detailSrc}
          alt="Mãos preparando anilhas para um treino"
          fill
          unoptimized={detailSrc.startsWith("http")}
          sizes="(max-width: 1279px) 100vw, 18vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-5 left-5 right-3 text-xs font-medium tracking-wide text-white/90 xl:text-sm">{caption}</p>
      </div>
    </section>
  );
}
