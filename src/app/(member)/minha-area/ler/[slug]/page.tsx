import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { EbookReader } from "@/components/customer/ebook-reader";
import { getProtectedEbook } from "@/lib/customer/data";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Leitor" };

function Aviso({
  icon: Icon,
  title,
  text,
  primary,
  secondary,
}: {
  icon: typeof Lock;
  title: string;
  text: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="grid size-14 place-items-center rounded-full border border-mh-red/30 bg-mh-red/10 text-mh-red">
        <Icon className="size-6" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-mh-muted">{text}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {primary && <Button asChild><Link href={primary.href}>{primary.label}</Link></Button>}
        {secondary && (
          <Button asChild variant="outline">
            <Link href={secondary.href}>
              <ArrowLeft className="size-4" />
              {secondary.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default async function ReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProtectedEbook(slug);
  if (!data) notFound(); // produto não existe

  if (data.denied) {
    return (
      <Aviso
        icon={Lock}
        title="Conteúdo ainda não liberado"
        text={`Você ainda não tem acesso a “${data.product.name}”. Esse conteúdo faz parte da biblioteca MoveHaus — garanta o seu acesso para começar a leitura.`}
        primary={{ href: `${data.product.type === "ebook" ? "/ebooks" : "/loja"}/${data.product.slug}`, label: "Ver na loja" }}
        secondary={{ href: "/minha-area", label: "Minha área" }}
      />
    );
  }

  if (data.chapters.length === 0) {
    return (
      <Aviso
        icon={Clock}
        title="Conteúdo em preparação"
        text={`“${data.product.name}” está liberado para você, mas os capítulos ainda estão sendo publicados. Assim que estiverem no ar, a leitura aparece aqui.`}
        secondary={{ href: "/minha-area", label: "Voltar para Minha área" }}
      />
    );
  }

  return (
    <EbookReader
      product={data.product}
      sectionLabel={data.product.type === "digital" ? "Aula ou material" : "Capítulo"}
      chapters={data.chapters}
      initialChapterId={data.progress?.chapter_id}
      watermark={data.watermark}
    />
  );
}
